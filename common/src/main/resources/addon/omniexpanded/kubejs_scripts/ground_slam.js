global.GSLAM = (entity, target, strength) => {
    const dx = target.x - entity.x;
    const dz = target.z - entity.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance > 0) {
        const multiplier = strength / distance;
        target.addMotion(
            dx * multiplier,
            3.4 * strength,
            dz * multiplier
        );
    }
};

StartupEvents.registry('palladium:abilities', (event) => {
    event
        .create('alienevo:line_block_wave')
        .icon(palladium.createItemIcon('minecraft:tnt'))
        .addProperty('maxRange', 'float', 12.0, 'Maximum range of the line')
        .addProperty('waveDelay', 'float', 3.0, 'Delay in ticks between each wave step')
        .addProperty('enableVisuals', 'boolean', true, 'Enable particle effects')
        .addProperty('isDestructionEnabled', 'boolean', true, 'Enable block breaking')
        .addProperty('lineWidth', 'float', 1.0, 'Width of the destruction line (0.5-3.0)')
        .addProperty('damageAmount', 'float', 15.0, 'Damage dealt to entities')
        .addProperty('knockbackStrength', 'float', 0.5, 'Knockback strength applied to entities')
        .tick((entity, entry, holder, enabled) => {
            if (!(enabled && entity.isPlayer())) return;

            let maxRange = entry.getPropertyByName('maxRange');
            let waveDelay = entry.getPropertyByName('waveDelay');
            let enableVisuals = entry.getPropertyByName('enableVisuals');
            let isDestructionEnabled = entry.getPropertyByName('isDestructionEnabled');
            let lineWidth = Math.max(0.5, Math.min(3.0, entry.getPropertyByName('lineWidth')));
            let damageAmount = entry.getPropertyByName('damageAmount');
            let knockbackStrength = entry.getPropertyByName('knockbackStrength');

            let pX = entity.x;
            let pY = entity.y;
            let pZ = entity.z;
            let footY = Math.floor(pY) - 1;

            let yaw = entity.getYaw() || 0;
            let yawRad = yaw * 0.017453292519943295;

            let dirX = -Math.sin(yawRad);
            let dirZ = Math.cos(yawRad);

            let perpX = -dirZ;
            let perpZ = dirX;

            let stepIndex = 0;
            for (let distance = 1.0; distance <= maxRange; distance += 0.8) {
                let delay = stepIndex * waveDelay;
                let currentStepIndex = stepIndex;
                stepIndex++;

                let centerX = pX + dirX * distance;
                let centerZ = pZ + dirZ * distance;

                entity.server.schedule(delay, () => {
                    let widthSteps = Math.ceil(lineWidth * 2);

                    for (let w = -widthSteps; w <= widthSteps; w++) {
                        let offsetDistance = w * 0.5;
                        if (Math.abs(offsetDistance) > lineWidth) continue;

                        let blockX = Math.floor(centerX + perpX * offsetDistance);
                        let blockZ = Math.floor(centerZ + perpZ * offsetDistance);

                        let groundY = footY;
                        for (let checkY = footY + 1; checkY >= footY; checkY--) {
                            let checkBlock = entity.level.getBlock(blockX, checkY, blockZ);
                            if (checkBlock && checkBlock.getId() !== 'minecraft:air') {
                                groundY = checkY;
                                break;
                            }
                        }

                        let block = entity.level.getBlock(blockX, groundY, blockZ);
                        let blockId = block.getId();
                        if (blockId === 'minecraft:air') continue;

                        // --- Define solidity, indestructibility, and storage blocks ---
                        let isIndestructible = false;
                        let isSolid = false;
                        let isStorageBlock = false;

                        try {
                            // collision check
                            let pos = BlockPos(blockX, groundY, blockZ);
                            isSolid = !block.blockState.getCollisionShape(entity.level, pos).isEmpty();

                            // indestructible check
                            let blockType = Block.getBlock(blockId);
                            if (blockType && blockType.defaultDestroyTime() < 0) {
                                isIndestructible = true;
                            }

                            // storage block check - comprehensive list of storage containers
                            let storageBlockIds = [
                                'minecraft:chest',
                                'minecraft:trapped_chest',
                                'minecraft:ender_chest',
                                'minecraft:shulker_box',
                                'minecraft:white_shulker_box',
                                'minecraft:orange_shulker_box',
                                'minecraft:magenta_shulker_box',
                                'minecraft:light_blue_shulker_box',
                                'minecraft:yellow_shulker_box',
                                'minecraft:lime_shulker_box',
                                'minecraft:pink_shulker_box',
                                'minecraft:gray_shulker_box',
                                'minecraft:light_gray_shulker_box',
                                'minecraft:cyan_shulker_box',
                                'minecraft:purple_shulker_box',
                                'minecraft:blue_shulker_box',
                                'minecraft:brown_shulker_box',
                                'minecraft:green_shulker_box',
                                'minecraft:red_shulker_box',
                                'minecraft:black_shulker_box',
                                'minecraft:barrel',
                                'alienevo:omnitrix_workbench',
                                'minecraft:furnace',
                                'minecraft:blast_furnace',
                                'minecraft:smoker',
                                'minecraft:dropper',
                                'minecraft:dispenser',
                                'minecraft:hopper',
                                'minecraft:brewing_stand',
                                'minecraft:beacon',
                                'minecraft:lectern',
                                'minecraft:bookshelf',
                                'minecraft:chiseled_bookshelf',
                                'minecraft:jukebox',
                                'minecraft:flower_pot',
                                'minecraft:item_frame',
                                'minecraft:glow_item_frame',
                                'minecraft:armor_stand'
                            ];

                            // Check if block ID matches any storage block
                            if (storageBlockIds.includes(blockId)) {
                                isStorageBlock = true;
                            }

                            // Additional check for blocks that contain "chest", "barrel", "furnace", or "shulker" in their name
                            if (blockId.includes('chest') ||
                                blockId.includes('barrel') ||
                                blockId.includes('furnace') ||
                                blockId.includes('shulker') ||
                                blockId.includes('hopper') ||
                                blockId.includes('dispenser') ||
                                blockId.includes('dropper')) {
                                isStorageBlock = true;
                            }

                            // Check if the block has inventory capability (for modded blocks)
                            try {
                                let blockEntity = entity.level.getBlockEntity(blockX, groundY, blockZ);
                                if (blockEntity && (blockEntity.getCapability || blockEntity.hasCapability)) {
                                    // This is likely a storage block with inventory
                                    isStorageBlock = true;
                                }
                            } catch (capError) {
                                // Ignore capability check errors
                            }

                        } catch (error) {
                            // default assumptions: not indestructible, not solid, not storage
                            isSolid = false;
                        }

                        // ignore non-solid blocks (no collision) or storage blocks
                        if (!isSolid || isStorageBlock) continue;

                        let dx = (centerX + 0.5) - pX;
                        let dz = (centerZ + 0.5) - pZ;
                        let horizDist = Math.sqrt(dx * dx + dz * dz);

                        let effectStrength = Math.max(0.3, 1.0 - horizDist / maxRange);
                        let blockParticleCount = Math.ceil(25 * effectStrength);

                        let motionY = 0.25 + horizDist * 0.02;

                        let damageRadius = 2.0;
                        let nearbyEntities = entity.level.getEntitiesWithin(AABB.of(
                            blockX - damageRadius, groundY - 1, blockZ - damageRadius,
                            blockX + damageRadius, groundY + 3, blockZ + damageRadius
                        ));

                        nearbyEntities.forEach(nearbyEntity => {
                            if (nearbyEntity !== entity && nearbyEntity.isLiving()) {
                                let distance = Math.sqrt(
                                    Math.pow(nearbyEntity.x - (blockX + 0.5), 2) +
                                    Math.pow(nearbyEntity.z - (blockZ + 0.5), 2)
                                );

                                if (distance <= damageRadius) {
                                    nearbyEntity.attack(entity.damageSources().generic(), damageAmount);

                                    if (knockbackStrength > 0) {
                                        global.GSLAM(entity, nearbyEntity, knockbackStrength);
                                    }
                                }
                            }
                        });

                        // destroy block if enabled and not a storage block
                        if (isDestructionEnabled && !isIndestructible && !isStorageBlock) {
                            try {
                                entity.runCommandSilent(
                                    `summon falling_block ${blockX} ${groundY} ${blockZ} {Motion:[0.0d,${motionY}d,0.0d],Time:1,BlockState:{Name:"${blockId}"}}`
                                );
                                block.set('air');
                            } catch (error) {}
                        }

                        if (enableVisuals && blockParticleCount > 0) {
                            entity.level.spawnParticles(
                                'block ' + blockId,
                                true,
                                blockX + 0.5,
                                groundY + 2,
                                blockZ + 0.5,
                                0.2,
                                0.4,
                                0.2,
                                blockParticleCount,
                                0.5
                            );

                            entity.level.spawnParticles(
                                'minecraft:explosion',
                                true,
                                blockX + 0.5,
                                groundY + 1.0,
                                blockZ + 0.5,
                                0.1,
                                0.1,
                                0.1,
                                1,
                                0.0
                            );
                        }

                        try {
                            entity.level.playSound(
                                null,
                                blockX,
                                groundY,
                                blockZ,
                                'minecraft:entity.generic.explode',
                                entity.getSoundSource(),
                                0.5 * effectStrength,
                                0.8 + Math.random() * 0.4
                            );
                        } catch (soundError) {}
                    }
                });
            }

            try {
                entity.level.playSound(
                    null,
                    Math.floor(pX),
                    Math.floor(pY),
                    Math.floor(pZ),
                    'minecraft:entity.wither.break_block',
                    entity.getSoundSource(),
                    1.24,
                    0.6
                );
            } catch (activationSoundError) {}
        });
});