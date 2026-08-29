StartupEvents.registry('palladium:abilities', (event) => {
    event.create('alienevo:freeze_immunity')
      .icon(palladium.createItemIcon('palladium:vibranium_circuit'))
      .tick((entity, entry, holder, enabled) => {
        if (enabled) {
          if (entity.isPlayer()) {
            entity.setTicksFrozen(0);
          }
        }
      });
  });