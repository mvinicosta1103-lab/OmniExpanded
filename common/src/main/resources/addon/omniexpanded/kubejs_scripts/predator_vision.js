StartupEvents.registry('palladium:abilities', (event) => {
    const LivingEntity = Java.loadClass('net.minecraft.world.entity.LivingEntity');

    event.create('alienevo:particle_bridge')
        .icon(palladium.createItemIcon('minecraft:end_rod'))
        .addProperty("particle_id", "string", "end_rod", "Particle type to spawn for the bridge")
        .addProperty("search_radius", "float", 20.0, "Radius to search for entities")
        .addProperty("max_targets", "integer", 1, "Maximum number of entities to connect to (use 0 for unlimited)")
        .addProperty("density", "float", 1.0, "Density of particles (higher = more particles)")
        .addProperty("y_offset", "float", -0.5, "Y-offset from eye height")
        .addProperty("debug_mode", "boolean", true, "Enable debug messages")
        .tick((entity, entry, holder, enabled) => {
            if (enabled && entity.isPlayer()) {
                let particleId = entry.getPropertyByName("particle_id");
                let searchRadius = entry.getPropertyByName("search_radius");
                let maxTargets = entry.getPropertyByName("max_targets");
                let density = entry.getPropertyByName("density");
                let yOffset = entry.getPropertyByName("y_offset");
                let debugMode = entry.getPropertyByName("debug_mode");

                if (debugMode && entity.level.time % 20 === 0) {
                    entity.tell("Particle Bridge active. Searching for up to " + 
                        (maxTargets === 0 ? "unlimited" : maxTargets) + 
                        " entities within " + searchRadius + " blocks");
                }

                let targetEntities = [];
                
                try {
                    let entityAABB = entity.boundingBox.inflate(searchRadius);

                    let nearbyEntities = entity.level.getEntitiesWithin(entityAABB);
                    
                    if (debugMode && entity.level.time % 60 === 0) {
                        entity.tell("Found " + (nearbyEntities ? nearbyEntities.length : 0) + " entities nearby");
                    }

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
                    
                    if (debugMode && entity.level.time % 20 === 0) {
                        entity.tell("Found " + targetEntities.length + " target entities to connect to");
                    }
                } catch (e) {
                    if (debugMode) {
                        entity.tell("Error finding entities: " + e.message);
                    }
                    return;
                }

                for (let i = 0; i < targetEntities.length; i++) {
                    let targetEntity = targetEntities[i];
                    
                    let startX = entity.x;
                    let startY = entity.eyeY + yOffset;
                    let startZ = entity.z;
                    
                    let endX = targetEntity.x;
                    let endY = targetEntity.eyeY + yOffset;
                    let endZ = targetEntity.z;

                    let dx = startX - endX;
                    let dy = startY - endY;
                    let dz = startZ - endZ;
                    let dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                    
                    let particleCount = Math.ceil(dist * density);
                    
                    if (debugMode && entity.level.time % 40 === 0 && i === 0) {
                        entity.tell("Creating " + targetEntities.length + " particle bridges");
                    }
                    
                    for (let j = 0; j < particleCount; j++) {
                        let t = j / particleCount;
                        let x = startX + (endX - startX) * t;
                        let y = startY + (endY - startY) * t;
                        let z = startZ + (endZ - startZ) * t;
                        
                        entity.level.spawnParticles(particleId, true, x, y, z, 0, 0, 0, 1, 0);
                    }
                }
            }
        });
});