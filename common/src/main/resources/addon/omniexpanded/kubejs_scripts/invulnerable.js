StartupEvents.registry('palladium:abilities', (event) => {
    event.create('alienevo:invulnerable')
      .icon(palladium.createItemIcon('minecraft:golden_apple'))
      .firstTick((entity, entry, holder, enabled) => {
      })
      .tick((entity, entry, holder, enabled) => {
        if (enabled) {
          entity.setInvulnerable(true);
        }
      })
      .lastTick((entity, entry, holder, enabled) => {
        entity.setInvulnerable(false);
      });
  });