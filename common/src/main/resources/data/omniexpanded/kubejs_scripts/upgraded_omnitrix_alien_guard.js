// ===============================
// Guarda de segurança pros aliens desbloqueados no Upgraded Omnitrix
// ===============================
// HISTÓRICO (v1-v4): tentamos backupar a superpower alienevo_aliens:*
// (via palladium.powers.getPowerIds), achando que ela representava os
// aliens "desbloqueados" do jogador.
//
// DESCOBERTA FINAL (lendo o código-fonte do jar AlienEvo, transform.js e
// detransform.js): a superpower alienevo_aliens:<nome> só existe ENQUANTO
// o jogador está literalmente transformado naquele alien. O próprio
// detransform.js roda `superpower remove alienevo_aliens:all` assim que
// ele destransforma (linhas 86-106 do detransform.js). Ou seja,
// aliens_agora=0 quase o tempo inteiro é o comportamento NORMAL (jogador
// em forma humana), não um wipe.
//
// O dado que realmente representa "quais aliens o jogador pode usar" é
// o mapa de slots `alienevo.alien_<playlist>_<slot>` (até 10x10 = 100
// chaves) em player.persistentData - é isso que quick_change.js e
// transform.js leem pra saber pra quem transformar. E o
// evolve_upgraded_omnitrix.js do nosso addon NÃO mexe nesses slots, só
// troca a superpower do relógio (prototype_omnitrix -> upgraded_omnitrix)
// e o item físico - então a troca de relógio, por si só, não deveria
// apagar esse mapa.
//
// O risco real (igual ao que motivou o FIX 4 antigo) é player.persistentData
// não sobreviver à morte/respawn do Forge, a menos que algo trate isso via
// PlayerEvent.Clone. Esse guard agora faz o backup/restore desse mapa de
// slots (não mais da superpower), guardado em event.server.persistentData
// por UUID - que sobrevive à morte, respawn e troca de dimensão.
//
// O fix do placar AlienEvo.PrototypeSkillP (cadeados) continua igual,
// já confirmado funcionando pelos logs.
//
// FIX 6: quem equipa o Upgraded Omnitrix e nunca teve nenhum slot
// preenchido (nem agora, nem no backup) recebe automaticamente o codex
// base de 10 aliens clássicos (alien_codex.js, números 1-10) na
// playlist 1, slots 1-10 - sem precisar desbloquear na mão. Só roda uma
// vez por jogador (na primeira vez que o mapa de slots dele aparece
// totalmente vazio com o Upgraded equipado); depois disso os slots
// dele já existem e o backup/restore normal cuida do resto.
// ===============================
const MIN_PROTOTYPE_SKILL_POINTS = 5; // acima do maior threshold (2), com folga
const MAX_PLAYLISTS = 10;
const MAX_SLOTS = 10;
// Codex base (alien_codex.js, números 1-10): heatblast, wildmutt,
// diamondhead, xlr8, greymatter, fourarms, stinkfly, ripjaws, upgrade,
// ghostfreak - nessa ordem, plantados na playlist 1 slots 1-10.
const DEFAULT_CODEX_ALIENS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

ServerEvents.loaded(event => {
    try {
        let abilityRegistry = event.server.registryAccess()
            .registryOrThrow(Java.loadClass('net.threetag.palladium.registry.PalladiumRegistries').ABILITY_SERIALIZER);
        let ids = ['omniexpanded:enforce_upgraded_watch', 'omniexpanded:decouple_upgraded', 'omniexpanded:enforce_upgraded_exclusivity'];
        ids.forEach(id => {
            let present = abilityRegistry.containsKey(new ResourceLocation(id));
            console.log(`[OmniExpanded][DEBUG] ability registrada? ${id} -> ${present}`);
        });
    } catch (error) {
        console.log('[OmniExpanded][DEBUG] nao consegui checar o registry de abilities: ' + error);
    }
});

// Lê todos os slots preenchidos (1..MAX_PLAYLISTS x 1..MAX_SLOTS) do jogador,
// devolvendo um array de pares "playlist_slot:alienNum" só pros que tem
// algum alien de verdade (> 0).
function readPlayerSlots(player) {
    let filled = [];
    for (let p = 1; p <= MAX_PLAYLISTS; p++) {
        for (let s = 1; s <= MAX_SLOTS; s++) {
            let key = `alienevo.alien_${p}_${s}`;
            let value = player.persistentData.getInt(key) || 0;
            if (value > 0) {
                filled.push(`${p}_${s}:${value}`);
            }
        }
    }
    return filled;
}

// Escreve de volta um array no formato "p_s:alienNum" nos slots do jogador.
function writePlayerSlots(player, entries) {
    entries.forEach(entry => {
        let [pos, alienNum] = entry.split(':');
        let key = `alienevo.alien_${pos}`;
        player.persistentData.putInt(key, parseInt(alienNum, 10));
    });
}

function getServerString(server, key, fallback) {
    let val = server.persistentData.getString(key);
    return (val === undefined || val === null || val === '') ? (fallback === undefined ? '' : fallback) : val;
}

// Planta o codex base (playlist 1, slots 1-10) no jogador e devolve os
// pares "p_s:alienNum" plantados, no mesmo formato usado pelo backup.
function seedDefaultCodex(player) {
    let seeded = [];
    DEFAULT_CODEX_ALIENS.forEach((alienNum, index) => {
        let slot = index + 1; // slot 1..10
        player.persistentData.putInt(`alienevo.alien_1_${slot}`, alienNum);
        seeded.push(`1_${slot}:${alienNum}`);
    });
    return seeded;
}

ServerEvents.tick(event => {
    if (event.server.tickCount % 10 !== 0) return; // roda 2x por segundo

    let players = event.server.getPlayerList().getPlayers();
    let serverData = event.server.persistentData;

    for (let player of players) {
        try {
            let uuid = player.uuid.toString();
            let kBackup = `omniexpanded_alien_slots_backup_${uuid}`;

            // Garante que o placar de pontos nunca fique abaixo do necessário
            // pras abilities do Upgraded Omnitrix ficarem destravadas - sem isso,
            // aparecem os cadeados até alguém rodar /alienevoautoadd manualmente.
            let skillPoints = palladium.scoreboard.getScore(player, 'AlienEvo.PrototypeSkillP', 0);
            if (skillPoints < MIN_PROTOTYPE_SKILL_POINTS) {
                console.log(`[OmniExpanded][DEBUG] AlienEvo.PrototypeSkillP baixo (${skillPoints}) em ${player.name.string} - repondo pra ${MIN_PROTOTYPE_SKILL_POINTS}`);
                palladium.scoreboard.setScore(player, 'AlienEvo.PrototypeSkillP', MIN_PROTOTYPE_SKILL_POINTS);
            }

            // Lê o mapa de slots atual (o dado real de "quais aliens o jogador
            // pode transformar", independente de estar transformado agora ou não).
            let currentSlots = readPlayerSlots(player);

            let backupRaw = getServerString(event.server, kBackup);
            let backedUpSlots = backupRaw ? backupRaw.split(',').filter(s => s.length > 0) : [];

            console.log(`[OmniExpanded][DEBUG] ${player.name.string} | watch=${palladium.getProperty(player, 'watch')} | slots_agora=${currentSlots.length} | backup=${backedUpSlots.length}`);

            // FIX 6: primeira vez com o Upgraded e sem nenhum slot (nem agora,
            // nem no backup) - planta o codex base automaticamente.
            let hasUpgraded = abilityUtil.hasPower(player, 'omniexpanded:upgraded_omnitrix');
            if (hasUpgraded && currentSlots.length === 0 && backedUpSlots.length === 0) {
                console.log(`[OmniExpanded][DEBUG] Plantando codex base (aliens 1-10) em ${player.name.string}`);
                currentSlots = seedDefaultCodex(player);
            }

            // Mapa zerado mas existe backup - restaura os slots perdidos
            // (ex: morte que não preservou persistentData da entidade).
            if (currentSlots.length === 0 && backedUpSlots.length > 0) {
                console.log(`[OmniExpanded][DEBUG] WIPE de slots detectado em ${player.name.string}! Restaurando: ${backedUpSlots.join(', ')}`);
                writePlayerSlots(player, backedUpSlots);
                currentSlots = backedUpSlots.slice();
            } else if (backedUpSlots.length > 0) {
                // mapa não zerado, mas com slots faltando em relação ao backup -
                // restaura só o que sumiu, sem mexer no resto.
                let currentPositions = currentSlots.map(e => e.split(':')[0]);
                let missing = backedUpSlots.filter(e => currentPositions.indexOf(e.split(':')[0]) === -1);
                if (missing.length > 0) {
                    console.log(`[OmniExpanded][DEBUG] WIPE parcial de slots em ${player.name.string}! Restaurando: ${missing.join(', ')}`);
                    writePlayerSlots(player, missing);
                    currentSlots = currentSlots.concat(missing);
                }
            }

            // Atualiza o backup sempre que o mapa atual não estiver vazio.
            if (currentSlots.length > 0) {
                serverData.putString(kBackup, currentSlots.join(','));
            }
        } catch (error) {
            console.log(`[OmniExpanded][DEBUG] ERRO no alien_guard pra ${player.name.string}: ${error}`);
        }
    }
});