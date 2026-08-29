StartupEvents.registry('palladium:abilities', (event) => {
  const TIMER_OBJECTIVE = 'AlienEvo.Timer';
  const RECHARGE_RATE = 1;

  event.create('alienevo:recharge')
    .icon(palladium.createItemIcon('minecraft:redstone'))
    .displayName('Omnitrix Recharge')

    .tick((entity, entry, holder, enabled) => {
      if (enabled) {
        let currentTime = palladium.scoreboard.getScore(entity, TIMER_OBJECTIVE, 0);
        
        if (currentTime > 1) {
          palladium.scoreboard.subtractScore(entity, TIMER_OBJECTIVE, RECHARGE_RATE);
          
          let newTime = palladium.scoreboard.getScore(entity, TIMER_OBJECTIVE, 0);
          if (newTime <= 1) {
            palladium.scoreboard.setScore(entity, TIMER_OBJECTIVE, 0);
            palladium.setProperty(entity, 'watch_state', "default");
            
            let watchType = palladium.getProperty(entity, 'watch') || "prototype";
            
            entity.level.playSound(
              null,
              entity.x,
              entity.y,
              entity.z,
              `alienevo:${watchType}_recharge`,
              entity.getSoundSource(),
              1.0,
              1.0
            );
          }
        }
      }
    });
});