global.commandBasedRaycast = (entity, maxRange, blockTag) => {
    const playerName = entity.username;
    const checkOffsets = [
        { right: 0, up: 0, forward: 0 },
        { right: 0.7, up: 0, forward: 0 },
        { right: -0.7, up: 0, forward: 0 },
        { right: 0, up: 0.7, forward: 0 },
        { right: 0, up: -0.7, forward: 0 },
        { right: 1.6, up: 0, forward: 0 },
        { right: -1.6, up: 0, forward: 0 },
        { right: 0, up: 1.6, forward: 0 },
        { right: 0, up: -1.6, forward: 0 }
    ];

    const startDistance = 3.2;
    const stepSize = 0.2;
    const maxSteps = Math.floor(maxRange / stepSize);

    for (let step = 0; step < maxSteps; step++) {
        let distance = startDistance + (step * stepSize);

        let hitSomething = false;

        for (let offset of checkOffsets) {
            let command = `execute as ${playerName} at ${playerName} anchored eyes positioned ^ ^ ^${distance.toFixed(1)} positioned ^${offset.right} ^${offset.up} ^${offset.forward} unless block ~ ~ ~ ${blockTag} run tag ${playerName} add raycast_hit`;

            entity.server.runCommandSilent(command);

            if (entity.tags.contains('raycast_hit')) {
                hitSomething = true;
                entity.server.runCommandSilent(`tag ${playerName} remove raycast_hit`);
                break;
            }
        }

        if (hitSomething) {
            return {
                hit: true,
                distance: distance,
                finalStep: step
            };
        }
    }

    return {
        hit: false,
        distance: startDistance + maxRange,
        finalStep: maxSteps
    };
};

StartupEvents.registry('palladium:abilities', (event) => {
    function hexToDecimal(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        return parseInt(hex, 16);
    }

    event.create('alienevo:block_placer')
        .icon(palladium.createItemIcon('minecraft:cobblestone'))
        .addProperty("block_tag", "string", "#afomni:no_hitbox_2", "Block tag to check before placing")
        .addProperty("max_range", "float", 1.5, "Maximum placement range in blocks from starting position (3.2 blocks away)")
        .tick((entity, entry, holder, enabled) => {
            if (enabled && entity.isPlayer()) {
                let blockTag = entry.getPropertyByName("block_tag");
                let maxRange = entry.getPropertyByName("max_range");

                const playerName = entity.username;

                let scaledRange = maxRange * 5;

                let uniform = palladium.getProperty(entity, 'uniform') || 'prototype';

                let color0 = hexToDecimal(palladium.getProperty(entity, `petrosapien_${uniform}_skincolor_palette_1_color_1`) || "EF0909");
                let color1 = hexToDecimal(palladium.getProperty(entity, `petrosapien_${uniform}_skincolor_palette_1_color_2`) || "CE4E4A");
                let color2 = hexToDecimal(palladium.getProperty(entity, `petrosapien_${uniform}_skincolor_palette_1_color_3`) || "A99C86");
                let color3 = hexToDecimal(palladium.getProperty(entity, `petrosapien_${uniform}_skincolor_palette_1_color_4`) || "870B18");
                let color4 = hexToDecimal(palladium.getProperty(entity, `petrosapien_${uniform}_skincolor_palette_1_color_5`) || "6DE1F8");
                let color5 = hexToDecimal(palladium.getProperty(entity, `petrosapien_${uniform}_skincolor_palette_1_color_6`) || "58B764");

                let nbtData = `{data:{Color0:${color0},Color1:${color1},Color2:${color2},Color3:${color3},Color4:${color4},Color5:${color5}}}`;

                let rayResult = global.commandBasedRaycast(entity, scaledRange, blockTag);

                if (rayResult.hit) {
                    let distance = rayResult.distance;

                    let advancedOffsets = [
                        { right: 0, up: 0, forward: -0.2 },
                        { right: 0.85, up: 0, forward: -0.2 },
                        { right: -0.85, up: 0, forward: -0.2 },
                        { right: 0, up: 0.85, forward: -0.2 },
                        { right: 0, up: -0.85, forward: -0.2 },
                        { right: 0.7, up: 0.7, forward: -0.2 },
                        { right: 0.7, up: -0.7, forward: -0.2 },
                        { right: -0.7, up: 0.7, forward: -0.2 },
                        { right: -0.7, up: -0.7, forward: -0.2 },
                        { right: 1.4, up: 0, forward: -0.2 },
                        { right: -1.4, up: 0, forward: -0.2 },
                        { right: 0, up: 1.4, forward: -0.2 },
                        { right: 0, up: -1.4, forward: -0.2 }
                    ];

                    let blocksPlaced = false;

                    for (let offset of advancedOffsets) {
                        let crystalType = Math.random() < 0.5 ? "alienevo:crystal_block" : "alienevo:smooth_crystal_block";

                        let checkCommand = `execute as ${playerName} at ${playerName} anchored eyes positioned ^ ^ ^${distance.toFixed(1)} positioned ^${offset.right} ^${offset.up} ^${offset.forward} if block ~ ~ ~ ${blockTag} run tag ${playerName} add can_place_here`;
                        entity.server.runCommandSilent(checkCommand);

                        if (entity.tags.contains('can_place_here')) {
                            let placeCommand = `execute as ${playerName} at ${playerName} anchored eyes positioned ^ ^ ^${distance.toFixed(1)} positioned ^${offset.right} ^${offset.up} ^${offset.forward} run setblock ~ ~ ~ ${crystalType}${nbtData}`;
                            entity.server.runCommandSilent(placeCommand);

                            blocksPlaced = true;
                            entity.server.runCommandSilent(`tag ${playerName} remove can_place_here`);
                        }
                    }

                    if (blocksPlaced) {
                        entity.level.playSound(null, entity.x, entity.y, entity.z, 'minecraft:block.amethyst_cluster.place', entity.getSoundSource(), 1.0, 1.0);
                    }
                }
            }
        });
});

StartupEvents.registry('palladium:abilities', (event) => {
    event.create('alienevo:line_bridge')
        .icon(palladium.createItemIcon('minecraft:armor_stand'))
        .addProperty("maxRange", "float", 10.0, "Maximum range of the line")
        .addProperty("spawnDelay", "float", 3, "Delay in ticks between each armor stand spawn")
        .tick((entity, entry, holder, enabled) => {
            if (enabled && entity.isPlayer()) {
                let maxRange = entry.getPropertyByName("maxRange");
                let spawnDelay = entry.getPropertyByName("spawnDelay");

                let playerX = Math.floor(entity.x);
                let playerY = Math.floor(entity.y);
                let playerZ = Math.floor(entity.z);

                let yaw = entity.getYaw() || 0;
                let yawRad = yaw * 0.017453292519943295;

                let dirX = -Math.sin(yawRad);
                let dirZ = Math.cos(yawRad);

                let spawnIndex = 0;
                for (let distance = 3.2; distance <= maxRange; distance += 0.7) {
                    let targetX = playerX + (dirX * distance);
                    let targetY = playerY;
                    let targetZ = playerZ + (dirZ * distance);

                    let groundY = targetY;
                    let isSolidGround = false;
                    for (let checkY = targetY + 2; checkY >= targetY - 40; checkY--) {
                        let block = entity.level.getBlock(Math.floor(targetX), checkY, Math.floor(targetZ));
                        if (block && block.getId() !== "minecraft:air") {
                            let pos = new BlockPos(Math.floor(targetX), checkY, Math.floor(targetZ));
                            let isSolid = !block.blockState.getCollisionShape(entity.level, pos).isEmpty();

                            if (isSolid) {
                                groundY = checkY + 1;
                                isSolidGround = true;
                            } else {
                                let scale = 0.6 + (spawnIndex * 0.05);
                                scale = Math.min(scale, 1.7);

                                let heightOffset = 0.1 - ((scale - 0.6) / (1.7 - 0.6)) * (0.1 - (-0.2));

                                groundY = checkY + heightOffset;
                                isSolidGround = false;
                            }
                            break;
                        }
                    }

                    let delay = spawnIndex * spawnDelay;
                    let currentSpawnIndex = spawnIndex;
                    spawnIndex++;

                    entity.server.schedule(delay, () => {
                        try {
                            let armorStand = entity.level.createEntity('minecraft:armor_stand');

                            let spawnY = groundY - 4.4;
                            armorStand.setPosition(targetX + 0.5, spawnY, targetZ + 0.5);

                            armorStand.setNoGravity(true);
                            armorStand.setInvisible(true);

                            let randomYaw = Math.random() * 360;
                            let randomPitch = Math.random() * 60 - 30;

                            try {
                                armorStand.setYaw(randomYaw);
                                armorStand.setPitch(randomPitch);
                            } catch (rotationError) {
                            }

                            armorStand.spawn();

                            let scale = 0.6 + (currentSpawnIndex * 0.05);
                            scale = Math.min(scale, 1.7);

                            try {
                                SCALE_TYPES.HEIGHT.getScaleData(armorStand).setScale(scale);
                                SCALE_TYPES.WIDTH.getScaleData(armorStand).setScale(scale);
                            } catch (scaleError) {
                            }
                            try {
                                palladium.superpowers.addSuperpower(armorStand, "alienevo:spike");
                            } catch (superpowerError) {
                            }

                            try {
                                let uniform = palladium.getProperty(entity, 'uniform') || "prototype";

                                palladium.setProperty(armorStand, 'uniform', uniform);

                                let color1 = palladium.getProperty(entity, 'petrosapien_' + uniform + '_skincolor_palette_1_color_1') || "EF0909";
                                let color2 = palladium.getProperty(entity, 'petrosapien_' + uniform + '_skincolor_palette_1_color_2') || "CE4E4A";
                                let color3 = palladium.getProperty(entity, 'petrosapien_' + uniform + '_skincolor_palette_1_color_3') || "A99C86";
                                let color4 = palladium.getProperty(entity, 'petrosapien_' + uniform + '_skincolor_palette_1_color_4') || "870B18";
                                let color5 = palladium.getProperty(entity, 'petrosapien_' + uniform + '_skincolor_palette_1_color_5') || "6DE1F8";
                                let color6 = palladium.getProperty(entity, 'petrosapien_' + uniform + '_skincolor_palette_1_color_6') || "58B764";

                                palladium.setProperty(armorStand, 'petrosapien_' + uniform + '_skincolor_palette_1_color_1', color1);
                                palladium.setProperty(armorStand, 'petrosapien_' + uniform + '_skincolor_palette_1_color_2', color2);
                                palladium.setProperty(armorStand, 'petrosapien_' + uniform + '_skincolor_palette_1_color_3', color3);
                                palladium.setProperty(armorStand, 'petrosapien_' + uniform + '_skincolor_palette_1_color_4', color4);
                                palladium.setProperty(armorStand, 'petrosapien_' + uniform + '_skincolor_palette_1_color_5', color5);
                                palladium.setProperty(armorStand, 'petrosapien_' + uniform + '_skincolor_palette_1_color_6', color6);
                            } catch (colorError) {
                            }

                            try {
                                let depthOffset = -0.5 - (scale - 0.6) * 1.0;
                                let finalY = groundY + depthOffset;
                                armorStand.teleportTo(targetX + 0.5, finalY, targetZ + 0.5);

                                entity.level.playSound(null, targetX, groundY, targetZ, 'minecraft:block.stone.break', entity.getSoundSource(), 2.0, 0.8);
                                entity.level.playSound(null, targetX, groundY, targetZ, 'minecraft:block.amethyst_block.step', entity.getSoundSource(), 2, 1.0);
                            } catch (teleportError) {
                            }

                            let capturedScale = scale;
                            for (let second = 5; second <= 400; second += 5) {
                                entity.server.schedule(second * 20, () => {
                                    if (armorStand.isAlive()) {
                                        try {
                                            let damage = 1 + ((capturedScale - 0.6) / (1.7 - 0.6)) * (3 - 1);
                                            let radius = 1.5 + ((capturedScale - 0.6) / (1.7 - 0.6)) * (3.5 - 1.5);

                                            damage = Math.max(1, Math.min(3, damage));
                                            radius = Math.max(1.5, Math.min(3.5, radius));

                                            let nearbyEntities = entity.level.getEntitiesWithin(AABB.of(
                                                armorStand.x - radius, armorStand.y - 3, armorStand.z - radius,
                                                armorStand.x + radius, armorStand.y + 3, armorStand.z + radius
                                            ));

                                            nearbyEntities.forEach(nearbyEntity => {
                                                if (nearbyEntity !== armorStand && nearbyEntity.isLiving() && nearbyEntity.type !== 'minecraft:armor_stand') {
                                                    if (nearbyEntity.isPlayer()) {
                                                        try {
                                                            let hasPetrosapienPower = palladium.superpowers.hasSuperpower(nearbyEntity, "alienevo_aliens:petrosapien");
                                                            if (hasPetrosapienPower) {
                                                                return;
                                                            }
                                                        } catch (powerCheckError) {
                                                        }
                                                    }

                                                    let distance = Math.sqrt(
                                                        Math.pow(nearbyEntity.x - armorStand.x, 2) +
                                                        Math.pow(nearbyEntity.z - armorStand.z, 2)
                                                    );

                                                    if (distance <= radius) {
                                                        nearbyEntity.attack(armorStand.damageSources().generic(), damage);
                                                        nearbyEntity.potionEffects.add("minecraft:slowness", 2, 5, true, true);
                                                    }
                                                }
                                            });
                                        } catch (damageError) {
                                        }
                                    }
                                });
                            }
                        } catch (error) {
                        }
                    });
                }
            }
        });
});

StartupEvents.registry('palladium:abilities', (event) => {
    event.create('alienevo:spike_dome')
        .icon(palladium.createItemIcon('minecraft:armor_stand'))
        .addProperty("scale", "float", 1.35, "Scale of the spike")
        .tick((entity, entry, holder, enabled) => {
            if (enabled && entity.isPlayer()) {
                let scale = entry.getPropertyByName("scale");

                let armorStand = entity.level.createEntity('minecraft:armor_stand');
                armorStand.setPosition(entity.x, entity.y, entity.z);

                armorStand.setNoGravity(true);
                armorStand.setInvisible(true);
                armorStand.spawn();

                SCALE_TYPES.HEIGHT.getScaleData(armorStand).setScale(scale);
                SCALE_TYPES.WIDTH.getScaleData(armorStand).setScale(scale);

                palladium.superpowers.addSuperpower(armorStand, "alienevo:crystal_burst");

                let uniform = palladium.getProperty(entity, 'uniform') || "prototype";
                palladium.setProperty(armorStand, 'uniform', uniform);

                let color1 = palladium.getProperty(entity, 'petrosapien_' + uniform + '_skincolor_palette_1_color_1') || "EF0909";
                let color2 = palladium.getProperty(entity, 'petrosapien_' + uniform + '_skincolor_palette_1_color_2') || "CE4E4A";
                let color3 = palladium.getProperty(entity, 'petrosapien_' + uniform + '_skincolor_palette_1_color_3') || "A99C86";
                let color4 = palladium.getProperty(entity, 'petrosapien_' + uniform + '_skincolor_palette_1_color_4') || "870B18";
                let color5 = palladium.getProperty(entity, 'petrosapien_' + uniform + '_skincolor_palette_1_color_5') || "6DE1F8";
                let color6 = palladium.getProperty(entity, 'petrosapien_' + uniform + '_skincolor_palette_1_color_6') || "58B764";

                palladium.setProperty(armorStand, 'petrosapien_' + uniform + '_skincolor_palette_1_color_1', color1);
                palladium.setProperty(armorStand, 'petrosapien_' + uniform + '_skincolor_palette_1_color_2', color2);
                palladium.setProperty(armorStand, 'petrosapien_' + uniform + '_skincolor_palette_1_color_3', color3);
                palladium.setProperty(armorStand, 'petrosapien_' + uniform + '_skincolor_palette_1_color_4', color4);
                palladium.setProperty(armorStand, 'petrosapien_' + uniform + '_skincolor_palette_1_color_5', color5);
                palladium.setProperty(armorStand, 'petrosapien_' + uniform + '_skincolor_palette_1_color_6', color6);

                entity.level.playSound(null, entity.x, entity.y, entity.z, 'minecraft:block.amethyst_cluster.break', entity.getSoundSource(), 2.0, 1.2);
                entity.level.playSound(null, entity.x, entity.y, entity.z, 'minecraft:block.glass.break', entity.getSoundSource(), 1.5, 1.4);
                entity.level.playSound(null, entity.x, entity.y, entity.z, 'minecraft:block.gravel.break', entity.getSoundSource(), 1.8, 0.8);
                entity.level.playSound(null, entity.x, entity.y, entity.z, 'minecraft:block.amethyst_cluster.place', entity.getSoundSource(), 1.2, 1.7);
                entity.level.playSound(null, entity.x, entity.y, entity.z, 'minecraft:block.stone.break', entity.getSoundSource(), 1.6, 0.9);
                entity.level.playSound(null, entity.x, entity.y, entity.z, 'minecraft:entity.experience_orb.pickup', entity.getSoundSource(), 1.0, 1.3);
            }
        });
});