// ===============================
// Guarda de segurança pros aliens desbloqueados no Upgraded Omnitrix
// ===============================
// A tecla N nativa do AlienEvo chama a ability fechada "alienevo:decouple"
// (vem de dentro do jar, sem código-fonte disponível pra editar). O FIX 1
// (enforce_upgraded_watch, em upgraded_omnitrix_decouple_fix.js) faz essa
// ability nativa reconhecer o Upgraded como um watch válido - mas a lógica
// interna dela parece assumir que só existe o Prototype e acaba limpando
// TODOS os aliens desbloqueados (mesma classe de bug que já corrigimos no
// failsafe.js, só que dessa vez fechada).
//
// Como não dá pra editar essa ability nativa diretamente, esse script faz
// um backup contínuo da lista de aliens (superpowers alienevo_aliens:*)
// enquanto o jogador está com o Upgraded Omnitrix equipado, e restaura
// automaticamente qualquer alien que sumir assim que detecta que o relógio
// saiu - não importa se foi pelo N nativo, pelo nosso decouple_omnitrix,
// ou qualquer outro caminho.
//
// FIX 1 (debounce): abilityUtil.hasPower pode retornar false por 1 tick só
// durante a animação de girar o dial (estado transitório do Palladium),
// mesmo com o relógio continuando equipado. Antes, isso era lido como
// "o relógio saiu" e o script restaurava/mexia no meio da animação,
// fazendo os aliens parecerem sumir visualmente. Agora só tratamos como
// "saiu de verdade" depois de 2 leituras consecutivas (1 segundo) sem o
// power - um flicker de 1 tick não passa mais disso.
//
// FIX 2 (wipe em pé, sem sair do upgraded): confirmado que a ability nativa
// pode limpar os superpowers alienevo_aliens:* SEM nunca tirar o player do
// estado "upgraded" (hasUpgraded continua true o tempo todo). O branch de
// restauração original só rodava na transição hasUpgraded true -> false,
// então esse tipo de wipe passava batido. Agora, mesmo com hasUpgraded
// true, o script compara a lista atual com o backup a cada leitura; se
// aliens do backup sumiram, conta 2 leituras seguidas confirmando (mesmo
// debounce anti-flicker do FIX 1) e restaura na hora, sem esperar sair do
// upgraded.
// ===============================

// DEBUG: confirma se as abilities registradas em addon/ (enforce_upgraded_watch,
// decouple_upgraded, enforce_upgraded_exclusivity) existem nesta sessão. Se elas
// não tiverem sido registradas (ex: só rodou /kubejs reload, sem reiniciar o jogo
// do zero), esse log mostra "false" e explica o bug sem precisar adivinhar.
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

            if (hasUpgraded) {
                let ids = palladium.powers.getPowerIds(player);
                let alienIds = ids
                    .map(id => id.toString())
                    .filter(id => id.startsWith('alienevo_aliens:') && id !== 'alienevo_aliens:all');

                console.log(`[OmniExpanded][DEBUG] ${player.name.string} | hasUpgraded=true | watch=${palladium.getProperty(player, 'watch')} | watch_namespace=${palladium.getProperty(player, 'watch_namespace')} | aliens_agora=${alienIds.length} | backup=${(player.persistentData.getString('omniexpanded_alien_backup') || '').split(',').filter(s => s.length > 0).length}`);

                let backup = player.persistentData.getString('omniexpanded_alien_backup');
                let backedUpAliens = backup ? backup.split(',').filter(s => s.length > 0) : [];
                let missingWhileEquipped = backedUpAliens.filter(id => alienIds.indexOf(id) === -1);

                if (missingWhileEquipped.length > 0 && backedUpAliens.length > 0) {
                    // lista atual está menor que o backup mesmo com o relógio equipado -
                    // pode ser wipe da ability nativa, ou só uma leitura ruim no meio de
                    // alguma outra animação. Confirma por 2 leituras seguidas antes de agir.
                    let wipeMissCount = player.persistentData.getInt('omniexpanded_equipped_miss_count') + 1;
                    player.persistentData.putInt('omniexpanded_equipped_miss_count', wipeMissCount);

                    if (wipeMissCount >= 2) {
                        console.log(`[OmniExpanded][DEBUG] WIPE detectado (equipado) em ${player.name.string}! Restaurando: ${missingWhileEquipped.join(', ')}`);
                        missingWhileEquipped.forEach(id => {
                            superpowerUtil.addSuperpower(player, new ResourceLocation(id));
                        });
                        player.persistentData.putInt('omniexpanded_equipped_miss_count', 0);
                    }
                } else {
                    player.persistentData.putInt('omniexpanded_equipped_miss_count', 0);

                    // lista íntegra (igual ou maior que o backup) - atualiza o backup normalmente
                    if (alienIds.length > 0) {
                        player.persistentData.putString('omniexpanded_alien_backup', alienIds.join(','));
                    }
                }

                // zera qualquer contagem de "saiu do upgraded" pendente
                player.persistentData.putInt('omniexpanded_miss_count', 0);
                player.persistentData.putBoolean('omniexpanded_had_upgraded', true);
            } else if (hadUpgraded) {
                // hasUpgraded veio false - pode ser saída real ou flicker da animação do dial.
                // Só confirma como "saiu de verdade" depois de 2 leituras seguidas assim.
                let missCount = player.persistentData.getInt('omniexpanded_miss_count') + 1;
                player.persistentData.putInt('omniexpanded_miss_count', missCount);

                if (missCount < 2) {
                    continue; // ainda não confirmado - ignora esse tick, não mexe em nada
                }

                // confirmado: o Upgraded Omnitrix realmente saiu (decouple, N nativo, evolução, etc.)
                let backup = player.persistentData.getString('omniexpanded_alien_backup');

                if (backup) {
                    let backedUpAliens = backup.split(',').filter(s => s.length > 0);
                    let currentIds = palladium.powers.getPowerIds(player).map(id => id.toString());

                    let missing = backedUpAliens.filter(id => currentIds.indexOf(id) === -1);

                    if (missing.length > 0) {
                        console.log(`[OmniExpanded][DEBUG] WIPE detectado (ao sair) em ${player.name.string}! Restaurando: ${missing.join(', ')}`);
                        missing.forEach(id => {
                            superpowerUtil.addSuperpower(player, new ResourceLocation(id));
                        });
                    }
                }

                player.persistentData.putBoolean('omniexpanded_had_upgraded', false);
                player.persistentData.putInt('omniexpanded_miss_count', 0);
            }
        } catch (error) {
            console.log(`[OmniExpanded][DEBUG] ERRO no alien_guard pra ${player.name.string}: ${error}`);
        }
    }
});