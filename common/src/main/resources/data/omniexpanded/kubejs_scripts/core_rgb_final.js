// core_rgb_final.js
// Coloque em: common/src/main/resources/data/omniexpanded/kubejs_scripts/core_rgb_final.js
//
// IMPORTANTE: apague os arquivos antigos dessa feature antes de colocar este:
//   - core_rgb_palette.js
//   - core_rgb_sync.js
// (so pode existir UM desses scripts no kubejs_scripts, senao da erro de
//  "redeclaration of const" de novo)
//
// Requer o arquivo anexado upgraded_omnitrix.json substituindo:
//   common/src/main/resources/assets/omniexpanded/palladium/render_layers/upgraded_omnitrix.json
// (corrigi um bug no proprio arquivo do addon: as variaveis B/D/E/G/H/I das partes
//  solidas do relogio estavam todas apontando pro mesmo objective "AlienEvo.CoreSide"
//  em vez de cada uma ter o seu — sem esse fix nao da pra escolher hastes/dial
//  separado do resto, nao importa o metodo usado)
//
// DECISAO DE DESIGN: o nucleo (glow) aceita RGB livre de verdade, porque a
// textura dele foi desenhada pra isso. As hastes e o dial (e o resto do corpo)
// NAO foram desenhados pra RGB livre — sao 26 skins pre-prontas cada, selecionadas
// por indice (0 a 25), do mesmo jeito que o proprio Prototype Omnitrix do mod
// (confirmado olhando o arquivo original dele). Entao pra essas partes o comando
// deixa vc escolher o INDICE da skin, nao uma cor livre — isso e o que realmente
// funciona sem bug nesse motor grafico.
//
// Uso em jogo:
//   /omnicore nucleo rgb 255 0 0        -> cor livre so no nucleo (glow)
//   /omnicore hastes skin 3             -> escolhe a skin 0-25 das hastes (tubes)
//   /omnicore dial skin 3               -> escolhe a skin 0-25 do dial (outer+inner)
//   /omnicore corpo skin 3              -> escolhe a skin 0-25 do resto do corpo
//   /omnicore paleta roxo               -> atalho: seta nucleo + hastes + dial numa combinacao pronta

const PALETTES = {
    // [r, g, b] pro nucleo, e o indice de skin (0-25) mais parecido pras partes solidas
    verde:    { rgb: [64, 255, 112],  skin: 0 },
    vermelho: { rgb: [255, 59, 48],   skin: 1 },
    azul:     { rgb: [45, 107, 255],  skin: 2 },
    roxo:     { rgb: [160, 32, 240],  skin: 3 },
    laranja:  { rgb: [255, 140, 26],  skin: 4 },
    ciano:    { rgb: [42, 223, 224],  skin: 5 },
};
// Ajuste os numeros de "skin" acima depois de olhar em jogo quais dos 26 indices
// (0-25) tem a cor mais parecida com cada paleta — eu nao tenho como ver o
// resultado visual daqui, entao coloquei valores de exemplo/placeholder.

function toHex(v) {
    let s = Math.max(0, Math.min(255, Math.round(v))).toString(16);
    return s.length === 1 ? "0" + s : s;
}
function rgbToHex(r, g, b) {
    return toHex(r) + toHex(g) + toHex(b);
}
function buildGlowShades(r, g, b) {
    let factors = [1.0, 0.92, 0.80];
    return factors.map(f => rgbToHex(r * f, g * f, b * f));
}

function setCoreRgb(player, r, g, b) {
    let glow = buildGlowShades(r, g, b);
    for (let i = 0; i < 3; i++) {
        palladium.setProperty(player, "upgraded_glow_color_" + (i + 1), glow[i]);
    }
    player.tell("§aNucleo atualizado para RGB(" + r + ", " + g + ", " + b + ").");
}

function setSkin(player, objective, index) {
    palladium.scoreboard.setScore(player, objective, index);
}

ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Arguments } = event;

    event.register(
        Commands.literal("omnicore")
            .then(
                Commands.literal("nucleo").then(
                    Commands.literal("rgb")
                        .then(Commands.argument("r", Arguments.INTEGER.create(event))
                            .then(Commands.argument("g", Arguments.INTEGER.create(event))
                                .then(Commands.argument("b", Arguments.INTEGER.create(event))
                                    .executes(ctx => {
                                        let player = ctx.source.getPlayerOrException();
                                        let r = Arguments.INTEGER.getResult(ctx, "r");
                                        let g = Arguments.INTEGER.getResult(ctx, "g");
                                        let b = Arguments.INTEGER.getResult(ctx, "b");
                                        if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
                                            player.tell("§cCada valor de R, G e B precisa estar entre 0 e 255.");
                                            return 0;
                                        }
                                        setCoreRgb(player, r, g, b);
                                        return 1;
                                    })
                                ))
                        )
                )
            )
            .then(
                Commands.literal("hastes").then(
                    Commands.literal("skin").then(
                        Commands.argument("indice", Arguments.INTEGER.create(event))
                            .executes(ctx => {
                                let player = ctx.source.getPlayerOrException();
                                let i = Arguments.INTEGER.getResult(ctx, "indice");
                                if (i < 0 || i > 25) { player.tell("§cIndice precisa estar entre 0 e 25."); return 0; }
                                setSkin(player, "AlienEvo.Tubes", i);
                                player.tell("§aHastes: skin " + i);
                                return 1;
                            })
                    )
                )
            )
            .then(
                Commands.literal("dial").then(
                    Commands.literal("skin").then(
                        Commands.argument("indice", Arguments.INTEGER.create(event))
                            .executes(ctx => {
                                let player = ctx.source.getPlayerOrException();
                                let i = Arguments.INTEGER.getResult(ctx, "indice");
                                if (i < 0 || i > 25) { player.tell("§cIndice precisa estar entre 0 e 25."); return 0; }
                                setSkin(player, "AlienEvo.DialOuter", i);
                                setSkin(player, "AlienEvo.DialInner", i);
                                player.tell("§aDial: skin " + i);
                                return 1;
                            })
                    )
                )
            )
            .then(
                Commands.literal("corpo").then(
                    Commands.literal("skin").then(
                        Commands.argument("indice", Arguments.INTEGER.create(event))
                            .executes(ctx => {
                                let player = ctx.source.getPlayerOrException();
                                let i = Arguments.INTEGER.getResult(ctx, "indice");
                                if (i < 0 || i > 25) { player.tell("§cIndice precisa estar entre 0 e 25."); return 0; }
                                setSkin(player, "AlienEvo.BasePrimary", i);
                                setSkin(player, "AlienEvo.BaseSecondary", i);
                                setSkin(player, "AlienEvo.BaseTertiary", i);
                                setSkin(player, "AlienEvo.Buttons", i);
                                setSkin(player, "AlienEvo.CoreSide", i);
                                setSkin(player, "AlienEvo.CoreTop", i);
                                player.tell("§aCorpo: skin " + i);
                                return 1;
                            })
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
                            let p = PALETTES[nome];
                            if (!p) {
                                player.tell("§cPaleta desconhecida. Use /omnicore paleta lista");
                                return 0;
                            }
                            setCoreRgb(player, p.rgb[0], p.rgb[1], p.rgb[2]);
                            setSkin(player, "AlienEvo.Tubes", p.skin);
                            setSkin(player, "AlienEvo.DialOuter", p.skin);
                            setSkin(player, "AlienEvo.DialInner", p.skin);
                            player.tell("§aPaleta '" + nome + "' aplicada: nucleo + hastes + dial.");
                            return 1;
                        })
                )
            )
    );
});