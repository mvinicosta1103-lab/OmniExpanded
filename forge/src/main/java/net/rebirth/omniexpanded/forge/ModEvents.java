package net.rebirth.omniexpanded.forge;

import net.rebirth.omniexpanded.OmniExpanded;

import net.minecraft.network.chat.Component;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.server.level.ServerPlayer;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.sounds.SoundSource;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.scores.Objective;
import net.minecraft.world.scores.Score;
import net.minecraft.world.scores.Scoreboard;
import net.minecraft.world.scores.criteria.ObjectiveCriteria;
import net.minecraftforge.event.TickEvent;
import net.minecraftforge.event.CreativeModeTabEvent;
import net.rebirth.omniexpanded.item.OmniExpandedItems;
import net.minecraftforge.event.entity.player.PlayerEvent;
import net.minecraftforge.eventbus.api.SubscribeEvent;
import net.minecraftforge.fml.common.Mod;
import net.threetag.palladium.power.IPowerHandler;
import net.threetag.palladium.power.IPowerHolder;
import net.threetag.palladium.power.PowerHandler;
import net.threetag.palladium.power.PowerManager;
import net.threetag.palladium.power.ability.Ability;
import net.threetag.palladium.power.ability.AbilityInstance;
import it.unimi.dsi.fastutil.objects.Object2FloatMap;
import it.unimi.dsi.fastutil.objects.Object2FloatOpenHashMap;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

// Essa anotação diz ao Forge para ler os eventos desta classe automaticamente
@Mod.EventBusSubscriber(modid = OmniExpanded.MOD_ID, bus = Mod.EventBusSubscriber.Bus.FORGE)
public class ModEvents {

    // Essa é a habilidade que TODO alien transformável tem, não importa de qual addon ele venha.
    // É o botão de "virar humano de novo" - se o power ativo do jogador tem essa habilidade,
    // então esse power é uma forma de alien (e não outra coisa, tipo o item do Omnitrix).
    @SuppressWarnings("deprecation")
    private static final ResourceLocation DETRANSFORM_ABILITY =
            new ResourceLocation("alienevo", "omnitrix_detransform");

    // Quanto XP "de verdade" ganha por segundo (guardado fracionado, ver addFractionalXp)
    private static final float XP_PER_SECOND = 0.5f;

    // Nível máximo que um alien pode atingir - espelha o limite usado pelo
    // próprio Alien Evo em data/alienevo/kubejs_scripts/xp.js (EntityEvents.death).
    private static final int MAX_LEVEL = 10;

    // Nome do objective compartilhado entre TODOS os aliens, creditado apenas
    // quando um alien atinge o nível máximo (também espelha o xp.js original).
    private static final String PROTOTYPE_SKILL_OBJECTIVE = "AlienEvo.PrototypeSkillP";

    // A cada quantos ticks a checagem roda. 20 ticks = 1 segundo.
    private static final int XP_INTERVAL_TICKS = 20;

    // ---------------------------------------------------------------------
    // CACHES (o pulo do gato da otimização)
    // ---------------------------------------------------------------------

    // Todos esses caches só são lidos/escritos dentro de onPlayerTick, que o Forge
    // sempre chama na thread principal do servidor (nunca em paralelo). Por isso
    // não precisamos de HashMap concorrente aqui - isso só adicionaria overhead
    // de sincronização sem nenhum benefício real, já que não existe disputa entre threads.

    // Guarda, por Power ID, se ele já foi identificado como "é um alien" (true)
    // ou "não é um alien, é outra coisa tipo item do Omnitrix" (false).
    private static final Map<ResourceLocation, Boolean> alienPowerCache = new HashMap<>();

    // Guarda, por Power ID, o nome do objective de XP já calculado
    private static final Map<ResourceLocation, String> objectiveNameCache = new HashMap<>();

    // Guarda o "restinho" fracionado de XP de cada jogador (limpo no logout, ver abaixo).
    // Usamos Object2FloatOpenHashMap (do fastutil, que já vem junto com o próprio Minecraft)
    // em vez de Map<UUID, Float> normal para evitar autoboxing: um Map<UUID, Float> transforma
    // o "float" primitivo num objeto Float a cada leitura/escrita, gerando lixo de memória
    // desnecessário 20 vezes por segundo por jogador. O fastutil guarda o float "cru".
    private static final Object2FloatMap<UUID> xpAccumulator = new Object2FloatOpenHashMap<>();

    @SubscribeEvent
    public static void onBuildCreativeTab(CreativeModeTabEvent.BuildContents event) {
        if (event.getTabKey() == net.minecraft.world.item.CreativeModeTabs.INGREDIENTS) {
            event.accept(OmniExpandedItems.UPGRADED_OMNITRIX);
        }
    }

    @SubscribeEvent
    public static void onPlayerTick(TickEvent.PlayerTickEvent event) {
        // Sai o mais cedo possível se não for o caso que nos interessa -
        // evita qualquer trabalho extra em ticks/lados que não vamos usar.
        if (event.phase != TickEvent.Phase.END || !event.side.isServer()) return;

        Player player = event.player;

        // Intervalo de 1 segundo. Ainda mais barato que módulo: comparar direto
        // não seria mais rápido aqui, então mantemos o "% 20" (custo desprezível).
        if (player.tickCount % XP_INTERVAL_TICKS != 0) return;

        if (!(player instanceof ServerPlayer serverPlayer)) return;

        ResourceLocation alienId = findCurrentAlienId(serverPlayer);
        if (alienId == null) return; // jogador não está transformado - não faz nada

        String simpleName = objectiveNameCache.computeIfAbsent(alienId, ModEvents::buildAlienSimpleName);
        grantXp(serverPlayer, simpleName, XP_PER_SECOND);
    }

    // Limpa a memória do jogador quando ele sai do servidor, pra não vazar
    // memória num servidor que fica online por dias/semanas com muita gente entrando e saindo.
    @SubscribeEvent
    public static void onPlayerLogout(PlayerEvent.PlayerLoggedOutEvent event) {
        xpAccumulator.removeFloat(event.getEntity().getUUID());
    }

    /**
     * Percorre os Powers ativos do jogador e devolve o ID do que for um alien.
     * Usa o cache: se aquele Power ID já foi visto antes, nem olha as habilidades
     * de novo, só consulta o resultado que já foi calculado da primeira vez.
     *
     * Escrito sem Optional.map/orElse de propósito: cada .map() cria um objeto
     * Optional novo e uma closure de lambda a cada chamada. Como essa função roda
     * 20x por segundo por jogador, evitar essa alocação extra ajuda de verdade.
     */
    private static ResourceLocation findCurrentAlienId(ServerPlayer player) {
        Optional<PowerHandler> handlerOpt = PowerManager.getPowerHandler(player);
        if (handlerOpt.isEmpty()) return null;

        IPowerHandler handler = (IPowerHandler) handlerOpt.get();

        for (Map.Entry<ResourceLocation, IPowerHolder> entry : handler.getPowerHolders().entrySet()) {
            ResourceLocation powerId = entry.getKey();
            Boolean isAlien = alienPowerCache.get(powerId);

            if (isAlien == null) {
                // Primeira vez vendo esse power - descobre e guarda no cache pra sempre
                isAlien = hasDetransformAbility(entry.getValue());
                alienPowerCache.put(powerId, isAlien);
            }

            if (isAlien) {
                return powerId;
            }
        }

        return null;
    }

    /**
     * Escaneia as habilidades de um Power UMA VEZ para descobrir se ele é um alien.
     * Só é chamado pelo findCurrentAlienId quando o cache ainda não conhece esse Power.
     */
    private static boolean hasDetransformAbility(IPowerHolder holder) {
        for (AbilityInstance ability : holder.getAbilities().values()) {
            Ability abilityType = ability.getConfiguration().getAbility();
            ResourceLocation abilityTypeId = Ability.REGISTRY.getKey(abilityType);
            if (DETRANSFORM_ABILITY.equals(abilityTypeId)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Transforma o ID do power (ex: "alienevo_aliens:arburian_pelarota") no "nome simples"
     * do alien usado nos objectives do scoreboard (ex: "Arburian_pelarota"). Espelha
     * exatamente o cálculo de "simpleName" feito em data/alienevo/kubejs_scripts/xp.js,
     * pra usarmos os MESMOS objectives que o Alien Evo já cria e lê.
     * Só é chamado 1 vez por alien (o resultado fica em objectiveNameCache depois disso).
     */
    private static String buildAlienSimpleName(ResourceLocation alienId) {
        String path = alienId.getPath();
        if (path.contains("/")) {
            path = path.substring(path.lastIndexOf('/') + 1);
        }
        return Character.toUpperCase(path.charAt(0)) + path.substring(1);
    }

    /**
     * Credita XP fracionado (ex: 0.5) por jogador e, quando o acumulado fracionado
     * chegar a 1 ou mais, aplica a MESMA lógica de level-up que o Alien Evo usa no
     * kill de mobs (data/alienevo/kubejs_scripts/xp.js). Isso é necessário porque o
     * Alien Evo só faz o "check de nível" dentro do listener de morte - só escrever
     * no placar de XP (sem essa checagem) faz o XP acumular sem nunca subir de nível
     * até o próximo kill "descobrir" o excedente de uma vez.
     */
    private static void grantXp(ServerPlayer player, String simpleName, float amount) {
        UUID uuid = player.getUUID();
        float fractional = xpAccumulator.getFloat(uuid) + amount; // getFloat devolve 0f se não existir, sem boxing

        int wholePoints = (int) fractional;
        float remainder = fractional - wholePoints;
        xpAccumulator.put(uuid, remainder);

        if (wholePoints <= 0) return;

        Scoreboard scoreboard = player.getScoreboard();
        Objective xpObjective = getOrCreateObjective(scoreboard, simpleName + ".XP");
        Objective levelObjective = getOrCreateObjective(scoreboard, simpleName + ".Level");

        String username = player.getScoreboardName();
        Score xpScore = scoreboard.getOrCreatePlayerScore(username, xpObjective);
        Score levelScore = scoreboard.getOrCreatePlayerScore(username, levelObjective);

        int currentLevel = levelScore.getScore();

        // Nível máximo já atingido - o Alien Evo simplesmente zera o XP nesse caso
        // (mesmo comportamento do xp.js original), então replicamos isso aqui.
        if (currentLevel >= MAX_LEVEL) {
            xpScore.setScore(0);
            return;
        }

        int newXp = xpScore.getScore() + wholePoints;
        int maxXp = currentLevel == 0 ? 100 : 100 * currentLevel;

        if (newXp < maxXp) {
            xpScore.setScore(newXp);
            return;
        }

        // Passou do limite - sobe de nível, exatamente como o kill handler do Alien Evo faz.
        int newLevel = currentLevel + 1;
        Objective skillPointObjective = getOrCreateObjective(scoreboard, simpleName + ".SkillPoint");
        Score skillPointScore = scoreboard.getOrCreatePlayerScore(username, skillPointObjective);
        skillPointScore.setScore(skillPointScore.getScore() + 1);

        if (newLevel >= MAX_LEVEL) {
            levelScore.setScore(MAX_LEVEL);
            xpScore.setScore(0);

            Objective prototypeObjective = getOrCreateObjective(scoreboard, PROTOTYPE_SKILL_OBJECTIVE);
            Score prototypeScore = scoreboard.getOrCreatePlayerScore(username, prototypeObjective);
            prototypeScore.setScore(prototypeScore.getScore() + 1);
        } else {
            levelScore.setScore(newLevel);
            xpScore.setScore(newXp - maxXp);
        }

        ServerLevel level = player.serverLevel();
        level.playSound(null, player.getX(), player.getY(), player.getZ(),
                SoundEvents.PLAYER_LEVELUP, SoundSource.AMBIENT, 2.0f, 1.0f);
    }

    /**
     * Pega um objective do scoreboard pelo nome, criando-o automaticamente se ainda
     * não existir (o Alien Evo normalmente já cria esses objectives ao transformar,
     * mas criamos aqui também por segurança).
     */
    private static Objective getOrCreateObjective(Scoreboard scoreboard, String objectiveName) {
        Objective objective = scoreboard.getObjective(objectiveName);

        if (objective == null) {
            objective = scoreboard.addObjective(
                    objectiveName,
                    ObjectiveCriteria.DUMMY,
                    Component.literal(objectiveName),
                    ObjectiveCriteria.RenderType.INTEGER
            );
        }

        return objective;
    }
}