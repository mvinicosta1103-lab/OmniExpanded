let ClientboundSetEntityMotionPacket = Java.loadClass('net.minecraft.network.protocol.game.ClientboundSetEntityMotionPacket');

StartupEvents.registry('palladium:abilities', (event) => {
  event.create('alienevo:charge_leap')
    .icon(palladium.createItemIcon('palladium:vibranium_circuit'))
    .addProperty("score_value", "string", "Motion.Score", "Scoreboard Name")
    .addProperty("division_amount", "float", 1, "The amount the scoreboard value will be divided by")
    .addProperty("minimum_score", "int", 35, "Minimum score threshold")
    .tick((entity, entry, holder, enabled) => {
      if (enabled && entity.isPlayer()) {
        const scoreboardName = entry.getPropertyByName("score_value");

        let username = entity.getGameProfile().getName();

        let scoreboard = Utils.server.scoreboard;
        let scoreboardObj = scoreboard.getObjective(scoreboardName);

        if (scoreboardObj != null) {
          let score = scoreboard.getOrCreatePlayerScore(username, scoreboardObj);

          if (score.getScore() < 100) {
            score.add(6);
          }
        }
      }
    })
    .lastTick((entity, entry, holder, enabled) => {
      if (enabled && entity.isPlayer()) {
        const scoreboardName = entry.getPropertyByName("score_value");
        const divisionAmount = entry.getPropertyByName("division_amount");

        let username = entity.getGameProfile().getName();

        let scoreboard = Utils.server.scoreboard;
        let scoreboardObj = scoreboard.getObjective(scoreboardName);

        if (scoreboardObj != null) {
          let score = scoreboard.getOrCreatePlayerScore(username, scoreboardObj);
          let scoreValue = score.getScore();

          if (scoreValue < 35) {
            scoreValue = 35;
          }

          let motion = scoreValue / divisionAmount;

          let angle = entity.getLookAngle().scale(motion);

          entity.setDeltaMovement(angle);

          entity.connection.send(new ClientboundSetEntityMotionPacket(entity));

          entity.addTag('AlienEvo.Leap');

          if (scoreValue >= 60) {
            entity.level.spawnParticles('minecraft:explosion', true, entity.x, entity.y + 0.2, entity.z, 0.5, 0.6, 0.5, 5, 0.6);

            entity.level.playSound(null, entity.x, entity.y + 0.6, entity.z, 'minecraft:entity.generic.explode', entity.getSoundSource(), 1.0, 1.5);

            entity.addTag('AlienEvo.ScreenShake');
          }

          score.setScore(0);
        }
      }
    });
}); 