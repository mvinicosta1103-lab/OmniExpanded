StartupEvents.registry('palladium:abilities', (event) => {
    event.create('alienevo:block_particle_feet')
        .icon(palladium.createItemIcon('minecraft:grass_block'))
        .addProperty("particle_count", "integer", 8, "Number of particles to spawn per tick")
        .addProperty("spawn_height", "float", 0.1, "Height above the ground to spawn particles")
        .addProperty("particle_spread", "float", 0.6, "Horizontal spread of particles around feet")
        .addProperty("particle_speed", "float", 0.05, "Speed of particle motion")
        .addProperty("upward_motion", "float", 0.02, "Upward velocity of particles")
        .addProperty("spawn_interval", "integer", 2, "Ticks between particle spawns (1 = every tick)")
        .addProperty("debug_mode", "boolean", false, "Show debug messages")
        .addProperty("only_when_moving", "boolean", false, "Only spawn particles when player is moving")
        .addProperty("check_air_blocks", "boolean", true, "Skip spawning if standing on air")
        .tick((entity, entry, holder, enabled) => {
            if (enabled && entity.isPlayer()) {
                let particleCount = entry.getPropertyByName("particle_count");
                let spawnHeight = entry.getPropertyByName("spawn_height");
                let particleSpread = entry.getPropertyByName("particle_spread");
                let particleSpeed = entry.getPropertyByName("particle_speed");
                let upwardMotion = entry.getPropertyByName("upward_motion");
                let spawnInterval = entry.getPropertyByName("spawn_interval");
                let debugMode = entry.getPropertyByName("debug_mode");
                let onlyWhenMoving = entry.getPropertyByName("only_when_moving");
                let checkAirBlocks = entry.getPropertyByName("check_air_blocks");
                if (entity.level.time % spawnInterval !== 0) {
                    return;
                }

                if (onlyWhenMoving) {
                    if (!entity.persistentData.lastPos) {
                        entity.persistentData.lastPos = {x: entity.x, y: entity.y, z: entity.z};
                        return;
                    }
                    
                    let dx = entity.x - entity.persistentData.lastPos.x;
                    let dy = entity.y - entity.persistentData.lastPos.y;
                    let dz = entity.z - entity.persistentData.lastPos.z;
                    let moved = Math.sqrt(dx*dx + dy*dy + dz*dz) > 0.01;
                    
                    entity.persistentData.lastPos = {x: entity.x, y: entity.y, z: entity.z};
                    
                    if (!moved) {
                        return;
                    }
                }
                let blockX = Math.floor(entity.x);
                let blockY = Math.floor(entity.y - 0.1);
                let blockZ = Math.floor(entity.z);
                
                let blockPos = [blockX, blockY, blockZ];
                let block = entity.level.getBlock(blockPos);
                if (checkAirBlocks && (block.id === 'minecraft:air' || block.id === 'minecraft:void_air')) {
                    if (debugMode) {
                        entity.tell("Standing on air - skipping particles");
                    }
                    return;
                }

                if (debugMode && entity.level.time % 40 === 0) {
                    entity.tell("Standing on: " + block.id + " at " + blockX + ", " + blockY + ", " + blockZ);
                }

                for (let i = 0; i < particleCount; i++) {
                    let offsetX = (Math.random() - 0.5) * particleSpread;
                    let offsetZ = (Math.random() - 0.5) * particleSpread;
                    
                    let particleX = entity.x + offsetX;
                    let particleY = entity.y + spawnHeight;
                    let particleZ = entity.z + offsetZ;

                    let motionX = (Math.random() - 0.5) * particleSpeed;
                    let motionY = upwardMotion + Math.random() * particleSpeed;
                    let motionZ = (Math.random() - 0.5) * particleSpeed;

                    let particleType;
                    let success = false;

                    let formats = [
                        "minecraft:block " + block.id,        // Standard format
                        "block " + block.id,                  // Alternative format
                        "minecraft:falling_dust " + block.id, // Falling dust format
                        block.id + "_break",                  // Break particle format
                        "minecraft:item " + block.id          // Item particle format
                    ];
                    
                    for (let format of formats) {
                        try {
                            entity.level.spawnParticles(format, true, 
                                                      particleX, particleY, particleZ, 
                                                      motionX, motionY, motionZ, 
                                                      1, 0);
                            success = true;
                            if (debugMode && entity.level.time % 60 === 0) {
                                entity.tell("Using particle format: " + format);
                            }
                            break;
                        } catch (error) {
                            continue;
                        }
                    }

                    if (!success) {
                        if (debugMode) {
                            entity.tell("All particle formats failed for " + block.id + ", using fallback");
                        }
                        if (block.id.includes("stone")) {
                            entity.level.spawnParticles("minecraft:smoke", true, particleX, particleY, particleZ, motionX, motionY, motionZ, 1, 0);
                        } else if (block.id.includes("dirt") || block.id.includes("grass")) {
                            entity.level.spawnParticles("minecraft:poof", true, particleX, particleY, particleZ, motionX, motionY, motionZ, 1, 0);
                        } else if (block.id.includes("wood") || block.id.includes("log")) {
                            entity.level.spawnParticles("minecraft:flame", true, particleX, particleY, particleZ, motionX, motionY, motionZ, 1, 0);
                        } else {
                            entity.level.spawnParticles("minecraft:crit", true, particleX, particleY, particleZ, motionX, motionY, motionZ, 1, 0);
                        }
                    }
                }
            }
        });
});