StartupEvents.registry('palladium:abilities', (event) => {
    event.create('alienevo:block_wave')
        .icon(palladium.createItemIcon('minecraft:tnt'))
        .addProperty("radius", "float", 5.0, "Radius of the block wave effect")
        .addProperty("enableVisuals", "boolean", true, "Enable particle effects")
        .addProperty("isDestructionEnabled", "boolean", true, "Enable block breaking")
        .tick((entity, entry, holder, enabled) => {
            if (enabled && entity.isPlayer()) {
                let radius = entry.getPropertyByName("radius");
                let enableVisuals = entry.getPropertyByName("enableVisuals");
                let isDestructionEnabled = entry.getPropertyByName("isDestructionEnabled");

                if (enableVisuals) {
                    var footX = Math.floor(entity.x);
                    var footY = Math.floor(entity.y) - 1;
                    var footZ = Math.floor(entity.z);
                    var playerY = Math.floor(entity.y);

                    for (var x = -radius; x <= radius; x++) {
                        for (var z = -radius; z <= radius; z++) {
                            if (x === 0 && z === 0) {
                                continue;
                            }

                            var distance = Math.sqrt(x * x + z * z);
                            if (distance <= radius) {
                                var delay = Math.floor(radius - distance);
                                var blockX_sched = footX + x;
                                var blockZ_sched = footZ + z;
                                var currentDistance_sched = distance;
                                var current_x = x;
                                var current_z = z;

                                entity.server.schedule(delay, () => {
                                    var block = entity.level.getBlock(blockX_sched, footY, blockZ_sched);
                                    var blockId = block.getId();

                                    if (blockId === "minecraft:air") return;

                                    // --- Define solidity, indestructibility, and storage blocks ---
                                    let isIndestructible = false;
                                    let isSolid = false;
                                    let isStorageBlock = false;

                                    try {
                                        // collision check
                                        let pos = BlockPos(blockX_sched, footY, blockZ_sched);
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

                                        // Additional check for blocks that contain storage keywords in their name
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
                                            let blockEntity = entity.level.getBlockEntity(blockX_sched, footY, blockZ_sched);
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
                                    if (!isSolid || isStorageBlock) return;

                                    var effectStrength = currentDistance_sched / radius;
                                    var blockParticleCount = Math.ceil(25 * effectStrength);

                                    // Only destroy if destruction is enabled, block is not indestructible, and not a storage block
                                    if (isDestructionEnabled && !isIndestructible && !isStorageBlock) {
                                        var motion = 0.25 + Math.abs(current_x) * 0.02 + Math.abs(current_z) * 0.02;

                                        try {
                                            let fallingBlockEntity = entity.level.createEntity("falling_block");
                                            fallingBlockEntity.setPosition(blockX_sched + 0.5, footY, blockZ_sched + 0.5);

                                            let entityNbt = fallingBlockEntity.nbt;
                                            entityNbt.BlockState = {Name: blockId};

                                            if (block.properties) {
                                                entityNbt.BlockState.Properties = block.properties;
                                            }

                                            fallingBlockEntity.mergeNbt(entityNbt);
                                            block.set("air");
                                            fallingBlockEntity.spawn();
                                            fallingBlockEntity.setMotion(0, motion, 0);
                                        } catch (error) {
                                            // Fallback to command-based approach if entity creation fails
                                            try {
                                                entity.runCommandSilent(
                                                    `summon falling_block ${blockX_sched} ${footY} ${blockZ_sched} {Motion:[0.0d,${motion}d,0.0d],Time:1,BlockState:{Name:"${blockId}"}}`
                                                );
                                                block.set("air");
                                            } catch (commandError) {}
                                        }
                                    }

                                    if (blockParticleCount > 0) {
                                        entity.level.spawnParticles(
                                            'block ' + blockId,
                                            true,
                                            blockX_sched + 0.5,
                                            playerY + 0.5,
                                            blockZ_sched + 0.5,
                                            0.2, 0.4, 0.2,
                                            blockParticleCount,
                                            0.1
                                        );

                                        // Add explosion particle for visual effect
                                        entity.level.spawnParticles(
                                            'minecraft:explosion',
                                            true,
                                            blockX_sched + 0.5,
                                            playerY + 0.5,
                                            blockZ_sched + 0.5,
                                            0.1, 0.1, 0.1,
                                            1,
                                            0.0
                                        );
                                    }

                                    try {
                                        entity.level.playSound(
                                            null,
                                            blockX_sched,
                                            footY,
                                            blockZ_sched,
                                            'minecraft:entity.generic.explode',
                                            entity.getSoundSource(),
                                            0.3 * effectStrength,
                                            0.8 + Math.random() * 0.4
                                        );
                                    } catch (soundError) {}
                                });
                            }
                        }
                    }
                }
            }
        });
});