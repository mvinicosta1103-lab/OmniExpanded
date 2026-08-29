StartupEvents.registry('palladium:abilities', (event) => {

    event.create('alienevo:explosion')
        .icon(palladium.createItemIcon('minecraft:tnt'))
        .addProperty("strength", "float", 1.0, "Explosion Strength")
        .addProperty("causes_fire", "boolean", false, "Whether the explosion causes fire")
        .addProperty("random_x_range", "integer", 5, "Range for random X offset")
        .addProperty("random_y_range", "integer", 5, "Range for random Y offset")
        .addProperty("random_z_range", "integer", 5, "Range for random Z offset")
        .tick((entity, entry, holder, enabled) => {
            if (enabled) {
                let explosionStrength = entry.getPropertyByName("strength");
                let causesFire = entry.getPropertyByName("causes_fire");

                let randomXRange = entry.getPropertyByName("random_x_range");
                let randomYRange = entry.getPropertyByName("random_y_range");
                let randomZRange = entry.getPropertyByName("random_z_range");

                let randomX = Math.floor(Math.random() * (randomXRange * 2 + 1)) - randomXRange;
                let randomY = Math.floor(Math.random() * (randomYRange * 2 + 1)) - randomYRange;
                let randomZ = Math.floor(Math.random() * (randomZRange * 2 + 1)) - randomZRange;

                let explosion = entity.block.offset(randomX, randomY, randomZ).createExplosion();
                explosion.strength(explosionStrength);
                explosion.explosionMode("tnt");
                explosion.causesFire(!!causesFire);
                explosion.explode();
            }
        });
});
