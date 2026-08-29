StartupEvents.registry('palladium:abilities', (event) => {
    const LivingEntity = Java.loadClass('net.minecraft.world.entity.LivingEntity');
    
    event.create('alienevo:fire_particle_bridge')
        .icon(palladium.createItemIcon('minecraft:fire_charge'))
        .addProperty("particle_id", "string", "flame", "Particle type to spawn for the bridge")
        .addProperty("search_radius", "float", 8.0, "Horizontal radius to search for fire blocks")
        .addProperty("vertical_search_radius", "float", 4.0, "Vertical radius to search for fire blocks (Y-axis)")
        .addProperty("use_spherical_search", "boolean", true, "Use spherical search instead of cubic (more efficient)")
        .addProperty("max_targets", "integer", 1, "Maximum number of entities to connect to per fire block")
        .addProperty("max_fire_blocks", "integer", 5, "Maximum number of fire blocks to use as sources")
        .addProperty("density", "float", 0.5, "Density of particles (higher = more particles, lower recommended with motion)")
        .addProperty("particle_speed", "float", 0.4, "Speed multiplier for particle motion")
        .addProperty("use_motion", "boolean", true, "Give particles velocity toward the player")
        .addProperty("particle_lifetime_ticks", "float", 10, "Expected particle lifetime in ticks (lower = faster particles)")
        .addProperty("speed_multiplier", "float", 1.0, "Additional speed multiplier (higher = faster)")
        .addProperty("dynamic_speed", "boolean", true, "Calculate motion speed based on distance and lifetime")
        .addProperty("manual_motion_magnitude", "float", 1.0, "Manual motion magnitude (used when dynamic_speed is false)")
        .addProperty("motion_spread", "float", 0, "Random spread applied to motion direction (0 = no spread)")
        .addProperty("spawn_spread", "float", 0.2, "Random spread applied to particle spawn positions")
        .addProperty("y_offset", "float", 0.5, "Y-offset from fire block position")
        .addProperty("debug_mode", "boolean", true, "Enable debug messages")
        .addProperty("target_player", "boolean", true, "If true, fire blocks target the player instead of other entities")
        .addProperty("search_interval", "integer", 20, "Ticks between fire block searches (20 = 1 second)")
        // NEW PROPERTIES FOR FIRE EXTINGUISHING
        .addProperty("extinguish_fire", "boolean", true, "Automatically extinguish fire blocks after delay")
        .addProperty("extinguish_delay_ticks", "integer", 40, "Ticks before extinguishing fire (40 = 2 seconds)")
        .addProperty("extinguish_with_water", "boolean", false, "Replace fire with water instead of air")
        .addProperty("extinguish_sound", "string", "minecraft:block.fire.extinguish", "Sound to play when extinguishing fire")
        .addProperty("extinguish_sound_volume", "float", 1.0, "Volume of extinguish sound (0.0 to 1.0)")
        .addProperty("extinguish_sound_pitch", "float", 1.0, "Pitch of extinguish sound (0.5 to 2.0)")
        .addProperty("extinguish_particles", "string", "minecraft:large_smoke", "Particle effect when extinguishing")
        .addProperty("extinguish_particle_count", "integer", 15, "Number of particles to spawn when extinguishing")
        .addProperty("extinguish_effects_enabled", "boolean", true, "Enable sound and particle effects on extinguish")
        .addProperty("scoreboard_objective", "string", "Pyronite.Release", "Scoreboard objective to add score when absorbing fire")
        .addProperty("scoreboard_enabled", "boolean", true, "Enable scoreboard integration for absorbed fire")
        .tick((entity, entry, holder, enabled) => {
            if (enabled && entity.isPlayer()) {
                let particleId = entry.getPropertyByName("particle_id");
                let searchRadius = entry.getPropertyByName("search_radius");
                let verticalSearchRadius = entry.getPropertyByName("vertical_search_radius");
                let useSphericalSearch = entry.getPropertyByName("use_spherical_search");
                let maxTargets = entry.getPropertyByName("max_targets");
                let maxFireBlocks = entry.getPropertyByName("max_fire_blocks");
                let density = entry.getPropertyByName("density");
                let particleSpeed = entry.getPropertyByName("particle_speed");
                let useMotion = entry.getPropertyByName("use_motion");
                let particleLifetimeTicks = entry.getPropertyByName("particle_lifetime_ticks");
                let speedMultiplier = entry.getPropertyByName("speed_multiplier");
                let dynamicSpeed = entry.getPropertyByName("dynamic_speed");
                let manualMotionMagnitude = entry.getPropertyByName("manual_motion_magnitude");
                let motionSpread = entry.getPropertyByName("motion_spread");
                let spawnSpread = entry.getPropertyByName("spawn_spread");
                let yOffset = entry.getPropertyByName("y_offset");
                let debugMode = entry.getPropertyByName("debug_mode");
                let targetPlayer = entry.getPropertyByName("target_player");
                let searchInterval = entry.getPropertyByName("search_interval");
                // NEW PROPERTIES
                let extinguishFire = entry.getPropertyByName("extinguish_fire");
                let extinguishDelayTicks = entry.getPropertyByName("extinguish_delay_ticks");
                let extinguishWithWater = entry.getPropertyByName("extinguish_with_water");
                let extinguishSound = entry.getPropertyByName("extinguish_sound");
                let extinguishSoundVolume = entry.getPropertyByName("extinguish_sound_volume");
                let extinguishSoundPitch = entry.getPropertyByName("extinguish_sound_pitch");
                let extinguishParticles = entry.getPropertyByName("extinguish_particles");
                let extinguishParticleCount = entry.getPropertyByName("extinguish_particle_count");
                let extinguishEffectsEnabled = entry.getPropertyByName("extinguish_effects_enabled");
                let scoreboardObjective = entry.getPropertyByName("scoreboard_objective");
                let scoreboardEnabled = entry.getPropertyByName("scoreboard_enabled");
                
                if (!entity.persistentData.fireBlocks) {
                    entity.persistentData.fireBlocks = [];
                    entity.persistentData.lastFireSearch = 0;
                }
                if (!entity.persistentData.trackedFireBlocks) {
                    entity.persistentData.trackedFireBlocks = {};
                }
                
                let currentTime = entity.level.time;

                if (extinguishFire && entity.persistentData.trackedFireBlocks) {
                    let blocksToRemove = [];
                    let extinguishedCount = 0;
                    
                    for (let blockKey in entity.persistentData.trackedFireBlocks) {
                        let blockData = entity.persistentData.trackedFireBlocks[blockKey];
                        if (!blockData || typeof blockData.discoveredTime === 'undefined') {

                            blocksToRemove.push(blockKey);
                            continue;
                        }
                        
                        let timeElapsed = currentTime - blockData.discoveredTime;
                        
                        if (timeElapsed >= extinguishDelayTicks) {

                            let coords = blockKey.split(",");
                            if (coords.length !== 3) {

                                blocksToRemove.push(blockKey);
                                continue;
                            }
                            
                            let x = parseInt(coords[0]);
                            let y = parseInt(coords[1]);
                            let z = parseInt(coords[2]);
                            
                            if (isNaN(x) || isNaN(y) || isNaN(z)) {

                                blocksToRemove.push(blockKey);
                                continue;
                            }
                            
                            let blockPos = [x, y, z];

                            let currentBlock = entity.level.getBlock(blockPos);
                            if (currentBlock.id === 'minecraft:fire') {
                                if (extinguishWithWater) {
                                    currentBlock.set('minecraft:water');
                                } else {
                                    currentBlock.set('minecraft:air');
                                }
                                extinguishedCount++;
                                
                                if (scoreboardEnabled) {
                                    try {
                                        palladium.scoreboard.addScore(entity, scoreboardObjective, 1);
                                        if (debugMode) {
                                            entity.tell("Added 1 score to " + scoreboardObjective + " (fire absorbed)");
                                        }
                                    } catch (scoreboardError) {
                                        if (debugMode) {
                                            entity.tell("Scoreboard error: " + scoreboardError.message);
                                        }
                                    }
                                }
                                
                                if (extinguishEffectsEnabled) {
                                    try {
                                        entity.level.playSound(null, x + 0.5, y + 0.5, z + 0.5, extinguishSound, 
                                                             'blocks', extinguishSoundVolume, extinguishSoundPitch);
                                    } catch (soundError) {
                                        if (debugMode) {
                                            entity.tell("Sound error: " + soundError.message);
                                        }
                                    }

                                    try {
                                        for (let p = 0; p < extinguishParticleCount; p++) {
                                            let offsetX = (Math.random() - 0.5) * 0.8;
                                            let offsetY = Math.random() * 0.5;
                                            let offsetZ = (Math.random() - 0.5) * 0.8;
                                            
                                            let particleX = x + 0.5 + offsetX;
                                            let particleY = y + 0.2 + offsetY;
                                            let particleZ = z + 0.5 + offsetZ;

                                            let motionX = (Math.random() - 0.5) * 0.02;
                                            let motionY = Math.random() * 0.05 + 0.01;
                                            let motionZ = (Math.random() - 0.5) * 0.02;
                                            
                                            entity.level.spawnParticles(extinguishParticles, true, 
                                                                      particleX, particleY, particleZ, 
                                                                      motionX, motionY, motionZ, 1, 0);
                                        }
                                    } catch (particleError) {
                                        if (debugMode) {
                                            entity.tell("Particle error: " + particleError.message);
                                        }
                                    }
                                }
                                
                                if (debugMode) {
                                    entity.tell("Extinguished fire at " + x + ", " + y + ", " + z + 
                                              " after " + (timeElapsed / 20.0).toFixed(1) + " seconds" +
                                              (extinguishEffectsEnabled ? " (with effects)" : "") +
                                              (scoreboardEnabled ? " (+1 " + scoreboardObjective + ")" : ""));
                                }
                            }
                            
                            blocksToRemove.push(blockKey);
                        }
                    }
                    
                    for (let blockKey of blocksToRemove) {
                        delete entity.persistentData.trackedFireBlocks[blockKey];
                    }
                    
                    if (debugMode && extinguishedCount > 0) {
                        entity.tell("Extinguished " + extinguishedCount + " fire blocks" + 
                                  (extinguishEffectsEnabled ? " with sound & particle effects" : "") +
                                  (scoreboardEnabled ? " (+" + extinguishedCount + " " + scoreboardObjective + ")" : ""));
                    }
                }
                
                if (currentTime - entity.persistentData.lastFireSearch >= searchInterval) {
                    if (debugMode) {
                        entity.tell("Searching for fire blocks (H:" + searchRadius + " V:" + verticalSearchRadius + 
                                  ", spherical:" + useSphericalSearch + ")...");
                    }
                    
                    let fireBlocks = [];
                    let playerX = Math.floor(entity.x);
                    let playerY = Math.floor(entity.y);
                    let playerZ = Math.floor(entity.z);
                    
                    let blocksChecked = 0;
                    let blocksSkipped = 0;
                    let newFireBlocks = 0;
                    
                    for (let x = playerX - searchRadius; x <= playerX + searchRadius; x++) {
                        for (let y = playerY - verticalSearchRadius; y <= playerY + verticalSearchRadius; y++) {
                            for (let z = playerZ - searchRadius; z <= playerZ + searchRadius; z++) {
                                if (useSphericalSearch) {
                                    let dx = (entity.x) - (x + 0.5);
                                    let dy = (entity.y) - (y + 0.5);
                                    let dz = (entity.z) - (z + 0.5);
                                    let distanceSquared = dx*dx + dy*dy + dz*dz;
                                    let maxDistanceSquared = Math.max(searchRadius*searchRadius, verticalSearchRadius*verticalSearchRadius);
                                    
                                    if (distanceSquared > maxDistanceSquared) {
                                        blocksSkipped++;
                                        continue;
                                    }
                                }
                                
                                blocksChecked++;
                                let blockPos = [x, y, z];
                                let block = entity.level.getBlock(blockPos);
                                
                                if (block.id === 'minecraft:fire') {
                                    let dx = entity.x - (x + 0.5);
                                    let dy = entity.y - (y + 0.5);
                                    let dz = entity.z - (z + 0.5);
                                    let distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
                                    let horizontalDist = Math.sqrt(dx*dx + dz*dz);
                                    let verticalDist = Math.abs(dy);
                                    
                                    if (horizontalDist <= searchRadius && verticalDist <= verticalSearchRadius) {
                                        fireBlocks.push({
                                            x: x + 0.5,
                                            y: y + 0.5,
                                            z: z + 0.5,
                                            distance: distance,
                                            blockX: x,
                                            blockY: y,
                                            blockZ: z
                                        });

                                        if (extinguishFire && entity.persistentData.trackedFireBlocks) {
                                            let blockKey = x + "," + y + "," + z;
                                            if (!entity.persistentData.trackedFireBlocks[blockKey]) {
                                                entity.persistentData.trackedFireBlocks[blockKey] = {
                                                    discoveredTime: currentTime,
                                                    x: x,
                                                    y: y,
                                                    z: z
                                                };
                                                newFireBlocks++;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    fireBlocks.sort((a, b) => a.distance - b.distance);
                    fireBlocks = fireBlocks.slice(0, maxFireBlocks);

                    entity.persistentData.fireBlocks = fireBlocks;
                    entity.persistentData.lastFireSearch = currentTime;
                    
                    if (debugMode) {
                        let totalPossibleBlocks = (searchRadius * 2 + 1) * (verticalSearchRadius * 2 + 1) * (searchRadius * 2 + 1);
                        let trackedCount = entity.persistentData.trackedFireBlocks ? Object.keys(entity.persistentData.trackedFireBlocks).length : 0;
                        entity.tell("Found " + fireBlocks.length + " fire blocks. Checked " + blocksChecked + "/" + totalPossibleBlocks + 
                                  " blocks" + (useSphericalSearch ? " (skipped " + blocksSkipped + " with spherical search)" : "") + 
                                  " - cached for " + searchInterval + " ticks" +
                                  (extinguishFire ? " | Tracking " + trackedCount + " blocks (" + newFireBlocks + " new)" : ""));
                    }
                }

                let fireBlocks = entity.persistentData.fireBlocks;
                
                if (fireBlocks.length === 0) return;

                let targetEntities = [];
                
                if (targetPlayer) {
                    targetEntities = [entity];
                } else {
                    try {
                        let entityAABB = entity.boundingBox.inflate(searchRadius);
                        let nearbyEntities = entity.level.getEntitiesWithin(entityAABB);
                        
                        let entityDistances = [];
                        
                        if (nearbyEntities) {
                            nearbyEntities.forEach(nearby => {
                                if (nearby == null || nearby.id === entity.id || !(nearby instanceof LivingEntity)) return;
                                
                                let dx = entity.x - nearby.x;
                                let dy = entity.y - nearby.y;
                                let dz = entity.z - nearby.z;
                                let distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
                                
                                entityDistances.push({
                                    entity: nearby,
                                    distance: distance
                                });
                            });
                        }
                        
                        entityDistances.sort((a, b) => a.distance - b.distance);
                        let targetCount = maxTargets === 0 ? entityDistances.length : Math.min(maxTargets, entityDistances.length);
                        
                        for (let i = 0; i < targetCount; i++) {
                            targetEntities.push(entityDistances[i].entity);
                        }
                    } catch (e) {
                        if (debugMode) {
                            entity.tell("Error finding entities: " + e.message);
                        }
                        return;
                    }
                }
                
                if (targetEntities.length === 0) return;

                for (let fireBlock of fireBlocks) {
                    for (let targetEntity of targetEntities) {
                        let startX = fireBlock.x;
                        let startY = fireBlock.y + yOffset;
                        let startZ = fireBlock.z;
                        
                        let endX = targetEntity.x;
                        let endY = targetPlayer ? targetEntity.eyeY : targetEntity.eyeY;
                        let endZ = targetEntity.z;

                        let dx = endX - startX;
                        let dy = endY - startY;
                        let dz = endZ - startZ;
                        let dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                        
                        if (dist === 0) continue;

                        let dirX = dx / dist;
                        let dirY = dy / dist;
                        let dirZ = dz / dist;
                        
                        let particleCount = Math.ceil(dist * density);
                        
                        if (useMotion) {
                            let motionParticleCount = Math.max(2, Math.ceil(particleCount * 0.4));
                            
                            for (let j = 0; j < motionParticleCount; j++) {
                                let t = (j / motionParticleCount) * 0.1;
                                let x = startX + dx * t;
                                let y = startY + dy * t;
                                let z = startZ + dz * t;

                                x += (Math.random() - 0.5) * spawnSpread;
                                y += (Math.random() - 0.5) * spawnSpread;
                                z += (Math.random() - 0.5) * spawnSpread;

                                let currentMotionMagnitude;
                                if (dynamicSpeed) {
                                    currentMotionMagnitude = (dist / particleLifetimeTicks) * speedMultiplier;
                                } else {
                                    currentMotionMagnitude = manualMotionMagnitude;
                                }
                                
                                let motionX = dirX * currentMotionMagnitude;
                                let motionY = dirY * currentMotionMagnitude; 
                                let motionZ = dirZ * currentMotionMagnitude;

                                if (motionSpread > 0) {
                                    motionX += (Math.random() - 0.5) * motionSpread;
                                    motionY += (Math.random() - 0.5) * motionSpread;
                                    motionZ += (Math.random() - 0.5) * motionSpread;
                                }

                                if (debugMode && entity.level.time % 100 === 0 && j === 0) {
                                    let baseSpeed = dist / particleLifetimeTicks;
                                    let actualETA = dist / currentMotionMagnitude;
                                    entity.tell("Distance: " + dist.toFixed(1) + " blocks, " + 
                                              (dynamicSpeed ? "Dynamic×" + speedMultiplier : "Manual") + 
                                              " magnitude: " + currentMotionMagnitude.toFixed(3) + 
                                              " (ETA: " + actualETA.toFixed(1) + " ticks)");
                                }

                                entity.level.spawnParticles(particleId, true, x, y, z, motionX, motionY, motionZ, 0, particleSpeed);
                            }
                        } else {
                            for (let j = 0; j < particleCount; j++) {
                                let t = j / particleCount;
                                let x = startX + dx * t;
                                let y = startY + dy * t;
                                let z = startZ + dz * t;
                                
                                entity.level.spawnParticles(particleId, true, x, y, z, 0, 0, 0, 1, 0);
                            }
                        }
                    }
                }
                
                if (debugMode && entity.level.time % 40 === 0 && fireBlocks.length > 0) {
                    let extinguishStatus = extinguishFire ? " (auto-extinguish in " + (extinguishDelayTicks/20) + "s)" : "";
                    entity.tell("Using " + fireBlocks.length + " cached fire blocks for " + 
                              (useMotion ? "motion-based" : "static") + " particle bridges" + extinguishStatus);
                }
            }
        })
        .lastTick((entity, entry, holder, enabled) => {
            if (entity.isPlayer() && entity.persistentData.trackedFireBlocks) {
                let trackedCount = Object.keys(entity.persistentData.trackedFireBlocks).length;
                if (trackedCount > 0) {
                    let debugMode = entry.getPropertyByName("debug_mode");
                    if (debugMode) {
                        entity.tell("Ability disabled - resetting " + trackedCount + " fire block timers");
                    }
                    entity.persistentData.trackedFireBlocks = {};
                }
            }
        });
});