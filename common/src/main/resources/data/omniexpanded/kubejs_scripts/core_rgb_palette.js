// core_rgb_palette.js
// Coloque em: common/src/main/resources/data/omniexpanded/kubejs_scripts/core_rgb_palette.js
// (mesma pasta de color_commands.js)
//
// Requer o arquivo upgraded_omnitrix.json (fornecido junto) substituindo:
// common/src/main/resources/assets/omniexpanded/palladium/render_layers/upgraded_omnitrix.json
//
// Por que funciona:
// - O NUCLEO (camada glow) ja lia upgraded_glow_color_1/2/3 -> sincroniza sozinho.
// - As HASTES e a LATERAL DO DIAL (tubes/dial_outer/dial_inner/core_side/etc) usam
//   texturas indexadas (skin "0" a "25"). A variante "0" ja e pintada com uma paleta
//   fixa de 5 verdes (#4ca80f #6bbf17 #35900b #83d41c #ace53b) repetida em TODAS as
//   partes solidas do relogio. O json anexado troca esses 5 tons pelas propriedades
//   upgraded_core_color_1..5, entao a mesma cor escolhida pinta hastes + dial + corpo.
// - Se o jogador tiver escolhido outro skin (indice != 0) pra alguma parte, essa parte
//   nao tem pixels na paleta verde e portanto nao pode ser retintada por RGB livre —
//   o comando entao forca essas objectives de volta pro skin "0" (o recolorivel) para
//   garantir que a cor realmente apareca.
//
// Uso em jogo:
//   /omnicore cor #a020f0
//   /omnicore paleta roxo
//   /omnicore paleta lista

const PALETTES = {
    verde:    "40ff70",
    vermelho: "ff3b30",
    azul:     "2d6bff",
    roxo:     "a020f0",
    laranja:  "ff8c1a",
    ciano:    "2adfe0",
    rosa:     "ff5ec4",
    amarelo:  "ffd23f",
    branco:   "ffffff"
};

// Objectives que controlam o skin index das partes solidas. Forcamos pra 0
// (a variante recolorivel) quando o jogador escolhe uma cor.
const SKIN_OBJECTIVES = [
    "AlienEvo.BasePrimary",
    "AlienEvo.CoreSide",
    "AlienEvo.BaseTertiary",
    "AlienEvo.CoreTop"
];

function toHex(v) {
    let s = v.toString(16);
    return s.length === 1 ? "0" + s : s;
}

// Gera N tons de uma cor base, aplicando fatores de brilho, preservando a matiz.
// fator > 1 clareia, < 1 escurece.
function buildShades(hex, factors) {
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    return factors.map(f => {
        let rr = Math.max(0, Math.min(255, Math.round(r * f)));
        let gg = Math.max(0, Math.min(255, Math.round(g * f)));
        let bb = Math.max(0, Math.min(255, Math.round(b * f)));
        return toHex(rr) + toHex(gg) + toHex(bb);
    });
}

function applyCoreColor(player, hex) {
    hex = hex.replace("#", "").toLowerCase();

    // 3 tons pro nucleo (glow), no mesmo estilo do gradiente padrao b3ff40->8ed721
    let glow = buildShades(hex, [1.0, 0.92, 0.80]);
    // 5 tons pras partes solidas (hastes/dial/corpo), no estilo 4ca80f->ace53b
    let solid = buildShades(hex, [0.85, 1.10, 0.68, 0.90, 1.35]);

    for (let i = 0; i < 3; i++) {
        palladium.setProperty(player, "upgraded_glow_color_" + (i + 1), glow[i]);
    }
    for (let i = 0; i < 5; i++) {
        palladium.setProperty(player, "upgraded_core_color_" + (i + 1), solid[i]);
    }

    // garante que as partes estejam no skin "0" (o unico recolorivel)
    for (let objective of SKIN_OBJECTIVES) {
        palladium.scoreboard.setScore(player, objective, 0);
    }

    player.tell("§aCor do nucleo atualizada para §f#" + hex + "§a. Nucleo, hastes e dial sincronizados.");
}

ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Arguments } = event;

    event.register(
        Commands.literal("omnicore")
            .then(
                Commands.literal("cor").then(
                    Commands.argument("hex", Arguments.STRING.create(event))
                        .executes(ctx => {
                            let player = ctx.source.getPlayerOrException();
                            let hex = Arguments.STRING.getResult(ctx, "hex");

                            if (!/^#?[0-9a-fA-F]{6}$/.test(hex)) {
                                player.tell("§cFormato invalido. Use algo como #a020f0");
                                return 0;
                            }
                            applyCoreColor(player, hex);
                            return 1;
                        })
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
                            applyCoreColor(player, PALETTES[nome]);
                            return 1;
                        })
                )
            )
    );
});