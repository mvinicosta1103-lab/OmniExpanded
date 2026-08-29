StartupEvents.registry('palladium:abilities', (event) => {
    event.create('alienevo:slower_hunger')
        .icon(palladium.createItemIcon('palladium:vibranium_circuit'))
        .addProperty("reduction_factor", "float", 0.1, "How much hunger is reduced (lower = slower hunger)")
        .tick((entity, entry, holder, enabled) => {
            if (enabled && entity.type === 'minecraft:player') {
                let reductionFactor = entry.getPropertyByName("reduction_factor");
                
                const currentExhaustion = entity.nbt['foodExhaustionLevel'];
                const lastExhaustion = entity.getPersistentData().getFloat('lastExhaustionValue') || 0;
                
                if (currentExhaustion > lastExhaustion) {
                    const exhaustionAdded = currentExhaustion - lastExhaustion;
                    const reducedExhaustion = lastExhaustion + (exhaustionAdded * reductionFactor);
                    entity.getFoodData().setExhaustion(reducedExhaustion);
                }
                
                entity.getPersistentData().putFloat('lastExhaustionValue', entity.nbt['foodExhaustionLevel']);
            }
        });
});