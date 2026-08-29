StartupEvents.registry('palladium:abilities', (event) => {
    const LivingEntity = Java.loadClass('net.minecraft.world.entity.LivingEntity');
    const ClientboundSetEntityMotionPacket = Java.loadClass('net.minecraft.network.protocol.game.ClientboundSetEntityMotionPacket');
    const Vec3 = Java.loadClass('net.minecraft.world.phys.Vec3');
    const ClipContext = Java.loadClass('net.minecraft.world.level.ClipContext');
    const HitResult = Java.loadClass('net.minecraft.world.phys.HitResult');
    const ArmorStand = Java.loadClass('net.minecraft.world.entity.decoration.ArmorStand');
    const EndCrystal = Java.loadClass('net.minecraft.world.entity.boss.enderdragon.EndCrystal');

    let recentTargets = new Map();
    let currentTargets = new Map();
    let lastTargetTimes = new Map();

    // Tag name for when player is targeting
    const TARGET_TAG = "alienevo_targeting";

    event.create('alienevo:motion_to_entity')
        .icon(palladium.createItemIcon('minecraft:ender_pearl'))
        .addProperty("motion_strength", "float", 0.5, "Motion strength toward the target")
        .addProperty("search_radius", "float", 20.0, "Radius to search for entities")
        .addProperty("vertical_motion", "boolean", true, "Include vertical motion (Y-axis)")
        .addProperty("face_target", "boolean", true, "Make player look at the target entity")
        .addProperty("switch_distance", "float", 2, "Distance to switch to next target")
        .addProperty("cooldown_time", "integer", 60, "Ticks before retargeting same entity (60 = 3 seconds)")
        .addProperty("debug_mode", "boolean", true, "Enable debug messages")
        .addProperty("require_line_of_sight", "boolean", true, "Only target entities with clear line of sight")
        .addProperty("stuck_timeout", "integer", 40, "Ticks before switching target if no progress (40 = 2 seconds)")
        .tick((entity, entry, holder, enabled) => {
            if (enabled && entity.isPlayer()) {
                let motionStrength = entry.getPropertyByName("motion_strength");
                let searchRadius = entry.getPropertyByName("search_radius");
                let includeVertical = entry.getPropertyByName("vertical_motion");
                let faceTarget = entry.getPropertyByName("face_target");
                let switchDistance = entry.getPropertyByName("switch_distance");
                let cooldownTime = entry.getPropertyByName("cooldown_time");
                let debugMode = entry.getPropertyByName("debug_mode");
                let requireLineOfSight = entry.getPropertyByName("require_line_of_sight");
                let stuckTimeout = entry.getPropertyByName("stuck_timeout");

                let playerId = entity.id;
                if (!recentTargets.has(playerId)) {
                    recentTargets.set(playerId, new Map());
                }
                let playerTargets = recentTargets.get(playerId);

                let currentTime = entity.level.time;
                for (let [targetId, timestamp] of playerTargets.entries()) {
                    if (currentTime - timestamp > cooldownTime) {
                        playerTargets.delete(targetId);
                    }
                }

                let currentTarget = currentTargets.get(playerId);
                let lastTargetTime = lastTargetTimes.get(playerId) || 0;
                let shouldFindNewTarget = false;

                if (currentTarget && (currentTime - lastTargetTime) > stuckTimeout) {
                    try {
                        let dx = entity.x - currentTarget.x;
                        let dy = entity.y - currentTarget.y;
                        let dz = entity.z - currentTarget.z;
                        let currentDistance = Math.sqrt(dx*dx + dy*dy + dz*dz);

                        if (currentDistance > switchDistance * 2) {
                            shouldFindNewTarget = true;
                            playerTargets.set(currentTarget.id, currentTime);
                            if (debugMode) {
                                entity.tell("Stuck! Switching to new target...");
                            }
                        }
                    } catch (e) {
                        shouldFindNewTarget = true;
                    }
                }

                let hasLineOfSight = (from, to) => {
                    if (!requireLineOfSight) return true;

                    try {
                        let startVec = new Vec3(from.x, from.eyeY, from.z);
                        let endVec = new Vec3(to.x, to.eyeY, to.z);

                        let clipContext = new ClipContext(
                            startVec,
                            endVec,
                            ClipContext.Block.COLLIDER,
                            ClipContext.Fluid.NONE,
                            from
                        );

                        let result = entity.level.clip(clipContext);

                        return result.getType() == HitResult.Type.MISS;
                    } catch (e) {
                        if (debugMode) {
                            entity.tell("Line of sight check error: " + e.message);
                        }
                        return true;
                    }
                };

                if (debugMode && entity.level.time % 40 === 0) {
                    entity.tell("Searching for nearest entity within " + searchRadius + " blocks (ignored: " + playerTargets.size + ")");
                }

                let nearestEntity = null;
                let nearestDistance = searchRadius + 1;

                try {
                    let entityAABB = entity.boundingBox.inflate(searchRadius);

                    let nearbyEntities = entity.level.getEntitiesWithin(entityAABB);

                    if (nearbyEntities) {
                        nearbyEntities.forEach(nearby => {
                            if (nearby == null ||
                                nearby.id === entity.id ||
                                !(nearby instanceof LivingEntity) ||
                                !nearby.isAlive() ||
                                nearby.getHealth() <= 0) return;

                            if (nearby instanceof ArmorStand || nearby instanceof EndCrystal) {
                                if (debugMode && entity.level.time % 80 === 0) {
                                    entity.tell("Skipping armor stand or end crystal");
                                }
                                return;
                            }

                            if (playerTargets.has(nearby.id)) {
                                if (debugMode && entity.level.time % 80 === 0) {
                                    entity.tell("Skipping recently targeted entity ID: " + nearby.id);
                                }
                                return;
                            }

                            if (!hasLineOfSight(entity, nearby)) {
                                if (debugMode && entity.level.time % 80 === 0) {
                                    entity.tell("No line of sight to entity ID: " + nearby.id);
                                }
                                return;
                            }

                            let dx = entity.x - nearby.x;
                            let dy = entity.y - nearby.y;
                            let dz = entity.z - nearby.z;
                            let distance = Math.sqrt(dx*dx + dy*dy + dz*dz);

                            if (distance < nearestDistance) {
                                nearestDistance = distance;
                                nearestEntity = nearby;
                            }
                        });
                    }

                    if (nearestEntity && nearestDistance <= switchDistance) {
                        playerTargets.set(nearestEntity.id, currentTime);

                        // Play attack sound when reaching target
                        entity.level.playSound(null, entity.x, entity.y + 0.6, entity.z, 'minecraft:entity.player.attack.strong', entity.getSoundSource(), 1.0, 1.2);

                        if (debugMode) {
                            entity.tell("Reached target! Adding to cooldown and finding next target...");
                        }

                        nearestEntity = null;
                        nearestDistance = searchRadius + 1;

                        nearbyEntities.forEach(nearby => {
                            if (nearby == null ||
                                nearby.id === entity.id ||
                                !(nearby instanceof LivingEntity) ||
                                !nearby.isAlive() ||
                                nearby.getHealth() <= 0 ||
                                playerTargets.has(nearby.id) ||
                                !hasLineOfSight(entity, nearby)) return;

                            if (nearby instanceof ArmorStand || nearby instanceof EndCrystal) return;

                            let dx = entity.x - nearby.x;
                            let dy = entity.y - nearby.y;
                            let dz = entity.z - nearby.z;
                            let distance = Math.sqrt(dx*dx + dy*dy + dz*dz);

                            if (distance < nearestDistance) {
                                nearestDistance = distance;
                                nearestEntity = nearby;
                            }
                        });
                    }

                    if (nearestEntity && (nearestEntity.id !== currentTarget?.id || shouldFindNewTarget)) {
                        currentTargets.set(playerId, nearestEntity);
                        lastTargetTimes.set(playerId, currentTime);
                    }

                    if (debugMode && entity.level.time % 40 === 0) {
                        if (nearestEntity) {
                            entity.tell("Targeting entity at distance: " + nearestDistance.toFixed(2));
                        } else {
                            entity.tell("No valid targets available");
                        }
                    }
                } catch (e) {
                    if (debugMode) {
                        entity.tell("Error finding entities: " + e.message);
                    }
                    // Remove targeting tag on error
                    if (entity.tags && entity.tags.contains(TARGET_TAG)) {
                        entity.removeTag(TARGET_TAG);
                        if (debugMode) {
                            entity.tell("Removed targeting tag due to error");
                        }
                    }
                    return;
                }

                // Handle player tagging based on targeting status
                if (nearestEntity) {
                    // Add targeting tag if not present
                    if (entity.tags && !entity.tags.contains(TARGET_TAG)) {
                        entity.addTag(TARGET_TAG);
                        if (debugMode) {
                            entity.tell("Added targeting tag - now tracking entity!");
                        }
                    }

                    let playerEyeX = entity.x;
                    let playerEyeY = entity.eyeY;
                    let playerEyeZ = entity.z;

                    let targetEyeX = nearestEntity.x;
                    let targetEyeY = nearestEntity.eyeY;
                    let targetEyeZ = nearestEntity.z;

                    let dx = targetEyeX - playerEyeX;
                    let dy = targetEyeY - playerEyeY;
                    let dz = targetEyeZ - playerEyeZ;

                    if (faceTarget && Math.sqrt(dx*dx + dy*dy + dz*dz) > 0.1) {
                        let yaw = Math.atan2(-dx, dz) * (180.0 / Math.PI);
                        while (yaw > 180) yaw -= 360;
                        while (yaw < -180) yaw += 360;

                        let horizontalDistance = Math.sqrt(dx*dx + dz*dz);
                        let pitch = 0;
                        if (horizontalDistance > 0) {
                            pitch = Math.atan2(-dy, horizontalDistance) * (180.0 / Math.PI);
                            pitch = Math.max(-90, Math.min(90, pitch));
                        }
                        let currentYaw = entity.yaw;
                        let yawDiff = Math.abs(yaw - currentYaw);
                        let isBehind = Math.abs(yawDiff) > 90;

                        if (!isNaN(yaw) && !isNaN(pitch)) {

                            try {
                                entity.setRotation(yaw, pitch);
                                entity.yBodyRot = entity.yHeadRot;
                                entity.yBodyRotO = entity.yHeadRotO;
                                if (isBehind) {
                                    entity.yBodyRot = entity.yaw;
                                    entity.yBodyRotO = entity.yaw;
                                }

                                if (debugMode && entity.level.time % 60 === 0) {
                                    entity.tell("Using setRotation - Target Yaw: " + yaw.toFixed(1) + "° Head: " + entity.yHeadRot.toFixed(1) + "° Body: " + entity.yBodyRot.toFixed(1) + "°");
                                }
                            } catch (e) {
                                entity.yaw = yaw;
                                entity.pitch = pitch;
                                entity.yBodyRot = entity.yHeadRot || yaw;
                                entity.yBodyRotO = entity.yHeadRotO || yaw;

                                if (debugMode) {
                                    entity.tell("setRotation failed, using direct property setting: " + e.message);
                                }
                            }
                        }
                    }
                    let distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
                    if (distance > 0) {
                        dx = dx / distance;
                        dy = dy / distance;
                        dz = dz / distance;
                        dx *= motionStrength;
                        dz *= motionStrength;

                        if (includeVertical) {
                            dy *= motionStrength;
                        } else {
                            try {
                                let currentMotion = entity.getDeltaMovement();
                                dy = currentMotion.y;
                            } catch (e) {
                                dy = 0;
                            }
                        }
                        let motionVector = new Vec3(dx, -1, dz);
                        entity.setDeltaMovement(motionVector);

                        entity.connection.send(new ClientboundSetEntityMotionPacket(entity));

                        if (debugMode && entity.level.time % 60 === 0) {
                            entity.tell("Applying motion: X=" + dx.toFixed(2) +
                                       " Y=-1 (forced downward)" +
                                       " Z=" + dz.toFixed(2));
                        }
                    }
                } else {
                    // Remove targeting tag if no target found
                    if (entity.tags && entity.tags.contains(TARGET_TAG)) {
                        entity.removeTag(TARGET_TAG);
                        if (debugMode) {
                            entity.tell("Removed targeting tag - no targets available");
                        }
                    }
                }
            } else if (!enabled && entity.isPlayer()) {
                // Clean up when ability is disabled
                let playerId = entity.id;
                if (recentTargets.has(playerId)) {
                    recentTargets.get(playerId).clear();
                }
                currentTargets.delete(playerId);
                lastTargetTimes.delete(playerId);

                // Remove targeting tag when ability is disabled
                if (entity.tags && entity.tags.contains(TARGET_TAG)) {
                    entity.removeTag(TARGET_TAG);
                }
            }
        });
});