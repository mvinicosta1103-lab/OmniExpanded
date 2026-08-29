StartupEvents.registry('palladium:abilities', (event) => {
    event.create('alienevo:simple_grapple')
        .icon(palladium.createItemIcon('minecraft:fishing_rod'))
        .addProperty("max_distance", "float", 4.0, "Maximum distance for ray trace")
        .addProperty("particle_type", "string", "end_rod", "Particle type to spawn")
        .addProperty("particle_count", "integer", 30, "Number of particles in the line")
        .addProperty("debug_mode", "boolean", true, "Enable debug messages")
        .tick((entity, entry, holder, enabled) => {
            if (enabled && entity.isPlayer()) {
                try {
                    let maxDistance = entry.getPropertyByName("max_distance");
                    let particleType = entry.getPropertyByName("particle_type");
                    let particleCount = entry.getPropertyByName("particle_count");
                    let debugMode = entry.getPropertyByName("debug_mode");

                    let shouldDebug = debugMode && (entity.level.time % 20 === 0);
                    
                    if (shouldDebug) {
                        entity.tell("Debug: Looking for block within " + maxDistance + " blocks");
                    }

                    let rayTraceResult = entity.rayTrace(maxDistance);
                    
                    if (!rayTraceResult) {
                        if (shouldDebug) {
                            entity.tell("Debug: Ray trace returned null");
                        }
                        return;
                    }
                    
                    if (!rayTraceResult.block) {
                        if (shouldDebug) {
                            entity.tell("Debug: No block found in ray trace");
                        }
                        return;
                    }
                    
                    let block = rayTraceResult.block;
                    
                    if (shouldDebug) {
                        entity.tell("Debug: Found block: " + block.id + " at " + block.x + ", " + block.y + ", " + block.z);
                    }

                    let startX = entity.x;
                    let startY = entity.eyeY;
                    let startZ = entity.z;

                    let endX = block.x + 0.5;
                    let endY = block.y + 0.5;
                    let endZ = block.z + 0.5;

                    let dx = endX - startX;
                    let dy = endY - startY;
                    let dz = endZ - startZ;
                    let distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
                    
                    if (shouldDebug) {
                        entity.tell("Debug: Distance to block: " + distance.toFixed(2) + " blocks");
                    }

                    if (!entity.lookAngle) {
                        if (shouldDebug) {
                            entity.tell("Debug: lookAngle is null");
                        }
                    } else {
                        let lookX = entity.lookAngle.x || 0;
                        let lookY = entity.lookAngle.y || 0;
                        let lookZ = entity.lookAngle.z || 0;
                        
                        if (shouldDebug) {
                            entity.tell("Debug: Look angle: " + lookX.toFixed(2) + ", " + lookY.toFixed(2) + ", " + lookZ.toFixed(2));
                        }
                        
                        try {
                            let direction = entity.lookAngle.scale(distance * 0.25);
                            
                            if (shouldDebug) {
                                entity.tell("Debug: Scaled direction: " + direction.x.toFixed(2) + ", " + 
                                           direction.y.toFixed(2) + ", " + direction.z.toFixed(2));
                            }

                            entity.deltaMovement = direction;
                            entity.hurtMarked = true;
                            
                            if (shouldDebug) {
                                entity.tell("Debug: Applied movement");
                            }
                        } catch (e) {

                            if (shouldDebug) {
                                entity.tell("Debug: Error scaling vector: " + e + ". Using manual calculation.");
                            }
                            
                            let scaleFactor = distance * 0.25;
                            let dirX = lookX * scaleFactor;
                            let dirY = lookY * scaleFactor;
                            let dirZ = lookZ * scaleFactor;
                            
                            if (shouldDebug) {
                                entity.tell("Debug: Manual direction: " + dirX.toFixed(2) + ", " + 
                                           dirY.toFixed(2) + ", " + dirZ.toFixed(2));
                            }

                            entity.deltaMovement = { x: dirX, y: dirY, z: dirZ };
                            entity.hurtMarked = true;
                            
                            if (shouldDebug) {
                                entity.tell("Debug: Applied manual movement");
                            }
                        }
                    }
                    
                    if (shouldDebug) {
                        entity.tell("Debug: Creating particle line with " + particleCount + " particles");
                    }

                    try {
                        for (let i = 0; i < particleCount; i++) {
                            let t = i / particleCount;
                            let x = startX + (endX - startX) * t;
                            let y = startY + (endY - startY) * t;
                            let z = startZ + (endZ - startZ) * t;
                            
                            entity.level.spawnParticles(
                                particleType,
                                true,
                                x, y, z,
                                0, 0, 0,
                                1, 0
                            );
                        }
                        
                        if (shouldDebug) {
                            entity.tell("Debug: Particles spawned successfully");
                        }
                    } catch (e) {
                        if (shouldDebug) {
                            entity.tell("Debug: Error spawning particles: " + e);
                        }
                    }
                } catch (e) {
                    let debugMode = entry.getPropertyByName("debug_mode");
                    if (debugMode) {
                        entity.tell("Debug: Fatal error in ability: " + e);
                    }
                }
            }
        });
});