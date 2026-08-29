(function () {
    let ClientboundSetEntityMotionPacket = Java.loadClass('net.minecraft.network.protocol.game.ClientboundSetEntityMotionPacket');

    StartupEvents.registry('palladium:abilities', (event) => {
        event.create('alienevo:infinity')
            .icon(palladium.createItemIcon('palladium:vibranium_circuit'))
            .addProperty('radius', 'integer', 10, 'Radius in which surrounding entities will be damaged')
            .addProperty('tag_ex', 'string', 'exclusion_tag', 'Tag that excludes entities if desired')
            .addProperty('speed_multiplier', 'float', 0.05, 'Multiplier to adjust the speed of motion')
            .addProperty('fire_seconds', 'integer', 0.0, 'Seconds to set entities on fire (0 for no fire)')
            .tick((entity, entry, holder, enabled) => {
                if (enabled) {
                    const tag_ex = entry.getPropertyByName('tag_ex');
                    const radius = entry.getPropertyByName('radius') * 2.0;
                    const speedMultiplier = entry.getPropertyByName('speed_multiplier');
                    const fireSeconds = entry.getPropertyByName('fire_seconds');
                    const targets = entity.serverLevel().getEntities(entity, AABB.ofSize(entity.position(), radius, radius, radius)).toArray();
                    const current_x = entity.x;
                    const current_y = entity.y;
                    const current_z = entity.z;

                    for (let j = 0; j < targets.length; j++) {
                        let box = AABB.ofSize(entity.position(), radius, radius, radius);
                        let entities = entity.serverLevel().getEntities(entity, box).toArray();
                        for (let i = 0; i < entities.length; i++) {
                            if (entities[i] !== entity && !containsTag(entities[i].getTags().toArray(), tag_ex) && entities[i].type !== "minecraft:item" && entities[i].type !== "minecraft:item_frame" && entities[i].type !== "minecraft:glow_item_frame" && entities[i].type !== "minecraft:armor_stand" && entities[i].type !== "palladium:suit_stand") {
                                const dx = entities[i].x - current_x;
                                const dy = entities[i].y - current_y;
                                const dz = entities[i].z - current_z;
                                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                                if (distance > 0) {
                                    const normalizedX = dx / distance;
                                    const normalizedY = dy / distance;
                                    const normalizedZ = dz / distance;

                                    const motionX = normalizedX * speedMultiplier;
                                    const motionY = normalizedY * speedMultiplier;
                                    const motionZ = normalizedZ * speedMultiplier;

                                    entities[i].addMotion(motionX, motionY, motionZ);
                                    
                                    // Set entity on fire if fireSeconds > 0
                                    if (fireSeconds > 0) {
                                        entities[i].setSecondsOnFire(fireSeconds);
                                    }
                                    
                                    if (entities[i].isPlayer()) {
                                        entities[i].connection.send(new ClientboundSetEntityMotionPacket(entities[i]));
                                    }
                                }
                            }
                        }
                    }
                }
            });
    });
})();