/**
 * remote_alien_bridge.js
 * -----------------------------------------------------------------------
 * Ponte "remota" entre o Upgraded Omnitrix (Alien Guard) e o AlienEvo.
 *
 * Coloque este arquivo em:
 *   common/src/main/resources/addon/<seu_addon_id>/kubejs_scripts/
 * (no lugar do "alien_codex.js" duplicado — apague o duplicado!)
 *
 * Por que isso resolve o problema de FPS:
 *   O KubeJS mescla os scripts do mesmo tipo (client/server) de TODOS os
 *   mods/addons carregados num único contexto JS. Isso significa que as
 *   variáveis global.alienevo_* que o próprio AlienEvo já define ficam
 *   acessíveis aqui sem precisar redeclarar nada. Duplicar o codex não
 *   deixava os dados mais rápidos de acessar — só fazia o motor JS
 *   reprocessar tudo de novo, e se você também duplicou hooks de
 *   tick/render (tipo os do power_ui.js), o mesmo cálculo pesado de
 *   paletas/escala passou a rodar duas vezes por frame. Essa é a origem
 *   real da queda de FPS.
 * -----------------------------------------------------------------------
 */

// ID inicial reservado pro SEU addon, escolhido pra nunca colidir com os
// IDs que o AlienEvo já usa (0-11, 31-36, 80, 100). Ajuste se precisar.
const ALIEN_GUARD_ID_START = 500;

// Guarda de segurança: se o AlienEvo não estiver carregado (dependência
// opcional), não tenta ler nada dele e evita crash.
global.alienevoIsLoaded = function () {
    return typeof global.alienevo_alien_1 !== 'undefined';
};

/**
 * Leitura remota: pega qualquer dado do codex do AlienEvo pelo ID do
 * alien, sem nunca reatribuir/duplicar essas globals no seu addon.
 * Espelha exatamente o padrão que o power_ui.js do AlienEvo usa.
 */
global.getRemoteAlienEvoData = function (alienId) {
    if (!global.alienevoIsLoaded()) return null;

    return {
        info: global[`alienevo_alien_${alienId}`],
        regen: global[`alienevo_regen_${alienId}`],
        scale: global[`alienevo_scale_${alienId}`],
        textColor: global[`alienevo_textcolor_${alienId}`],
        background: global[`alienevo_background_${alienId}`],
        randomization: global[`alienevo_randomization_${alienId}`],
        getUniforms: (variant) => global[`alienevo_${alienId}_${variant}_uniforms`],
        getSkinPalette: (variant, slot) =>
            global[`alienevo_${alienId}_${variant}_skincolor_palette_${slot}`],
        getGlowPalette: (variant, slot) =>
            global[`alienevo_${alienId}_${variant}_glowcolor_${slot}`],
    };
};

/**
 * Registro ADITIVO: use isto só para os aliens NOVOS e exclusivos do
 * Alien Guard/Upgraded Omnitrix. Nunca redeclare os IDs do AlienEvo aqui
 * — eles já existem, você só precisa lê-los com a função acima.
 *
 * Exemplo de uso:
 *   registerAlienGuardAlien(ALIEN_GUARD_ID_START, {
 *       entity: 'alienguard_aliens:meu_alien_novo',
 *       regen: 0,
 *       scale: 55,
 *       textColor: 0xffffff,
 *   });
 */
global.registerAlienGuardAlien = function (id, data) {
    global[`alienevo_alien_${id}`] = [data.entity];
    global[`alienevo_regen_${id}`] = [data.regen ?? 0];
    global[`alienevo_scale_${id}`] = [data.scale ?? 55];
    global[`alienevo_textcolor_${id}`] = [data.textColor ?? 0xffffff];
    global[`alienevo_background_${id}`] = [data.background ?? ''];
    global[`alienevo_randomization_${id}`] = [data.randomization ?? false];
};

// -------------------------------------------------------------------
// A partir daqui, defina SÓ os aliens novos do seu addon, começando em
// ALIEN_GUARD_ID_START. Não copie nenhuma entrada que já existe no
// alien_codex.js do AlienEvo — ela já está disponível via
// getRemoteAlienEvoData().
// -------------------------------------------------------------------

// registerAlienGuardAlien(ALIEN_GUARD_ID_START, {
//     entity: 'alienguard_aliens:exemplo',
//     regen: 0,
//     scale: 55,
//     textColor: 0xffffff,
// });