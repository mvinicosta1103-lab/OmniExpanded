StartupEvents.registry('palladium:abilities', (event) => {
  event.create('alienevo:fire_immunity')
    .icon(palladium.createItemIcon('palladium:vibranium_circuit'))
    .tick((entity, entry, holder, enabled) => {
      if (enabled && entity.level.time % 5 === 0) {
        if (entity.isPlayer()) {
          entity.extinguish()
        }
      }
    });
});