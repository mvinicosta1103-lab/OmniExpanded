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
// ===============================

ServerEvents.tick(event => {
    if (event.server.tickCount % 10 !== 0) return; // roda 2x por segundo

    let players = event.server.getPlayerList().getPlayers();

    for (let player of players) {
        try {
            let hasUpgraded = abilityUtil.hasPower(player, 'omniexpanded:upgraded_omnitrix');
            let hadUpgraded = player.persistentData.getBoolean('omniexpanded_had_upgraded');

            if (hasUpgraded) {
                // backup contínuo enquanto o relógio está equipado
                let ids = palladium.powers.getPowerIds(player);
                let alienIds = ids
                    .map(id => id.toString())
                    .filter(id => id.startsWith('alienevo_aliens:') && id !== 'alienevo_aliens:all');

                if (alienIds.length > 0) {
                    player.persistentData.putString('omniexpanded_alien_backup', alienIds.join(','));
                }

                player.persistentData.putBoolean('omniexpanded_had_upgraded', true);
            } else if (hadUpgraded) {
                // o Upgraded Omnitrix acabou de sair (decouple, N nativo, evolução, etc.)
                let backup = player.persistentData.getString('omniexpanded_alien_backup');

                if (backup) {
                    let backedUpAliens = backup.split(',').filter(s => s.length > 0);
                    let currentIds = palladium.powers.getPowerIds(player).map(id => id.toString());

                    let missing = backedUpAliens.filter(id => currentIds.indexOf(id) === -1);

                    if (missing.length > 0) {
                        missing.forEach(id => {
                            superpowerUtil.addSuperpower(player, new ResourceLocation(id));
                        });
                    }
                }

                player.persistentData.putBoolean('omniexpanded_had_upgraded', false);
            }
        } catch (error) {
        }
    }
});