// ===============================
// Evolução Prototype Omnitrix -> Upgraded Omnitrix (via Galvanic Mechamorph)
// - Não usa comandos crus pra trocar a superpower: usa o mesmo sistema
//   universal do decouple.js (watch property + superpowerUtil), pra não
//   quebrar o couple/decouple depois e pra não resetar os aliens do jogador
//   (aliens ficam salvos no persistentData do JOGADOR, não no item).
// ===============================

StartupEvents.registry('palladium:abilities', event => {
    event.create('omniexpanded:evolve_upgraded_omnitrix')
        .icon(palladium.createItemIcon('alienevo:upgraded_omnitrix'))
        .addProperty('property', 'string', 'omniexpandedevolveupgraded', '')
        .tick((entity, entry, holder, enabled) => {
            if (!enabled) return;

            // trava simples pra não disparar de novo enquanto ainda está no meio da troca
            if (entity.persistentData.getBoolean('omniexpanded_evolving')) return;
            entity.persistentData.putBoolean('omniexpanded_evolving', true);

            try {
                var username = entity.getGameProfile().getName();

                entity.server.runCommandSilent('playsound alienevo:prototype_recharge master @a');

                // sai da forma do Galvanic Mechamorph
                superpowerUtil.removeSuperpower(entity, new ResourceLocation('alienevo_aliens:galvanic_mechamorph'));

                // desliga o Prototype (superpower real do jar)
                superpowerUtil.removeSuperpower(entity, new ResourceLocation('alienevo:prototype_omnitrix'));

                // some com o item físico do Prototype e dá o Upgraded
                entity.server.runCommandSilent('clear ' + username + ' alienevo:prototype_omnitrix 1');
                entity.server.runCommandSilent('give ' + username + ' alienevo:upgraded_omnitrix');

                // é o passo que o couple normalmente faz e que os comandos crus não faziam:
                // sem isso, decouple/glow/etc continuam achando que o relógio é o "prototype"
                palladium.setProperty(entity, 'watch', 'upgraded');
                // watch_namespace precisa virar "omniexpanded" também, senão
                // power_ui.js continua comparando contra "alienevo:upgraded_omnitrix"
                // (que não existe) em vez do ID real da superpower
                // (omniexpanded:upgraded_omnitrix), e os módulos de cor do
                // relógio (Glow/Primary/Secondary) somem da tela.
                palladium.setProperty(entity, 'watch_namespace', 'omniexpanded');

                // liga a superpower do Upgraded (mesma convenção de nome que o resto do addon usa:
                // alienevo:<prefixo>_omnitrix, senão o decouple.js não reconhece o watch)
                superpowerUtil.addSuperpower(entity, new ResourceLocation('omniexpanded:upgraded_omnitrix'));

                // FIX 7: o quick change por TECLA (bindtransform + QUICKCHANGE01-10)
                // trava 100% na tag AlienEvo.MasterControl (quick_change.js linha 132),
                // sem nenhum fallback por watch equipado - diferente da roda do mouse,
                // que já libera sozinha via a superpower alienevo:quick_change (que o
                // Upgraded já concede no JSON dele). Pra quem evolui pro Upgraded ter
                // quick change por tecla também, sem precisar rodar /mastercontrol na
                // mão, a gente dá a tag junto aqui - mesma tag que a workbench já usa
                // pra esse fim em outro fluxo (workbench.js).
                entity.server.runCommandSilent('tag ' + username + ' add AlienEvo.MasterControl');

            } finally {
                entity.persistentData.putBoolean('omniexpanded_evolving', false);
            }
        });
});