global.appppppplyknockback = (entity, target, strength) => {
    const dx = target.x - entity.x;
    const dz = target.z - entity.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance > 0) {
        const multiplier = strength / distance;
        target.addMotion(
            dx * multiplier,
            0.4 * strength,
            dz * multiplier
        );
    }
};

StartupEvents.registry('palladium:abilities', (event) => {
    event.create('alienevo:roll_damage')
        .icon(palladium.createItemIcon('palladium:vibranium_circuit'))
        .addProperty("score_value", "string", "AlienEvo.Roll", "Scoreboard name for charge tracking")
        .addProperty("division_amount", "float", 2.0, "Amount to divide charge by for scaling")
        .addProperty("minimum_score", "int", 30, "Minimum charge threshold")
        .addProperty('radius', 'float', 10.0, 'AOE damage radius')
        .addProperty('base_damage', 'float', 2.0, 'Base damage the ability will deal')
        .addProperty('fire_seconds', 'float', 2.0, 'Fire duration in seconds')
        .addProperty('tag_ex', 'string', 'exclusion_tag', 'Tag that excludes entities if desired')
        .addProperty('knockback', 'float', 1.0, 'Knockback strength')
        .addProperty('effect_id', 'string', 'minecraft:slowness', 'Effect to apply to targets')
        .addProperty('effect_duration', 'int', 100, 'Effect duration in ticks (20 ticks = 1 second)')
        .addProperty('effect_amplifier', 'int', 0, 'Effect amplifier (0 = level 1, 1 = level 2, etc.)')
        .addProperty('apply_effect', 'boolean', true, 'Whether to apply the effect to targets')
        .tick((entity, entry, holder, enabled) => {
            if (enabled && entity.isPlayer()) {
                let scoreboardName = entry.getPropertyByName("score_value");
                let divisionAmount = entry.getPropertyByName("division_amount");
                let minimumScore = entry.getPropertyByName("minimum_score");
                let tag_ex = entry.getPropertyByName('tag_ex');
                let firetick = entry.getPropertyByName('fire_seconds');
                let baseDamage = entry.getPropertyByName('base_damage');
                let radius = entry.getPropertyByName('radius');
                let knockbackStrength = entry.getPropertyByName('knockback');
                let effectId = entry.getPropertyByName('effect_id') || 'minecraft:slowness';
                let effectDuration = entry.getPropertyByName('effect_duration') || 40;
                let effectAmplifier = entry.getPropertyByName('effect_amplifier') || 0;
                let applyEffect = entry.getPropertyByName('apply_effect');

                let username = entity.getGameProfile().getName();
                let scoreboard = Utils.server.scoreboard;
                let scoreboardObj = scoreboard.getObjective(scoreboardName);

                if (scoreboardObj != null) {
                    let score = scoreboard.getOrCreatePlayerScore(username, scoreboardObj);
                    let scoreValue = score.getScore();

                    if (scoreValue < minimumScore) {
                        scoreValue = minimumScore;
                    }

                    let chargeMultiplier = scoreValue / divisionAmount;
                    let scaledDamage = baseDamage * (chargeMultiplier / 10);

                    let searchRadius = radius * 2.0;
                    let targets = entity.serverLevel().getEntities(entity, AABB.ofSize(entity.position(), searchRadius, searchRadius, searchRadius)).toArray();

                    let entitiesHit = 0;

                    for (let j = 0; j < targets.length; j++) {
                        if (targets[j] !== entity &&
                            !containsTag(targets[j].getTags().toArray(), tag_ex) &&
                            targets[j].type !== "minecraft:item" &&
                            targets[j].type !== "minecraft:item_frame" &&
                            targets[j].type !== "minecraft:glow_item_frame" &&
                            targets[j].type !== "minecraft:armor_stand" &&
                            targets[j].type !== "palladium:suit_stand") {

                            targets[j].attack(entity.level.damageSources().playerAttack(entity), scaledDamage);

                            targets[j].setSecondsOnFire(firetick);

                            if (applyEffect && targets[j].isLiving()) {
                                targets[j].potionEffects.add(String(effectId), Number(effectDuration), Number(effectAmplifier), false, false);
                            }

                            if (knockbackStrength > 0) {
                                global.appppppplyknockback(entity, targets[j], knockbackStrength);
                            }

                            entitiesHit++;
                        }
                    }
                }
            }
        });
});




StartupEvents.registry('palladium:abilities', (event) => {
  event.create('alienevo:motion_roll')
    .icon(palladium.createItemIcon('palladium:vibranium_circuit'))
    .addProperty("motion", "float", 1, "Motion")
    .tick((entity, entry, holder, enabled) => {
      if (enabled) {
        let motion = entry.getPropertyByName("motion");
        let angle = entity.getLookAngle().scale(motion);
        entity.setDeltaMovement(angle);
        entity.motionY = -2.8;

        if (entity.isPlayer()) {
          entity.connection.send(new ClientboundSetEntityMotionPacket(entity));
        }
      }
    });
});


let LivingEntity = Java.loadClass('net.minecraft.world.entity.LivingEntity');

let vacuumedEntities = [];
let totalHealthHeld = 0;
let entityVacuumTimes = [];
let originalScales = [];

StartupEvents.registry('palladium:abilities', (event) => {
    event.create('alienevo:entity_vacuum')
        .icon(palladium.createItemIcon('minecraft:ender_eye'))
        .addProperty("search_radius", "float", 5.0, "Radius to search for entities")
        .addProperty("debug_mode", "boolean", true, "Enable debug messages")
        .addProperty("max_hearts", "float", 20.0, "Maximum hearts worth of entities to hold")
        .firstTick((entity, entry, holder, enabled) => {
            if (enabled && entity.isPlayer()) {
                let searchRadius = entry.getPropertyByName("search_radius");
                let debugMode = entry.getPropertyByName("debug_mode");
                let maxHearts = entry.getPropertyByName("max_hearts");

                vacuumedEntities = [];
                totalHealthHeld = 0;
                entityVacuumTimes = [];
                originalScales = [];
                
                try {
                    let entityAABB = entity.boundingBox.inflate(searchRadius);
                    let nearbyEntities = entity.level.getEntitiesWithin(entityAABB);
                    
                    let affectedCount = 0;
                    
                    if (nearbyEntities) {
                        nearbyEntities.forEach(nearby => {
                            if (nearby == null || 
                                nearby.id === entity.id || 
                                !nearby.isAlive()) return;
                            if (!(nearby instanceof LivingEntity)) return;
                            let dx = entity.x - nearby.x;
                            let dy = entity.y - nearby.y;
                            let dz = entity.z - nearby.z;
                            let distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
                            
                            if (distance <= searchRadius) {
                                let entityMaxHealth = nearby.getMaxHealth();
                                let entityHearts = entityMaxHealth / 2.0;
                                if (totalHealthHeld + entityHearts <= maxHearts) {
                                    let originalHeight = SCALE_TYPES.HEIGHT.getScaleData(nearby).getScale();
                                    let originalWidth = SCALE_TYPES.WIDTH.getScaleData(nearby).getScale();
                                    originalScales.push({height: originalHeight, width: originalWidth});
                                    SCALE_TYPES.HEIGHT.getScaleData(nearby).setScale(0.0);
                                    SCALE_TYPES.WIDTH.getScaleData(nearby).setScale(0.0);
                                    nearby.setInvulnerable(true);
                                    if (!nearby.isPlayer()) {
                                        nearby.setNoAi(true);
                                    }
                                    nearby.addTag("AlienEvo.CarriedEntity");
                                    nearby.setSilent(true);
                                    nearby.noPhysics = true;
                                    palladium.superpowers.addSuperpower(nearby, 'alienevo:blind');

                                    vacuumedEntities.push(nearby);
                                    entityVacuumTimes.push(0);
                                    totalHealthHeld += entityHearts;
                                    affectedCount++;
                                    
                                    if (debugMode) {
                                        let entityType = nearby.isPlayer() ? "Player" : "Mob";
                                        entity.tell("Vacuumed " + entityType + " " + nearby.getName().getString() + " (" + entityHearts.toFixed(1) + " hearts). Total: " + totalHealthHeld.toFixed(1) + "/" + maxHearts + " hearts");
                                    }
                                } else {
                                    if (debugMode) {
                                        let entityType = nearby.isPlayer() ? "Player" : "Mob";
                                        entity.tell("Cannot vacuum " + entityType + " " + nearby.getName().getString() + " (" + entityHearts.toFixed(1) + " hearts) - would exceed limit (" + (totalHealthHeld + entityHearts).toFixed(1) + "/" + maxHearts + ")");
                                    }
                                }
                            }
                        });
                    }
                    
                    if (debugMode) {
                        entity.tell("Entity Vacuum activated! Affected " + affectedCount + " entities. Holding " + totalHealthHeld.toFixed(1) + "/" + maxHearts + " hearts worth of entities");
                    }
                    
                } catch (e) {
                    if (debugMode) {
                        entity.tell("Error in entity vacuum: " + e.message);
                    }
                }
            }
        })
        .tick((entity, entry, holder, enabled) => {
            if (enabled && entity.isPlayer() && vacuumedEntities.length > 0) {
                let debugMode = entry.getPropertyByName("debug_mode");
                for (let i = 0; i < vacuumedEntities.length; i++) {
                    let vacuumedEntity = vacuumedEntities[i];
                    
                    try {
                        if (vacuumedEntity && vacuumedEntity.isAlive()) {
                            vacuumedEntity.teleportTo(entity.x, entity.y, entity.z);
                            entityVacuumTimes[i]++;
                            let ticksVacuumed = entityVacuumTimes[i];
                            let maxTicks = 400;
                            let nauseaLevel = 0;
                            
                            if (ticksVacuumed > 0) {
                                nauseaLevel = Math.min(3, Math.floor((ticksVacuumed / maxTicks) * 4));
                                
                                if (nauseaLevel > 0) {
                                    let nauseaDuration = ticksVacuumed;
                                    vacuumedEntity.potionEffects.add('minecraft:nausea', nauseaDuration, nauseaLevel - 1);
                                }
                                
                                if (debugMode && ticksVacuumed % 100 === 0) {
                                    let secondsVacuumed = (ticksVacuumed / 20).toFixed(1);
                                    let entityType = vacuumedEntity.isPlayer() ? "Player" : "Mob";
                                    entity.tell(entityType + " " + vacuumedEntity.getName().getString() + " - " + secondsVacuumed + "s vacuumed, Nausea Level: " + nauseaLevel);
                                }
                            }
                        }
                    } catch (e) {
                    }
                }
            }
        })
        .lastTick((entity, entry, holder, enabled) => {
            if (entity.isPlayer() && vacuumedEntities.length > 0) {
                let debugMode = entry.getPropertyByName("debug_mode");
                let restoredCount = 0;
                
                vacuumedEntities.forEach(vacuumedEntity => {
                    try {
                        if (vacuumedEntity && vacuumedEntity.isAlive()) {
                            SCALE_TYPES.HEIGHT.getScaleData(vacuumedEntity).setScale(1.0);
                            SCALE_TYPES.WIDTH.getScaleData(vacuumedEntity).setScale(1.0);
                            vacuumedEntity.setInvulnerable(false);

                            if (!vacuumedEntity.isPlayer()) {
                                vacuumedEntity.setNoAi(false);
                            }

                            vacuumedEntity.removeTag("AlienEvo.CarriedEntity");
                            vacuumedEntity.setSilent(false);
                            vacuumedEntity.noPhysics = false;
                            palladium.superpowers.removeSuperpower(vacuumedEntity, 'alienevo:blind');
                            
                            restoredCount++;
                            
                            if (debugMode) {
                                let entityType = vacuumedEntity.isPlayer() ? "Player" : "Mob";
                                entity.tell("Restored " + entityType + ": " + vacuumedEntity.getName().getString() + " - AI: " + !vacuumedEntity.isNoAi() + ", Sound: " + !vacuumedEntity.isSilent() + ", Physics: " + !vacuumedEntity.noPhysics);
                            }
                        }
                    } catch (e) {
                        if (debugMode) {
                            entity.tell("Error restoring entity: " + e.message);
                        }
                    }
                });
                
                if (debugMode) {
                    entity.tell("Entity Vacuum deactivated! Restored " + restoredCount + " entities to normal size");
                }

                vacuumedEntities = [];
                totalHealthHeld = 0;
                entityVacuumTimes = [];
                originalScales = [];
            }
        });
});