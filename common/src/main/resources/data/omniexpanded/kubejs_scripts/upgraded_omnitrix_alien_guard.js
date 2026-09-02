// ===============================
// Guarda de segurança pros aliens desbloqueados no Upgraded Omnitrix
// ===============================
// DESCOBERTA (via log de debug): aliens_agora=0 e backup=0 desde o
// PRIMEIRO tick em que o guard via hasUpgraded=true. Ou seja, o wipe não
// acontece enquanto o relógio já está equipado (tecla N, decouple, etc) -
// ele acontece no exato momento em que o Upgraded Omnitrix é ACOPLADO
// (alienevo:couple / dna_bond), antes do guard sequer rodar seu primeiro
// tick de 0.5s. Como o backup só era feito ENQUANTO hasUpgraded=true, ele
// nunca tinha nada útil pra restaurar - o wipe já tinha acontecido antes.
//
// FIX 3: agora o backup roda SEMPRE (não importa se o jogador está com o
// Prototype, o Upgraded, ou nenhum omnitrix), guardando a última lista de
// alienevo_aliens:* não-vazia que existiu. Assim, quando detectamos que o
// Upgraded acabou de ser equipado com a lista já zerada, já temos um
// backup de ANTES da troca pra restaurar na hora - sem precisar esperar
// nenhum debounce, porque nesse caso não tem flicker envolvido: é sempre
// zero no instante do equip.
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

ServerEvents.tick(event => {
    if (event.server.tickCount % 10 !== 0) return; // roda 2x por segundo

    let players = event.server.getPlayerList().getPlayers();

    for (let player of players) {
        try {
            let hasUpgraded = abilityUtil.hasPower(player, 'omniexpanded:upgraded_omnitrix');
            let hadUpgraded = player.persistentData.getBoolean('omniexpanded_had_upgraded');

            // Sempre lê a lista atual de aliens, não importa o estado do omnitrix
            let alienIds = palladium.powers.getPowerIds(player)
                .map(id => id.toString())
                .filter(id => id.startsWith('alienevo_aliens:') && id !== 'alienevo_aliens:all');

            let backup = player.persistentData.getString('omniexpanded_alien_backup');
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
                    let wipeMissCount = player.persistentData.getInt('omniexpanded_equipped_miss_count') + 1;
                    player.persistentData.putInt('omniexpanded_equipped_miss_count', wipeMissCount);

                    if (wipeMissCount >= 2) {
                        console.log(`[OmniExpanded][DEBUG] WIPE parcial (equipado) em ${player.name.string}! Restaurando: ${missingWhileEquipped.join(', ')}`);
                        missingWhileEquipped.forEach(id => {
                            superpowerUtil.addSuperpower(player, new ResourceLocation(id));
                        });
                        player.persistentData.putInt('omniexpanded_equipped_miss_count', 0);
                        alienIds = alienIds.concat(missingWhileEquipped);
                    }
                } else {
                    player.persistentData.putInt('omniexpanded_equipped_miss_count', 0);
                }
            }

            // Atualiza o backup sempre que a lista atual não estiver vazia,
            // não importa se está com o Prototype, o Upgraded ou nenhum relógio.
            if (alienIds.length > 0) {
                player.persistentData.putString('omniexpanded_alien_backup', alienIds.join(','));
            }

            if (hasUpgraded) {
                player.persistentData.putInt('omniexpanded_miss_count', 0);
                player.persistentData.putBoolean('omniexpanded_had_upgraded', true);
            } else if (hadUpgraded) {
                // saída do upgraded com debounce de 2 leituras (evita flicker do dial)
                let missCount = player.persistentData.getInt('omniexpanded_miss_count') + 1;
                player.persistentData.putInt('omniexpanded_miss_count', missCount);

                if (missCount < 2) {
                    continue;
                }

                let currentIds = palladium.powers.getPowerIds(player).map(id => id.toString());
                let backup2 = player.persistentData.getString('omniexpanded_alien_backup');
                let backedUpAliens2 = backup2 ? backup2.split(',').filter(s => s.length > 0) : [];
                let missing = backedUpAliens2.filter(id => currentIds.indexOf(id) === -1);

                if (missing.length > 0) {
                    console.log(`[OmniExpanded][DEBUG] WIPE detectado (ao sair) em ${player.name.string}! Restaurando: ${missing.join(', ')}`);
                    missing.forEach(id => {
                        superpowerUtil.addSuperpower(player, new ResourceLocation(id));
                    });
                }

                player.persistentData.putBoolean('omniexpanded_had_upgraded', false);
                player.persistentData.putInt('omniexpanded_miss_count', 0);
            }
        } catch (error) {
            console.log(`[OmniExpanded][DEBUG] ERRO no alien_guard pra ${player.name.string}: ${error}`);
        }
    }
});