// ===============================
// Upgraded Omnitrix conta como um superpower completo por conta própria:
// o Prototype Omnitrix (alienevo:prototype_omnitrix) e o Upgraded Omnitrix
// (omniexpanded:upgraded_omnitrix) nunca podem estar ativos ao mesmo tempo.
//
// upgraded_omnitrix_item.json já bloqueia vestir o Upgraded se o jogador
// tiver o Prototype. Isso cobre o caminho normal (botão direito com o item
// na mão), mas não cobre o caso do jogador já estar com o Upgraded vestido
// e, por qualquer outro caminho (comando, outro item, etc.), acabar
// recebendo a superpower do Prototype também. Essa ability fica de olho
// nisso enquanto o Upgraded Omnitrix está ativo e desfaz a duplicidade
// automaticamente, devolvendo o Prototype Omnitrix pro inventário do
// jogador (igual ao decouple normal faria com o próprio item).
// ===============================

StartupEvents.registry('palladium:abilities', event => {
    event.create('omniexpanded:enforce_upgraded_exclusivity')
        .icon(palladium.createItemIcon('alienevo:upgraded_omnitrix'))
        .addProperty('property', 'string', 'omniexpandedenforceexclusivity', '')
        .tick((entity, entry, holder, enabled) => {
            if (!enabled) return;
            if (!entity.persistentData) return;

            // só reage se o jogador tiver as duas superpowers ativas ao mesmo tempo
            if (!abilityUtil.hasPower(entity, 'alienevo:prototype_omnitrix')) return;

            // trava simples pra não disparar em loop no mesmo tick/vizinhos
            if (entity.persistentData.getBoolean('omniexpanded_resolving_exclusivity')) return;
            entity.persistentData.putBoolean('omniexpanded_resolving_exclusivity', true);

            try {
                var username = entity.getGameProfile().getName();

                // desliga o Prototype (o Upgraded continua ativo, já que ele é quem
                // conta como o superpower "completo")
                superpowerUtil.removeSuperpower(entity, new ResourceLocation('alienevo:prototype_omnitrix'));

                // devolve o item do Prototype pro jogador, do mesmo jeito que um
                // decouple normal devolveria
                entity.server.runCommandSilent('give ' + username + ' alienevo:prototype_omnitrix 1');

                // Sem arquivo de lang próprio no addon pra essa mensagem, então
                // manda direto (evita mostrar a chave de tradução crua caso a
                // entrada nunca seja adicionada em nenhum en_us.json).
                entity.tell('§eThe Upgraded Omnitrix can\'t be worn together with the Prototype Omnitrix. Your Prototype Omnitrix was returned to your inventory.');

                entity.playSound('minecraft:entity.item.pickup', 0.6, 1.2);
            } finally {
                entity.persistentData.putBoolean('omniexpanded_resolving_exclusivity', false);
            }
        });
});