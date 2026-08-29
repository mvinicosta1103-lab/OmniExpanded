const SCALE_TYPES = Java.loadClass("virtuoel.pehkui.api.ScaleTypes");

StartupEvents.registry('palladium:abilities', (event) => {
    event.create('alienevo:flatten')
        .icon(palladium.createItemIcon('minecraft:anvil'))
        .addProperty("height_scale", "float", 0.3, "Height multiplier when flattened")
        .addProperty("width_scale", "float", 1.5, "Width multiplier when flattened")
        .addProperty("step_height_scale", "float", 0.5, "Step height multiplier when flattened")
        .addProperty("jump_height_scale", "float", 0.3, "Jump height multiplier when flattened")
        .tick((entity, entry, holder, enabled) => {
            if (enabled) {
                let heightScale = entry.getPropertyByName("height_scale");
                let widthScale = entry.getPropertyByName("width_scale");
                let stepHeightScale = entry.getPropertyByName("step_height_scale");
                let jumpHeightScale = entry.getPropertyByName("jump_height_scale");
                
                SCALE_TYPES.HEIGHT.getScaleData(entity).setScale(heightScale);
                SCALE_TYPES.WIDTH.getScaleData(entity).setScale(widthScale);
                SCALE_TYPES.STEP_HEIGHT.getScaleData(entity).setScale(stepHeightScale);
                SCALE_TYPES.JUMP_HEIGHT.getScaleData(entity).setScale(jumpHeightScale);
            }
        })
        .lastTick((entity, entry, holder, enabled) => {
            SCALE_TYPES.HEIGHT.getScaleData(entity).setScale(1.0);
            SCALE_TYPES.WIDTH.getScaleData(entity).setScale(1.0);
            SCALE_TYPES.STEP_HEIGHT.getScaleData(entity).setScale(1.0);
            SCALE_TYPES.JUMP_HEIGHT.getScaleData(entity).setScale(1.0);
        });
});