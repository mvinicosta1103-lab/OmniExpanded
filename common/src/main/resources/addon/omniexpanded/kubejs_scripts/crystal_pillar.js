StartupEvents.registry('palladium:abilities', (event) => {
    function hexToDecimal(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        return parseInt(hex, 16);
    }

    function placeColoredBlock(entity, blockX, blockY, blockZ, blockType, nbtData) {
        let block = entity.level.getBlock(blockX, blockY, blockZ);

        if (block && block.getId() === "minecraft:air") {
            let actualBlockType = blockType;
            if (blockType === "alienevo:crystal_block") {
                let blockVariant = Math.random();
                if (blockVariant < 0.4) {
                    actualBlockType = "alienevo:smooth_crystal_block";
                } else if (blockVariant < 0.7) {
                    actualBlockType = "alienevo:crystal_block";
                } else {
                    actualBlockType = "alienevo:crystal_block";
                }
            }

            if (actualBlockType === "alienevo:crystal_block" || actualBlockType === "alienevo:smooth_crystal_block") {
                // Use server-level command execution with player context for block placement
                let command = `execute as ${entity.username} at ${entity.username} run setblock ${blockX} ${blockY} ${blockZ} ${actualBlockType}${nbtData}`;
                entity.server.runCommandSilent(command);
            } else {
                block.set(blockType);
            }
            entity.level.playSound(null, blockX, blockY, blockZ, 'minecraft:block.amethyst_block.place', entity.getSoundSource(), 1.0, 1.3);
            return true;
        } else {
            return false;
        }
    }

    function getPlatformSize(currentHeight, maxHeight) {
        let heightRatio = currentHeight / maxHeight;
        let sizeChance = Math.random();

        if (heightRatio > 0.7) {
            return sizeChance < 0.7 ? 2 : 3;
        } else if (heightRatio > 0.4) {
            return sizeChance < 0.5 ? 2 : 3;
        } else {
            return sizeChance < 0.3 ? 2 : 3;
        }
    }

    function generateCrystalPlatform(centerX, centerZ, size, currentHeight, maxHeight, entity) {
        let platformBlocks = [];
        let spikeBlocks = [];

        if (isNaN(centerX) || isNaN(centerZ) || isNaN(size)) {
            return {
                platformBlocks: [{ x: Math.floor(centerX) || 0, z: Math.floor(centerZ) || 0 }],
                spikeBlocks: []
            };
        }

        if (currentHeight === 0) {
            let baseVariant = Math.random();

            if (baseVariant < 0.7) {
                platformBlocks.push({ x: Math.floor(centerX), z: Math.floor(centerZ) });
                platformBlocks.push({ x: Math.floor(centerX), z: Math.floor(centerZ - 1) });
                platformBlocks.push({ x: Math.floor(centerX), z: Math.floor(centerZ + 1) });
                platformBlocks.push({ x: Math.floor(centerX - 1), z: Math.floor(centerZ) });
                platformBlocks.push({ x: Math.floor(centerX + 1), z: Math.floor(centerZ) });

                if (Math.random() < 0.5) {
                    let cornerCount = Math.floor(Math.random() * 2) + 1;
                    let corners = [
                        { x: Math.floor(centerX - 1), z: Math.floor(centerZ - 1) },
                        { x: Math.floor(centerX + 1), z: Math.floor(centerZ - 1) },
                        { x: Math.floor(centerX - 1), z: Math.floor(centerZ + 1) },
                        { x: Math.floor(centerX + 1), z: Math.floor(centerZ + 1) }
                    ];

                    for (let i = corners.length - 1; i > 0; i--) {
                        let j = Math.floor(Math.random() * (i + 1));
                        [corners[i], corners[j]] = [corners[j], corners[i]];
                    }

                    for (let i = 0; i < cornerCount; i++) {
                        platformBlocks.push(corners[i]);
                    }
                }
            } else {
                for (let x = -1; x <= 1; x++) {
                    for (let z = -1; z <= 1; z++) {
                        platformBlocks.push({
                            x: Math.floor(centerX) + x,
                            z: Math.floor(centerZ) + z
                        });
                    }
                }
            }
        } else {
            let platformVariant = Math.random();

            if (platformVariant < 0.7) {
                platformBlocks.push({ x: Math.floor(centerX), z: Math.floor(centerZ) });
                platformBlocks.push({ x: Math.floor(centerX), z: Math.floor(centerZ - 1) });
                platformBlocks.push({ x: Math.floor(centerX), z: Math.floor(centerZ + 1) });
                platformBlocks.push({ x: Math.floor(centerX - 1), z: Math.floor(centerZ) });
                platformBlocks.push({ x: Math.floor(centerX + 1), z: Math.floor(centerZ) });

                if (Math.random() < 0.6) {
                    platformBlocks.push({ x: Math.floor(centerX - 1), z: Math.floor(centerZ - 1) });
                    platformBlocks.push({ x: Math.floor(centerX + 1), z: Math.floor(centerZ - 1) });
                    platformBlocks.push({ x: Math.floor(centerX - 1), z: Math.floor(centerZ + 1) });
                    platformBlocks.push({ x: Math.floor(centerX + 1), z: Math.floor(centerZ + 1) });
                }
            } else if (platformVariant < 0.9) {
                platformBlocks.push({ x: Math.floor(centerX), z: Math.floor(centerZ) });
                let lShape = Math.floor(Math.random() * 4);
                switch (lShape) {
                    case 0:
                        platformBlocks.push({ x: Math.floor(centerX), z: Math.floor(centerZ - 1) });
                        platformBlocks.push({ x: Math.floor(centerX + 1), z: Math.floor(centerZ) });
                        platformBlocks.push({ x: Math.floor(centerX + 1), z: Math.floor(centerZ - 1) });
                        break;
                    case 1:
                        platformBlocks.push({ x: Math.floor(centerX), z: Math.floor(centerZ + 1) });
                        platformBlocks.push({ x: Math.floor(centerX + 1), z: Math.floor(centerZ) });
                        platformBlocks.push({ x: Math.floor(centerX + 1), z: Math.floor(centerZ + 1) });
                        break;
                    case 2:
                        platformBlocks.push({ x: Math.floor(centerX), z: Math.floor(centerZ + 1) });
                        platformBlocks.push({ x: Math.floor(centerX - 1), z: Math.floor(centerZ) });
                        platformBlocks.push({ x: Math.floor(centerX - 1), z: Math.floor(centerZ + 1) });
                        break;
                    case 3:
                        platformBlocks.push({ x: Math.floor(centerX), z: Math.floor(centerZ - 1) });
                        platformBlocks.push({ x: Math.floor(centerX - 1), z: Math.floor(centerZ) });
                        platformBlocks.push({ x: Math.floor(centerX - 1), z: Math.floor(centerZ - 1) });
                        break;
                }
            } else {
                platformBlocks.push({ x: Math.floor(centerX), z: Math.floor(centerZ) });
                let lineType = Math.floor(Math.random() * 2);
                if (lineType === 0) {
                    platformBlocks.push({ x: Math.floor(centerX), z: Math.floor(centerZ - 1) });
                    platformBlocks.push({ x: Math.floor(centerX), z: Math.floor(centerZ + 1) });
                    platformBlocks.push({ x: Math.floor(centerX - 1), z: Math.floor(centerZ) });
                    platformBlocks.push({ x: Math.floor(centerX + 1), z: Math.floor(centerZ) });
                } else {
                    platformBlocks.push({ x: Math.floor(centerX - 1), z: Math.floor(centerZ) });
                    platformBlocks.push({ x: Math.floor(centerX + 1), z: Math.floor(centerZ) });
                    platformBlocks.push({ x: Math.floor(centerX), z: Math.floor(centerZ - 1) });
                    platformBlocks.push({ x: Math.floor(centerX), z: Math.floor(centerZ + 1) });
                }
            }
        }

        let heightRatio = currentHeight / maxHeight;
        let maxVerticalSpikes = Math.floor(Math.random() * 2) + 1;

        if (currentHeight === maxHeight - 1) {
            maxVerticalSpikes = 0;
        } else if (heightRatio > 0.8) {
            maxVerticalSpikes = 1;
        }

        let availableSpikePositions = [
            { x: Math.floor(centerX), z: Math.floor(centerZ - 1), name: "North" },
            { x: Math.floor(centerX), z: Math.floor(centerZ + 1), name: "South" },
            { x: Math.floor(centerX - 1), z: Math.floor(centerZ), name: "West" },
            { x: Math.floor(centerX + 1), z: Math.floor(centerZ), name: "East" },
            { x: Math.floor(centerX - 1), z: Math.floor(centerZ - 1), name: "Northwest" },
            { x: Math.floor(centerX + 1), z: Math.floor(centerZ - 1), name: "Northeast" },
            { x: Math.floor(centerX - 1), z: Math.floor(centerZ + 1), name: "Southwest" },
            { x: Math.floor(centerX + 1), z: Math.floor(centerZ + 1), name: "Southeast" }
        ];

        for (let i = availableSpikePositions.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [availableSpikePositions[i], availableSpikePositions[j]] = [availableSpikePositions[j], availableSpikePositions[i]];
        }

        let numVerticalSpikes = Math.min(maxVerticalSpikes, availableSpikePositions.length);

        for (let i = 0; i < numVerticalSpikes; i++) {
            let selectedPos = availableSpikePositions[i];
            let spike = { blocks: [] };

            let spikeHeight = Math.random() < 0.8 ? 1 : 2;

            for (let h = 1; h <= spikeHeight; h++) {
                spike.blocks.push({ x: selectedPos.x, z: selectedPos.z, height: h });

                if (h === 1 && Math.random() < 0.4) {
                    let thickOffsets = [
                        { x: 1, z: 0 }, { x: -1, z: 0 }, { x: 0, z: 1 }, { x: 0, z: -1 }
                    ];

                    let numThickBlocks = Math.floor(Math.random() * 2) + 1;
                    for (let t = 0; t < numThickBlocks; t++) {
                        let randomOffset = thickOffsets[t % thickOffsets.length];
                        spike.blocks.push({
                            x: selectedPos.x + randomOffset.x,
                            z: selectedPos.z + randomOffset.z,
                            height: h
                        });
                    }
                }

                if (h === 2 && spikeHeight >= 2 && Math.random() < 0.25) {
                    let branchOffsets = [
                        { x: 1, z: 0 }, { x: -1, z: 0 }, { x: 0, z: 1 }, { x: 0, z: -1 }
                    ];
                    let randomOffset = branchOffsets[Math.floor(Math.random() * branchOffsets.length)];
                    spike.blocks.push({
                        x: selectedPos.x + randomOffset.x,
                        z: selectedPos.z + randomOffset.z,
                        height: h
                    });
                }
            }

            spikeBlocks.push(spike);
        }

        let maxHorizontalSpikes = Math.random() < 0.4 ? 1 : 0;

        for (let i = 0; i < maxHorizontalSpikes; i++) {
            let spike = { blocks: [] };

            let directions = [
                { angle: 0, startX: Math.floor(centerX + 1), startZ: Math.floor(centerZ), name: "East" },
                { angle: 1.5708, startX: Math.floor(centerX), startZ: Math.floor(centerZ - 1), name: "North" },
                { angle: 3.14159, startX: Math.floor(centerX - 1), startZ: Math.floor(centerZ), name: "West" },
                { angle: 4.71239, startX: Math.floor(centerX), startZ: Math.floor(centerZ + 1), name: "South" },
                { angle: 0.7854, startX: Math.floor(centerX + 1), startZ: Math.floor(centerZ - 1), name: "Northeast" },
                { angle: 2.3562, startX: Math.floor(centerX - 1), startZ: Math.floor(centerZ - 1), name: "Northwest" },
                { angle: 3.9270, startX: Math.floor(centerX - 1), startZ: Math.floor(centerZ + 1), name: "Southwest" },
                { angle: 5.4978, startX: Math.floor(centerX + 1), startZ: Math.floor(centerZ + 1), name: "Southeast" }
            ];

            let selectedDirection = directions[Math.floor(Math.random() * directions.length)];
            let angle = selectedDirection.angle;

            let spikeLength = Math.random() < 0.7 ? 1 : 2;

            for (let j = 1; j <= spikeLength; j++) {
                let spikeX = Math.floor(selectedDirection.startX + Math.cos(angle) * j);
                let spikeZ = Math.floor(selectedDirection.startZ + Math.sin(angle) * j);

                spike.blocks.push({ x: spikeX, z: spikeZ, height: 0 });

                if (j === 1 && Math.random() < 0.35) {
                    let perpAngle = angle + 1.5708;
                    let thickX = Math.floor(spikeX + Math.cos(perpAngle) * 1);
                    let thickZ = Math.floor(spikeZ + Math.sin(perpAngle) * 1);
                    spike.blocks.push({ x: thickX, z: thickZ, height: 0 });

                    if (Math.random() < 0.25) {
                        let thickX2 = Math.floor(spikeX - Math.cos(perpAngle) * 1);
                        let thickZ2 = Math.floor(spikeZ - Math.sin(perpAngle) * 1);
                        spike.blocks.push({ x: thickX2, z: thickZ2, height: 0 });
                    }
                }

                let verticalChance = Math.random();
                if (verticalChance < 0.12) {
                    spike.blocks.push({ x: spikeX, z: spikeZ, height: 1 });
                } else if (verticalChance < 0.24) {
                    spike.blocks.push({ x: spikeX, z: spikeZ, height: -1 });
                }

                if (j === spikeLength && spikeLength >= 2 && Math.random() < 0.3) {
                    let endOffsets = [
                        { x: 1, z: 0 }, { x: -1, z: 0 }, { x: 0, z: 1 }, { x: 0, z: -1 }
                    ];
                    let randomEndOffset = endOffsets[Math.floor(Math.random() * endOffsets.length)];
                    spike.blocks.push({
                        x: spikeX + randomEndOffset.x,
                        z: spikeZ + randomEndOffset.z,
                        height: 0
                    });
                }
            }

            spikeBlocks.push(spike);
        }

        return {
            platformBlocks: platformBlocks,
            spikeBlocks: spikeBlocks
        };
    }

    function placeNextLevel(entity, startX, startY, startZ, currentHeight, maxHeight, blockType, nbtData) {
        if (currentHeight >= maxHeight) {
            entity.level.playSound(null, entity.x, entity.y, entity.z, 'minecraft:block.amethyst_block.chime', entity.getSoundSource(), 0.8, 1.0);
            return;
        }

        let targetY = startY + currentHeight;
        let platformSize = getPlatformSize(currentHeight, maxHeight);

        let playerBlockX = Math.floor(entity.x);
        let playerBlockZ = Math.floor(entity.z);

        let posVariance = Math.random() < 0.2 ? (Math.floor(Math.random() * 3) - 1) : 0;
        playerBlockX += posVariance;
        playerBlockZ += posVariance;

        let platformData = generateCrystalPlatform(playerBlockX, playerBlockZ, platformSize, currentHeight, maxHeight, entity);

        let blocksPlaced = 0;
        let totalBlocks = platformData.platformBlocks.length;

        platformData.spikeBlocks.forEach(spike => {
            totalBlocks += spike.blocks.length;
        });

        platformData.platformBlocks.forEach((pos, index) => {
            let blockPlaced = placeColoredBlock(entity, pos.x, targetY, pos.z, blockType, nbtData);
            if (blockPlaced) {
                blocksPlaced++;
            }
        });

        platformData.spikeBlocks.forEach((spike, spikeIndex) => {
            spike.blocks.forEach((pos, blockIndex) => {
                let spikeY = targetY + pos.height;
                let blockPlaced = placeColoredBlock(entity, pos.x, spikeY, pos.z, blockType, nbtData);
                if (blockPlaced) {
                    blocksPlaced++;
                }
            });
        });

        if (blocksPlaced > 0) {
            let teleportY = targetY + 1 + Math.floor(Math.random() * 2);

            entity.teleportTo(entity.x, teleportY, entity.z);

            let soundVariant = Math.random();
            if (soundVariant < 0.3) {
            } else if (soundVariant < 0.6) {
                entity.level.playSound(null, entity.x, teleportY, entity.z, 'minecraft:block.amethyst_block.chime', entity.getSoundSource(), 0.7, 1.0);
            } else { }

            let baseDelay = 20;
            let complexityBonus = Math.floor(blocksPlaced / 2) * 3;
            let heightBonus = Math.floor(currentHeight / 3) * 5;
            let randomVariance = Math.floor(Math.random() * 10) - 5;

            let totalDelay = baseDelay + complexityBonus + heightBonus + randomVariance;
            totalDelay = Math.max(15, Math.min(totalDelay, 50));

            entity.server.schedule(totalDelay, () => {
                placeNextLevel(entity, startX, startY, startZ, currentHeight + 1, maxHeight, blockType, nbtData);
            });
        } else {
            entity.level.playSound(null, entity.x, entity.y, entity.z, 'minecraft:entity.villager.no', entity.getSoundSource(), 1.0, 1.0);
        }
    }

    event.create('alienevo:crystal_pillar')
        .icon(palladium.createItemIcon('minecraft:amethyst_cluster'))
        .addProperty("height", "float", 12.0, "Height of the crystalline pillar")
        .addProperty("blockType", "string", "alienevo:crystal_block", "Block type to place")
        .tick((entity, entry, holder, enabled) => {
            if (enabled && entity.isPlayer()) {
                let height = Math.floor(entry.getPropertyByName("height"));
                let blockType = entry.getPropertyByName("blockType");

                let heightVariance = Math.floor(Math.random() * 3) - 1;
                height = Math.max(3, height + heightVariance);

                let uniform = palladium.getProperty(entity, 'uniform') || 'prototype';

                // Get color properties using the uniform
                let color0 = hexToDecimal(palladium.getProperty(entity, `petrosapien_${uniform}_skincolor_palette_1_color_1`) || "EF0909");
                let color1 = hexToDecimal(palladium.getProperty(entity, `petrosapien_${uniform}_skincolor_palette_1_color_2`) || "CE4E4A");
                let color2 = hexToDecimal(palladium.getProperty(entity, `petrosapien_${uniform}_skincolor_palette_1_color_3`) || "A99C86");
                let color3 = hexToDecimal(palladium.getProperty(entity, `petrosapien_${uniform}_skincolor_palette_1_color_4`) || "870B18");
                let color4 = hexToDecimal(palladium.getProperty(entity, `petrosapien_${uniform}_skincolor_palette_1_color_5`) || "6DE1F8");
                let color5 = hexToDecimal(palladium.getProperty(entity, `petrosapien_${uniform}_skincolor_palette_1_color_6`) || "58B764");

                let nbtData = `{data:{Color0:${color0},Color1:${color1},Color2:${color2},Color3:${color3},Color4:${color4},Color5:${color5}}}`;

                let playerX = Math.floor(entity.x);
                let playerY = Math.floor(entity.y);
                let playerZ = Math.floor(entity.z);

                placeNextLevel(entity, playerX, playerY, playerZ, 0, height, blockType, nbtData);
            }
        });
});