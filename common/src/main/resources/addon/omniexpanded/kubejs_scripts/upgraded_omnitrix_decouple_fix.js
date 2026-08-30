// ===============================
// FIX 1 - Sincroniza a propriedade "watch"
// ===============================
// dna_bond (upgraded_omnitrix_item.json) só roda comandos de texto: ele dá
// "superpower add omniexpanded:upgraded_omnitrix @s", mas NUNCA seta a
// propriedade "watch" pra "upgraded" (isso só é possível via JS, e hoje só
// evolve_upgraded_omnitrix.js faz isso, no caminho de evolução a partir do
// Prototype). Quem crafta/veste o Upgraded direto fica com a superpower
// ativa mas "watch" desatualizado, e é isso que faz o alienevo:decouple
// (chamado pelo N) não reconhecer o Upgraded como algo que ele sabe tirar.
//
// Essa ability roda em tick enquanto omniexpanded:upgraded_omnitrix estiver
// ativa e garante "watch" = "upgraded" o tempo todo, cobrindo os dois
// caminhos (evolução e bond direto).
StartupEvents.registry('palladium:abilities', event => {
    event.create('omniexpanded:enforce_upgraded_watch')
        .icon(palladium.createItemIcon('alienevo:upgraded_omnitrix'))
        .addProperty('property', 'string', 'omniexpandedenforceupgradedwatch', '')
        .tick((entity, entry, holder, enabled) => {
            if (!enabled) return;
            if (!entity.persistentData) return;

            let watch = palladium.getProperty(entity, 'watch');
            if (watch !== 'upgraded') {
                palladium.setProperty(entity, 'watch', 'upgraded');
            }

            // power_ui.js monta a aba do relógio como
            // `${watch_namespace}:${watch}_omnitrix` e compara com o ID real
            // da superpower (omniexpanded:upgraded_omnitrix). watch_namespace
            // tem default "alienevo" pra todo mundo (palladium_properties.js),
            // e nada no addon nunca troca ele pra "omniexpanded" - por isso
            // essa comparação nunca batia e os módulos de cor (Glow/Primary/
            // Secondary) do Upgraded nunca apareciam.
            let watchNamespace = palladium.getProperty(entity, 'watch_namespace');
            if (watchNamespace !== 'omniexpanded') {
                palladium.setProperty(entity, 'watch_namespace', 'omniexpanded');
            }
        });
});

// ===============================
// FIX 2 - Decouple próprio do Upgraded Omnitrix
// ===============================
// Caso o FIX 1 sozinho não seja suficiente (ex: alienevo:decouple tiver
// alguma checagem hardcoded só pro alienevo:prototype_omnitrix, além do
// "watch"), essa ability substitui o alienevo:decouple especificamente pra
// decouple_omnitrix do Upgraded.
//
// O que ela faz ao ser ativada pelo key_bind:
// - Remove a superpower omniexpanded:upgraded_omnitrix do jogador.
// - Limpa os scoreboards/tags de estado (RemovedCore, SelfDestruct, timers
//   etc.) pra não sobrar lixo de uma sessão anterior quando o jogador
//   voltar a vestir o relógio depois.
// - NÃO dá o item de volta: o item físico nunca é removido do inventário
//   no dna_bond (diferente do couple do Prototype), então ele já está com
//   o jogador o tempo todo. Dar o item de novo aqui é justamente o que
//   causava a clonagem.
//
// Trava com persistentData (mesmo padrão de upgraded_omnitrix_exclusivity.js
// e evolve_upgraded_omnitrix.js) pra não disparar mais de uma vez no mesmo
// tick/vizinhos.
StartupEvents.registry('palladium:abilities', event => {
    event.create('omniexpanded:decouple_upgraded')
        .icon(palladium.createItemIcon('omniexpanded:textures/gui/upgraded/decouple.png'))
        .addProperty('property', 'string', 'omniexpandeddecoupleupgraded', '')
        .tick((entity, entry, holder, enabled) => {
            if (!enabled) return;
            if (!entity.persistentData) return;

            if (entity.persistentData.getBoolean('omniexpanded_decoupling_upgraded')) return;
            entity.persistentData.putBoolean('omniexpanded_decoupling_upgraded', true);

            try {
                if (!abilityUtil.hasPower(entity, 'omniexpanded:upgraded_omnitrix')) return;

                var username = entity.getGameProfile().getName();

                entity.server.runCommandSilent('playsound alienevo:upgraded_decouple master @s ~ ~ ~');

                // limpa estado pra não sobrar lixo de sessão anterior
                entity.server.runCommandSilent('tag ' + username + ' remove AlienEvo.RemovedCore');
                entity.server.runCommandSilent('tag ' + username + ' remove AlienEvo.MasterControlAnim');
                entity.server.runCommandSilent('tag ' + username + ' remove AlienEvo.ZeroOutAnim');
                entity.server.runCommandSilent('scoreboard players set ' + username + ' AlienEvo.SelfDestruct 0');
                entity.server.runCommandSilent('scoreboard players set ' + username + ' AlienEvo.Timer 0');

                // desliga a superpower - sem devolver item, já que ele nunca
                // saiu do inventário do jogador
                superpowerUtil.removeSuperpower(entity, new ResourceLocation('omniexpanded:upgraded_omnitrix'));

            } finally {
                entity.persistentData.putBoolean('omniexpanded_decoupling_upgraded', false);
            }
        });
});