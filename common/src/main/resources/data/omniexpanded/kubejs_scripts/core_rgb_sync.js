// core_rgb_sync.js
// Coloque em: common/src/main/resources/data/omniexpanded/kubejs_scripts/core_rgb_sync.js
//
// Requer os 2 arquivos anexados junto:
//   1) upgraded_omnitrix.json  -> substitui
//      common/src/main/resources/assets/omniexpanded/palladium/render_layers/upgraded_omnitrix.json
//   2) core_sync_mask.png      -> coloque em
//      common/src/main/resources/assets/omniexpanded/textures/models/upgraded_omnitrix/core_sync_mask.png
//
// Como funciona (diferente da tentativa anterior):
// Em vez de trocar cores "por pixel parecido" na textura inteira (o que vazava pra
// partes que nao deviam mudar), essa versao usa uma MASCARA nova, gerada a partir das
// coordenadas UV reais dos ossos "white" (as 4 hastes) e "dial" no seu geo.json.
// A mascara e transparente em tudo, e solida branca SO nos pixels dessas duas partes.
// O json anexado adiciona uma camada extra que desenha essa mascara por cima do
// relogio, tingida com a propriedade upgraded_core_sync_color. Como a mascara so tem
// pixel nas hastes e no dial, nada mais no visual e afetado — nucleo, "black", "grey",
// botao, cilindro etc continuam intocados.
//
// O nucleo (camada glow ja existente no mod) continua sincronizado via
// upgraded_glow_color_1/2/3, exatamente como antes.
//
// Uso em jogo (agora com RGB numerico, 0-255 cada):
//   /omnicore rgb 255 0 0
//   /omnicore paleta roxo
//   /omnicore paleta lista

const PALETTES = {
    verde:    [64, 255, 112],
    vermelho: [255, 59, 48],
    azul:     [45, 107, 255],
    roxo:     [160, 32, 240],
    laranja:  [255, 140, 26],
    ciano:    [42, 223, 224],
    rosa:     [255, 94, 196],
    amarelo:  [255, 210, 63],
    branco:   [255, 255, 255]
};

function toHex(v) {
    let s = Math.max(0, Math.min(255, Math.round(v))).toString(16);
    return s.length === 1 ? "0" + s : s;
}

function rgbToHex(r, g, b) {
    return toHex(r) + toHex(g) + toHex(b);
}

// 3 tons pro glow do nucleo, no mesmo estilo do gradiente padrao (mais claro -> mais escuro)
function buildGlowShades(r, g, b) {
    let factors = [1.0, 0.92, 0.80];
    return factors.map(f => rgbToHex(r * f, g * f, b * f));
}

function applyCoreColor(player, r, g, b) {
    let glow = buildGlowShades(r, g, b);
    let solid = rgbToHex(r, g, b);

    for (let i = 0; i < 3; i++) {
        palladium.setProperty(player, "upgraded_glow_color_" + (i + 1), glow[i]);
    }
    palladium.setProperty(player, "upgraded_core_sync_color", solid);

    player.tell("§aCor atualizada para §fRGB(" + r + ", " + g + ", " + b + ") §a#" + solid + ". Nucleo, hastes e dial sincronizados.");
}

ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Arguments } = event;

    event.register(
        Commands.literal("omnicore")
            .then(
                Commands.literal("rgb")
                    .then(
                        Commands.argument("r", Arguments.INTEGER.create(event))
                            .then(
                                Commands.argument("g", Arguments.INTEGER.create(event))
                                    .then(
                                        Commands.argument("b", Arguments.INTEGER.create(event))
                                            .executes(ctx => {
                                                let player = ctx.source.getPlayerOrException();
                                                let r = Arguments.INTEGER.getResult(ctx, "r");
                                                let g = Arguments.INTEGER.getResult(ctx, "g");
                                                let b = Arguments.INTEGER.getResult(ctx, "b");

                                                if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
                                                    player.tell("§cCada valor de R, G e B precisa estar entre 0 e 255.");
                                                    return 0;
                                                }

                                                applyCoreColor(player, r, g, b);
                                                return 1;
                                            })
                                    )
                            )
                    )
            )
            .then(
                Commands.literal("paleta").then(
                    Commands.argument("nome", Arguments.STRING.create(event))
                        .executes(ctx => {
                            let player = ctx.source.getPlayerOrException();
                            let nome = Arguments.STRING.getResult(ctx, "nome").toLowerCase();

                            if (nome === "lista") {
                                player.tell("§eCores disponiveis: " + Object.keys(PALETTES).join(", "));
                                return 1;
                            }
                            if (!PALETTES[nome]) {
                                player.tell("§cPaleta desconhecida. Use /omnicore paleta lista");
                                return 0;
                            }
                            let [r, g, b] = PALETTES[nome];
                            applyCoreColor(player, r, g, b);
                            return 1;
                        })
                )
            )
    );
});