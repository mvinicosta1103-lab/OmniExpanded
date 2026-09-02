// ===============================
// Guarda de segurança pros aliens desbloqueados no Upgraded Omnitrix
// ===============================
// DESCOBERTA 1 (log de debug v2): aliens_agora=0 e backup=0 desde o
// PRIMEIRO tick em que o guard via hasUpgraded=true. Ou seja, o wipe não
// acontece enquanto o relógio já está equipado (tecla N, decouple, etc) -
// ele acontece no exato momento em que o Upgraded Omnitrix é ACOPLADO
// (alienevo:couple / dna_bond), antes do guard sequer rodar seu primeiro
// tick de 0.5s. Como o backup só era feito ENQUANTO hasUpgraded=true, ele
// nunca tinha nada útil pra restaurar - o wipe já tinha acontecido antes.
// FIX 3: o backup passou a rodar SEMPRE (Prototype, Upgraded ou nenhum
// omnitrix), guardando a última lista de alienevo_aliens:* não-vazia.
//
// DESCOBERTA 2 (log de debug v3, cenário com morte): mesmo com o FIX 3,
// o backup continuava sempre em 0, mesmo com aliens_agora=1 por 10+
// segundos seguidos sem nenhuma troca de relógio no meio. Causa: o
// jogador tinha MORRIDO antes desse trecho do log. `player.persistentData`
// no Forge é dado preso à ENTIDADE do jogador - por padrão ele NAO
// sobrevive à morte, porque o respawn cria uma entidade nova e esse NBT
// customizado não é copiado automaticamente (só sobrevive se um mod
// tratar isso manualmente via PlayerEvent.Clone). Resultado: todo backup
// feito antes de morrer desaparecia igual aos aliens, e o próprio guard
// ficava "cego" bem na hora que mais precisava funcionar.
//
// FIX 4: o backup agora fica em `event.server.persistentData` (dado preso
// ao SERVIDOR/mundo, não à entidade), guardado num mapa por UUID do
// jogador. Isso sobrevive à morte, ao respawn, e até a trocar de
// dimensão - só reseta se o mundo inteiro for resetado.
// ===============================

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

// Helpers pra ler/escrever no persistentData do SERVIDOR (event.server.persistentData),
// namespaced por UUID do jogador - isso sobrevive à morte/respawn, diferente de
// player.persistentData (que é preso à entidade e some quando ela é recriada).
function getServerString(server, key, fallback) {
    let val = server.persistentData.getString(key);
    return (val === undefined || val === null || val === '') ? (fallback === undefined ? '' : fallback) : val;
}
function getServerInt(server, key) {
    return server.persistentData.getInt(key) || 0;
}
function getServerBoolean(server, key) {
    return !!server.persistentData.getBoolean(key);
}

ServerEvents.tick(event => {
    if (event.server.tickCount % 10 !== 0) return; // roda 2x por segundo

    let players = event.server.getPlayerList().getPlayers();
    let serverData = event.server.persistentData;

    for (let player of players) {
        try {
            let uuid = player.uuid.toString();
            let kBackup = `omniexpanded_alien_backup_${uuid}`;
            let kHadUpgraded = `omniexpanded_had_upgraded_${uuid}`;
            let kMissCount = `omniexpanded_miss_count_${uuid}`;
            let kEquippedMissCount = `omniexpanded_equipped_miss_count_${uuid}`;

            let hasUpgraded = abilityUtil.hasPower(player, 'omniexpanded:upgraded_omnitrix');
            let hadUpgraded = getServerBoolean(event.server, kHadUpgraded);

            // Sempre lê a lista atual de aliens, não importa o estado do omnitrix
            let alienIds = palladium.powers.getPowerIds(player)
                .map(id => id.toString())
                .filter(id => id.startsWith('alienevo_aliens:') && id !== 'alienevo_aliens:all');

            let backup = getServerString(event.server, kBackup);
            let backedUpAliens = backup ? backup.split(',').filter(s => s.length > 0) : [];

            console.log(`[OmniExpanded][DEBUG] ${player.name.string} | hasUpgraded=${hasUpgraded} | watch=${palladium.getProperty(player, 'watch')} | aliens_agora=${alienIds.length} | backup=${backedUpAliens.length}`);

            // Acabou de equipar o Upgraded (ou já está com ele) com a lista zerada,
            // mas existe um backup de antes - restaura na hora, sem debounce, porque
            // esse caso não tem flicker: é sempre zero no instante do equip.
            if (hasUpgraded && alienIds.length === 0 && backedUpAliens.length > 0) {
                console.log(`[OmniExpanded][DEBUG] WIPE no equip detectado em ${player.name.string}! Restaurando: ${backedUpAliens.join(', ')}`);
                backedUpAliens.forEach(id => {
                    superpowerUtil.addSuperpower(player, new ResourceLocation(id));
                });
                // recalcula pra seguir com a lista já restaurada nesse mesmo tick
                alienIds = backedUpAliens.slice();
            } else if (hasUpgraded && backedUpAliens.length > 0) {
                // guarda equipado, mas lista atual menor que o backup (wipe parcial
                // enquanto já estava equipado) - mesmo tratamento com debounce de antes
                let missingWhileEquipped = backedUpAliens.filter(id => alienIds.indexOf(id) === -1);
                if (missingWhileEquipped.length > 0) {
                    let wipeMissCount = getServerInt(event.server, kEquippedMissCount) + 1;
                    serverData.putInt(kEquippedMissCount, wipeMissCount);

                    if (wipeMissCount >= 2) {
                        console.log(`[OmniExpanded][DEBUG] WIPE parcial (equipado) em ${player.name.string}! Restaurando: ${missingWhileEquipped.join(', ')}`);
                        missingWhileEquipped.forEach(id => {
                            superpowerUtil.addSuperpower(player, new ResourceLocation(id));
                        });
                        serverData.putInt(kEquippedMissCount, 0);
                        alienIds = alienIds.concat(missingWhileEquipped);
                    }
                } else {
                    serverData.putInt(kEquippedMissCount, 0);
                }
            }

            // Atualiza o backup sempre que a lista atual não estiver vazia,
            // não importa se está com o Prototype, o Upgraded ou nenhum relógio.
            if (alienIds.length > 0) {
                serverData.putString(kBackup, alienIds.join(','));
            }

            if (hasUpgraded) {
                serverData.putInt(kMissCount, 0);
                serverData.putBoolean(kHadUpgraded, true);
            } else if (hadUpgraded) {
                // saída do upgraded com debounce de 2 leituras (evita flicker do dial)
                let missCount = getServerInt(event.server, kMissCount) + 1;
                serverData.putInt(kMissCount, missCount);

                if (missCount < 2) {
                    continue;
                }

                let currentIds = palladium.powers.getPowerIds(player).map(id => id.toString());
                let backup2 = getServerString(event.server, kBackup);
                let backedUpAliens2 = backup2 ? backup2.split(',').filter(s => s.length > 0) : [];
                let missing = backedUpAliens2.filter(id => currentIds.indexOf(id) === -1);

                if (missing.length > 0) {
                    console.log(`[OmniExpanded][DEBUG] WIPE detectado (ao sair) em ${player.name.string}! Restaurando: ${missing.join(', ')}`);
                    missing.forEach(id => {
                        superpowerUtil.addSuperpower(player, new ResourceLocation(id));
                    });
                }

                serverData.putBoolean(kHadUpgraded, false);
                serverData.putInt(kMissCount, 0);
            }
        } catch (error) {
            console.log(`[OmniExpanded][DEBUG] ERRO no alien_guard pra ${player.name.string}: ${error}`);
        }
    }
});