StartupEvents.registry('palladium:abilities', (event) => {
    event.create('alienevo:screenshake')
        .icon(palladium.createItemIcon('minecraft:piston'))
        .addProperty("vertical_intensity", "float", 0.3, "Vertical Shake Intensity (degrees)")
        .addProperty("horizontal_intensity", "float", 1.0, "Horizontal Shake Intensity (degrees)")
        .addProperty("frequency", "float", 1.0, "Speed multiplier (1.0 = normal, 2.0 = faster)")
        .addProperty("duration", "integer", 20, "How long the shake lasts in ticks")
        .addProperty("ease_duration", "integer", 5, "How many ticks to spend easing out")
        .addProperty("tag_name", "string", "shake", "The tag to check for")
        .tick((entity, entry, holder, enabled) => {
            if (enabled && entity.isPlayer()) {
                let vertIntensity = entry.getPropertyByName("vertical_intensity");
                let horizIntensity = entry.getPropertyByName("horizontal_intensity");
                let frequency = entry.getPropertyByName("frequency");
                let duration = entry.getPropertyByName("duration");
                let easeDuration = entry.getPropertyByName("ease_duration");
                let tagName = entry.getPropertyByName("tag_name");

                if (!entity.tags.contains(tagName)) return;

                if (!entity.persistentData.contains("shakeStartTime")) {
                    entity.persistentData.putLong("shakeStartTime", entity.level.time);
                }

                let elapsedTime = entity.level.time - entity.persistentData.getLong("shakeStartTime");
                if (elapsedTime >= duration) {
                    entity.tags.remove(tagName);
                    entity.persistentData.remove("shakeStartTime");
                    return;
                }

                let easingMultiplier = 1.0;
                let timeUntilEnd = duration - elapsedTime;
                if (timeUntilEnd <= easeDuration) {
                    easingMultiplier = (timeUntilEnd / easeDuration) * (timeUntilEnd / easeDuration);
                }

                let currentVertIntensity = vertIntensity * easingMultiplier;
                let currentHorizIntensity = horizIntensity * easingMultiplier;

                switch (Math.floor((entity.level.time * frequency) % 4)) {
                    case 0:
                        entity.runCommandSilent(
                            `execute as @s at @s run tp @s ~ ~ ~ ~${currentHorizIntensity} ~${currentVertIntensity}`
                        );
                        break;
                    case 1:
                        entity.runCommandSilent(
                            `execute as @s at @s run tp @s ~ ~ ~ ~${-currentHorizIntensity} ~${-currentVertIntensity}`
                        );
                        break;
                    case 2:
                        entity.runCommandSilent(
                            `execute as @s at @s run tp @s ~ ~ ~ ~${-currentHorizIntensity} ~${currentVertIntensity}`
                        );
                        break;
                    case 3:
                        entity.runCommandSilent(
                            `execute as @s at @s run tp @s ~ ~ ~ ~${currentHorizIntensity} ~${-currentVertIntensity}`
                        );
                        break;
                }
            }
        });
});
StartupEvents.registry('palladium:abilities', (event) => {
    const modeMap = {
        'static': '',
        'spread': '10000000000000',
        'gather': '-10000000000000'
    };

    event.create('alienevo:particle_ring')
        .icon(palladium.createItemIcon('minecraft:nether_star'))
        .addProperty("particle_id", "string", "end_rod", "Particle type to spawn")
        .addProperty("mode", "string", "static", "Ring mode (static/spread/gather)")
        .addProperty("particle_count", "integer", 36, "Number of particles in the ring")
        .addProperty("spawn_delay", "integer", 1, "Ticks between each particle spawn")
        .addProperty("ring_distance", "float", 3.0, "Base distance of particles from center")
        .addProperty("ring_height", "float", 0.0, "Base height offset from player")
        .addProperty("layer_count", "integer", 3, "Number of ring layers")
        .addProperty("layer_height", "float", 0.5, "Height between each ring layer")
        .addProperty("distance_decrease", "float", 0.5, "How much to decrease ring distance per layer")
        .addProperty("particle_speed", "float", 1.0, "Speed of particles (for spread/gather)")
        .addProperty("rotation_speed", "float", 2.0, "Speed of ring rotation")
        .addProperty("particle_spread", "float", 0.1, "Random spread of particles from their spawn position")
        .addProperty("vertical_spread", "float", 0.0, "Additional vertical spread of particles")
        .tick((entity, entry, holder, enabled) => {
            if (enabled && entity.isPlayer()) {
                let counter = 0;
                let particleId = entry.getPropertyByName("particle_id");
                let mode = entry.getPropertyByName("mode");
                let count = entry.getPropertyByName("particle_count");
                let delay = entry.getPropertyByName("spawn_delay");
                let baseDistance = entry.getPropertyByName("ring_distance");
                let baseHeight = entry.getPropertyByName("ring_height");
                let layerCount = entry.getPropertyByName("layer_count");
                let layerHeight = entry.getPropertyByName("layer_height");
                let distanceDecrease = entry.getPropertyByName("distance_decrease");
                let speed = entry.getPropertyByName("particle_speed");
                let rotationSpeed = entry.getPropertyByName("rotation_speed");
                let spread = entry.getPropertyByName("particle_spread");
                let vertSpread = entry.getPropertyByName("vertical_spread");

                let angleTemp = 360 / count;
                let speedTemp = (speed * 0.00000000000001).toFixed(18);
                let modeTemp = modeMap[mode];

                let rotationOffset = (entity.level.time * rotationSpeed) % 360;

                for (let layer = 0; layer < layerCount; layer++) {
                    let layerHeightOffset = baseHeight + (layer * layerHeight);
                    let layerRotationOffset = layer * 10;

                    let layerDistance = Math.max(0.1, baseDistance - (layer * distanceDecrease));

                    for (let i = 0; i < count; i++) {
                        entity.server.scheduleInTicks(delay * i, () => {
                            counter++;

                            let spreadX = (Math.random() - 0.5) * spread;
                            let spreadY = (Math.random() - 0.5) * vertSpread;
                            let spreadZ = (Math.random() - 0.5) * spread;

                            entity.server.runCommandSilent(
                                `execute rotated ${(counter * angleTemp + rotationOffset + layerRotationOffset) % 360} 0 positioned ${entity.x + spreadX} ${entity.y + layerHeightOffset + spreadY} ${entity.z + spreadZ} run particle ${particleId} ^ ^ ^${layerDistance} ^ ^ ^${modeTemp} ${speedTemp} 0 force`
                            );
                        });
                    }
                }
            }
        });
});