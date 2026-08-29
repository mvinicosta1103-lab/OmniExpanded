StartupEvents.registry('palladium:abilities', (event) => {
    event.create('alienevo:ore_detector')
        .icon(palladium.createItemIcon('minecraft:diamond_ore'))
        .addProperty("search_radius", "integer", 9, "Radius to search for ores")
        .addProperty("display_visibility_range", "float", 24.0, "Range within which ore highlights remain visible")
        .addProperty("proximity_removal", "float", 3.0, "Distance at which ore highlights disappear when approached")
        .addProperty("detect_coal", "boolean", true, "Detect coal ores")
        .addProperty("detect_iron", "boolean", true, "Detect iron ores")
        .addProperty("detect_copper", "boolean", true, "Detect copper ores")
        .addProperty("detect_gold", "boolean", true, "Detect gold ores")
        .addProperty("detect_redstone", "boolean", true, "Detect redstone ores")
        .addProperty("detect_lapis", "boolean", true, "Detect lapis ores")
        .addProperty("detect_diamond", "boolean", true, "Detect diamond ores")
        .addProperty("detect_emerald", "boolean", true, "Detect emerald ores")
        .addProperty("detect_quartz", "boolean", true, "Detect nether quartz ores")
        .addProperty("detect_ancient_debris", "boolean", true, "Detect ancient debris")
        .addProperty("cooldown", "integer", 200, "Cooldown between scans in ticks")
        .addProperty("display_distance", "boolean", true, "Show distance to found ores")
        .addProperty("debug_mode", "boolean", false, "Enable debug messages")
        .tick((entity, entry, holder, enabled) => {
            if (enabled && entity.isPlayer()) {
                let visibilityRange = entry.getPropertyByName("display_visibility_range");
                let proximityRemoval = entry.getPropertyByName("proximity_removal");

                if (entity.level.time % 10 === 0) {
                    try {
                        let outOfRangeCommand = `/execute as @e[type=block_display,tag=ore_detector_highlight] at @s unless entity @p[distance=..${visibilityRange}] run kill @s`;
                        entity.server.runCommandSilent(outOfRangeCommand);

                        let tooCloseCommand = `/execute as @e[type=block_display,tag=ore_detector_highlight] at @s if entity @p[distance=..${proximityRemoval}] run kill @s`;
                        entity.server.runCommandSilent(tooCloseCommand);
                    } catch (e) {
                        if (debugMode) {
                            entity.tell("§cError in display visibility check: " + e.message);
                        }
                    }
                }

                let cooldownKey = 'alienevo:ore_detector_cooldown';
                let currentTick = entity.level.time;
                let lastUseTick = entity.getPersistentData().getLong(cooldownKey);
                let cooldown = entry.getPropertyByName("cooldown");

                if (currentTick - lastUseTick >= cooldown) {
                    entity.getPersistentData().putLong(cooldownKey, currentTick);

                    let searchRadius = entry.getPropertyByName("search_radius");
                    let detectCoal = entry.getPropertyByName("detect_coal");
                    let detectIron = entry.getPropertyByName("detect_iron");
                    let detectCopper = entry.getPropertyByName("detect_copper");
                    let detectGold = entry.getPropertyByName("detect_gold");
                    let detectRedstone = entry.getPropertyByName("detect_redstone");
                    let detectLapis = entry.getPropertyByName("detect_lapis");
                    let detectDiamond = entry.getPropertyByName("detect_diamond");
                    let detectEmerald = entry.getPropertyByName("detect_emerald");
                    let detectQuartz = entry.getPropertyByName("detect_quartz");
                    let detectAncientDebris = entry.getPropertyByName("detect_ancient_debris");
                    let displayDistance = entry.getPropertyByName("display_distance");
                    let debugMode = entry.getPropertyByName("debug_mode");

                    let oreTypes = [];
                    if (detectCoal) {
                        oreTypes.push("minecraft:coal_ore", "minecraft:deepslate_coal_ore");
                    }
                    if (detectIron) {
                        oreTypes.push("minecraft:iron_ore", "minecraft:deepslate_iron_ore");
                    }
                    if (detectCopper) {
                        oreTypes.push("minecraft:copper_ore", "minecraft:deepslate_copper_ore");
                    }
                    if (detectGold) {
                        oreTypes.push("minecraft:gold_ore", "minecraft:deepslate_gold_ore", "minecraft:nether_gold_ore");
                    }
                    if (detectRedstone) {
                        oreTypes.push("minecraft:redstone_ore", "minecraft:deepslate_redstone_ore");
                    }
                    if (detectLapis) {
                        oreTypes.push("minecraft:lapis_ore", "minecraft:deepslate_lapis_ore");
                    }
                    if (detectDiamond) {
                        oreTypes.push("minecraft:diamond_ore", "minecraft:deepslate_diamond_ore");
                    }
                    if (detectEmerald) {
                        oreTypes.push("minecraft:emerald_ore", "minecraft:deepslate_emerald_ore");
                    }
                    if (detectQuartz) {
                        oreTypes.push("minecraft:nether_quartz_ore");
                    }
                    if (detectAncientDebris) {
                        oreTypes.push("minecraft:ancient_debris");
                    }

                    if (debugMode) {
                        entity.tell("§6Ore Detector §rscanning for ores within " + searchRadius + " blocks...");
                    }

                    let foundOres = [];
                    let playerX = Math.floor(entity.x);
                    let playerY = Math.floor(entity.y);
                    let playerZ = Math.floor(entity.z);

                    for (let x = -searchRadius; x <= searchRadius; x++) {
                        for (let y = -searchRadius; y <= searchRadius; y++) {
                            for (let z = -searchRadius; z <= searchRadius; z++) {
                                try {
                                    let blockX = playerX + x;
                                    let blockY = playerY + y;
                                    let blockZ = playerZ + z;

                                    let checkingBlock = entity.level.getBlock(blockX, blockY, blockZ);
                                    let blockId = checkingBlock.id.toString();

                                    if (oreTypes.includes(blockId)) {
                                        let distance = Math.sqrt(x * x + y * y + z * z);

                                        foundOres.push({
                                            block: checkingBlock,
                                            blockId: blockId,
                                            x: blockX,
                                            y: blockY,
                                            z: blockZ,
                                            distance: distance
                                        });
                                    }
                                } catch (e) {
                                    if (debugMode) {
                                        entity.tell("§cError checking block: " + e.message);
                                    }
                                }
                            }
                        }
                    }
                    foundOres.sort((a, b) => a.distance - b.distance);

                    if (foundOres.length > 0) {
                        entity.tell("§6Sniffing Ore §rfound §e" + foundOres.length + " §rores nearby!");

                        for (let i = 0; i < foundOres.length; i++) {
                            let ore = foundOres[i];
                            let oreName = ore.blockId.split(':')[1].replace(/_/g, ' ');

                            if (displayDistance) {
                                entity.tell("§6Sniffing out §e" + oreName + " §r(" + ore.distance.toFixed(1) + " blocks away)");
                            }

                            let command = `/summon block_display ${ore.x} ${ore.y} ${ore.z} {Tags:["ore_detector_highlight"],block_state:{Name:"${ore.blockId}"},transformation:[1.0000f,0.0000f,0.0000f,0.0000f,0.0000f,1.0000f,0.0000f,0.0000f,0.0000f,0.0000f,1.0000f,0.0000f,0.0000f,0.0000f,0.0000f,1.0000f]}`;
                            entity.server.runCommandSilent(command);
                        }
                    } else {
                        entity.tell("§6Ore Detector: §rNo ores detected within " + searchRadius + " blocks.");
                    }
                }
            }
        });
});