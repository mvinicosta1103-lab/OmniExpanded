StartupEvents.registry('palladium:abilities', (event) => {
  const OMNITRIX_PROPERTY_KEY = 'omnitrix_cycle';
  const TIMER_OBJECTIVE = 'AlienEvo.Timer';
  const MAX_TIMER = 6000;
  const TIMEOUT_WARNING = 5940;
  const TIMEOUT_TIMER = 3000;
  const CURRENT_PLAYLIST_KEY = 'current_playlist';
  const CURRENT_ALIEN_SLOT_KEY = 'current_alien_slot';
  const DEFAULT_PLAYLIST = 1;
  const DEFAULT_SLOT = 1;

  function hasMasterControl(entity) {
    let hasMasterControl = entity.tags.contains("AlienEvo.MasterControl");
    return hasMasterControl;
  }

  function isDead(entity) {
    let isDead = entity.health <= 0 || !entity.isAlive();
    return isDead;
  }

  function clearHealthTracking(entity) {
    entity.persistentData.remove('alienevo.previous_health');
    entity.persistentData.remove('alienevo.previous_hunger');
    entity.persistentData.remove('alienevo.health_percentage');
  }

  function saveHumanForm(entity) {
    let currentHealth = entity.health || 0;
    if (currentHealth !== undefined && currentHealth !== null) {
      entity.persistentData.putFloat('alienevo.previous_health', currentHealth);
    }

    let currentFoodLevel = entity.foodLevel || 0;
    if (currentFoodLevel !== undefined && currentFoodLevel !== null) {
      entity.persistentData.putInt('alienevo.previous_hunger', currentFoodLevel);
    }
  }

  function handleTimeoutDetransform(entity, alienNumber) {
    let watchType = palladium.getProperty(entity, 'watch') || "prototype";
    let watchNamespace = palladium.getProperty(entity, 'watch_namespace') || "alienevo";

    if (hasMasterControl(entity)) {
      return false;
    }

    // Set watch_state to "timeout" when timeout occurs
    palladium.setProperty(entity, 'watch_state', "timeout");

    performDetransformation(entity, watchType, watchNamespace, alienNumber);
    return true;
  }

  function handleDeathDetransform(entity, alienNumber) {
    let watchType = palladium.getProperty(entity, 'watch') || "prototype";
    let watchNamespace = palladium.getProperty(entity, 'watch_namespace') || "alienevo";

    if (hasMasterControl(entity)) {
      performDetransformationWithMasterControl(entity, watchType, watchNamespace, alienNumber);
    } else {
      performDetransformation(entity, watchType, watchNamespace, alienNumber);
    }
    return true;
  }

  function performDetransformationWithMasterControl(entity, watchType, watchNamespace, alienNumber) {
    performDetransformationCore(entity, watchType, watchNamespace, alienNumber, false);
  }

  function performDetransformation(entity, watchType, watchNamespace, alienNumber) {
    palladium.scoreboard.setScore(entity, TIMER_OBJECTIVE, TIMEOUT_TIMER);
    performDetransformationCore(entity, watchType, watchNamespace, alienNumber, true);
  }

  function performDetransformationCore(entity, watchType, watchNamespace, alienNumber, isTimerModified) {
    let username = entity.getGameProfile().getName();
    let useTimeoutBubble = palladium.getProperty(entity, 'use_timeout_bubble');

    try {
      if (entity.tags.contains("AlienEvo.Transformation")) {
        let currentMaxHealth = entity.getMaxHealth() || 20;
        let currentHealth = entity.health || 0;

        if (currentMaxHealth > 0) {
          let healthPercentage = Math.max(0.1, currentHealth / currentMaxHealth);
          entity.persistentData.putFloat('alienevo.health_percentage', healthPercentage);
        }
      }

      if (!isDead(entity)) {
        if (entity.persistentData.contains('alienevo.previous_health')) {
          let previousHealth = entity.persistentData.getFloat('alienevo.previous_health');
          entity.health = previousHealth;
        }

        if (entity.persistentData.contains('alienevo.previous_hunger')) {
          let previousHunger = entity.persistentData.getInt('alienevo.previous_hunger');
          entity.foodLevel = previousHunger;
        }

        if (!hasMasterControl(entity)) {
          entity.server.scheduleInTicks(2, () => {
            try {
              if (!entity.tags.contains("AlienEvo.Transformation")) {
                saveHumanForm(entity);
              }
            } catch (e) {
              console.log("Error updating human form after detransform: " + e);
            }
          });
        }
      }

      if (isDead(entity)) {
        clearHealthTracking(entity);
      }

      entity.tags.remove("AlienEvo.Transformation");
    } catch (e) {
      console.log("Error in detransformation health handling: " + e);
    }
    let alienNamespace = entity.persistentData.getString('alienevo.current_namespace');
    let alienPath = entity.persistentData.getString('alienevo.current_path');

    let currentAlienId = -1;

    if (alienNamespace && alienPath) {
      for (let alienIndex = 0; alienIndex <= 300; alienIndex++) {
        if (global[`alienevo_alien_${alienIndex}`]) {
          let globalAlienIdentifier = global[`alienevo_alien_${alienIndex}`][0];

          if (globalAlienIdentifier === `${alienNamespace}:${alienPath}` ||
            (globalAlienIdentifier === alienPath && alienNamespace === 'alienevo_aliens')) {
            currentAlienId = alienIndex;
            break;
          }
        }
      }
    }

    if (currentAlienId === -1) {
      currentAlienId = alienNumber;
    }

    if (currentAlienId < 1) {
      let currentPlaylistId = entity.persistentData[CURRENT_PLAYLIST_KEY] || DEFAULT_PLAYLIST;
      let currentSlotId = entity.persistentData[CURRENT_ALIEN_SLOT_KEY] || DEFAULT_SLOT;

      currentAlienId = entity.persistentData[`alienevo.alien_${currentPlaylistId}_${currentSlotId}`];
    }

    if (currentAlienId && currentAlienId >= 1) {
      let alienData = global[`alienevo_alien_${currentAlienId}`];
      if (alienData) {
        let alienFullIdentifier = alienData[0];
        let currentNamespace = 'alienevo_aliens';
        let currentPath = alienFullIdentifier;

        if (alienFullIdentifier.includes(':')) {
          let identifierParts = alienFullIdentifier.split(':');
          currentNamespace = identifierParts[0];
          currentPath = identifierParts[1];
        }

        entity.server.runCommandSilent(`execute as ${username} at @s run superpower remove ${currentNamespace}:${currentPath}`);
        entity.server.runCommandSilent(`execute as ${username} at @s run superpower remove alienevo_aliens:all`);

        if (currentNamespace !== 'alienevo_aliens') {
          entity.server.runCommandSilent(`execute as ${username} at @s run superpower remove alienevo_aliens:all`);
        }

        if (alienNamespace && alienNamespace !== currentNamespace && alienNamespace !== 'alienevo_aliens') {
          entity.server.runCommandSilent(`execute as ${username} at @s run superpower remove ${alienNamespace}:all`);
        }
      }
    }

    if (hasMasterControl(entity)) {
      palladium.superpowers.addSuperpower(entity, new ResourceLocation("alienevo:transform_bubble"));
    } else if (useTimeoutBubble === true) {
      palladium.superpowers.addSuperpower(entity, new ResourceLocation("alienevo:transform_bubble_tout"));
    } else {
      palladium.superpowers.addSuperpower(entity, new ResourceLocation("alienevo:transform_bubble"));
    }

    palladium.superpowers.addSuperpower(entity, new ResourceLocation(`${watchNamespace}:${watchType}_omnitrix`));

    entity.level.playSound(
      null,
      entity.x,
      entity.y,
      entity.z,
      `alienevo:${watchType}_detransform`,
      entity.getSoundSource(),
      1.0,
      1.0
    );

    if (!isTimerModified && hasMasterControl(entity)) {
    } else {
    }
  }

  event.create('alienevo:omnitrix_timer')
    .icon(palladium.createItemIcon('minecraft:clock'))
    .addProperty("property", "string", OMNITRIX_PROPERTY_KEY, "Internal property key for the Omnitrix cycle")

    .firstTick((entity, entry, holder, enabled) => {
      if (enabled) {
        try {
          palladium.scoreboard.getScore(entity, TIMER_OBJECTIVE, 0);

          if (!entity.tags.contains("AlienEvo.Transformation")) {
            saveHumanForm(entity);
          }

          try {
            entity.server.scheduleInTicks(1, () => {
              try {
                let wasAlreadyTransformed = entity.tags.contains("AlienEvo.Transformation");
                let storedHealthPercentage = entity.persistentData.contains('alienevo.health_percentage') ?
                  entity.persistentData.getFloat('alienevo.health_percentage') : -1;

                let oldCurrentHealth = entity.health || 0;
                let oldMaxHealth = entity.getMaxHealth() || 20;
                let healthRatio = 1.0;

                if (storedHealthPercentage > 0) {
                  healthRatio = storedHealthPercentage;
                }
                else if (wasAlreadyTransformed && oldMaxHealth > 0) {
                  healthRatio = oldCurrentHealth / oldMaxHealth;
                  healthRatio = Math.max(healthRatio, 0.1);
                }

                entity.tags.add("AlienEvo.Transformation");

                let newMaxHealth = entity.getMaxHealth();
                if (newMaxHealth !== undefined && newMaxHealth !== null) {
                  if (wasAlreadyTransformed || storedHealthPercentage > 0) {
                    entity.health = Math.max(1, newMaxHealth * healthRatio);
                  } else {
                    entity.health = newMaxHealth;
                  }
                }

                if (entity.foodLevel !== undefined) {
                  entity.foodLevel = 20;
                }

                if (entity.foodSaturationLevel !== undefined) {
                  entity.foodSaturationLevel = 20.0;
                }
              } catch (e) {
                console.log("Error in scheduled health application: " + e);
              }
            });
          } catch (e) {
            console.log("Error in scheduling, using fallback: " + e);

            let wasAlreadyTransformed = entity.tags.contains("AlienEvo.Transformation");
            let storedHealthPercentage = entity.persistentData.contains('alienevo.health_percentage') ?
              entity.persistentData.getFloat('alienevo.health_percentage') : -1;

            let oldCurrentHealth = entity.health || 0;
            let oldMaxHealth = entity.getMaxHealth() || 20;
            let healthRatio = 1.0;

            if (storedHealthPercentage > 0) {
              healthRatio = storedHealthPercentage;
            }
            else if (wasAlreadyTransformed && oldMaxHealth > 0) {
              healthRatio = oldCurrentHealth / oldMaxHealth;
              healthRatio = Math.max(healthRatio, 0.1); // Minimum 10% health
            }

            entity.tags.add("AlienEvo.Transformation");

            if (entity.getMaxHealth && entity.getMaxHealth() !== undefined) {
              let newMaxHealth = entity.getMaxHealth();
              if (wasAlreadyTransformed || storedHealthPercentage > 0) {
                entity.health = Math.max(1, newMaxHealth * healthRatio);
              } else {
                entity.health = newMaxHealth;
              }
            }

            if (entity.foodLevel !== undefined) {
              entity.foodLevel = 20;
            }

            if (entity.foodSaturationLevel !== undefined) {
              entity.foodSaturationLevel = 20.0;
            }
          }
        } catch (e) {
          console.log("Error in firstTick: " + e);
        }
      }
    })

    .tick((entity, entry, holder, enabled) => {
      if (enabled) {
        let username = entity.getGameProfile().getName();
        let watchType = palladium.getProperty(entity, 'watch') || "prototype";
        let watchNamespace = palladium.getProperty(entity, 'watch_namespace') || "alienevo";

        const propertyKey = entry.getPropertyByName('property');
        let alienNumber = palladium.getProperty(entity, propertyKey);
        let isTransformed = alienNumber > 0;

        if (isTransformed && isDead(entity)) {
          let wasDetransformed = handleDeathDetransform(entity, alienNumber);
          if (wasDetransformed) {
            return;
          }
        }

        if (hasMasterControl(entity)) {
          return;
        }

        palladium.scoreboard.addScore(entity, TIMER_OBJECTIVE, 1);
        let currentTime = palladium.scoreboard.getScore(entity, TIMER_OBJECTIVE, 0);

        if (isTransformed && currentTime == TIMEOUT_WARNING) {
          entity.level.playSound(
            null,
            entity.x,
            entity.y,
            entity.z,
            `alienevo:${watchType}_timeout`,
            entity.getSoundSource(),
            1.0,
            1.0
          );
        }

        if (!isTransformed && currentTime > 0) {
          palladium.scoreboard.setScore(entity, TIMER_OBJECTIVE, 0);
        }

        // Handle watch_state based on transformation and timer status
        if (isTransformed) {
          if ((currentTime >= 5940 && currentTime <= 5950) ||
            (currentTime >= 5960 && currentTime <= 5970) ||
            (currentTime >= 5980 && currentTime <= 6000)) {
            palladium.setProperty(entity, 'watch_state', "timeout");
          } else if ((currentTime > 5950 && currentTime < 5960) ||
            (currentTime > 5970 && currentTime < 5980)) {
            palladium.setProperty(entity, 'watch_state', "default");
          }
        }

        if (isTransformed && currentTime >= MAX_TIMER) {
          handleTimeoutDetransform(entity, alienNumber);
        }
      }
    })

    .lastTick((entity, entry, holder, enabled) => {
      palladium.setProperty(entity, 'quick_change_wheel', "disabled");
      try {
        if (entity.tags.contains("AlienEvo.Transformation")) {
          let currentMaxHealth = entity.getMaxHealth() || 20;
          let currentHealth = entity.health || 0;

          if (currentMaxHealth > 0) {
            let healthPercentage = Math.max(0.1, currentHealth / currentMaxHealth);
            entity.persistentData.putFloat('alienevo.health_percentage', healthPercentage);
          }
        }

        if (!isDead(entity)) {
          if (entity.persistentData.contains('alienevo.previous_health')) {
            let previousHealth = entity.persistentData.getFloat('alienevo.previous_health');
            entity.health = previousHealth;
          }

          if (entity.persistentData.contains('alienevo.previous_hunger')) {
            let previousHunger = entity.persistentData.getInt('alienevo.previous_hunger');
            entity.foodLevel = previousHunger;
          }

          entity.server.scheduleInTicks(1, () => {
            try {
              if (!entity.tags.contains("AlienEvo.Transformation")) {
                saveHumanForm(entity);
              }
            } catch (e) {
              console.log("Error in scheduled health update: " + e);
            }
          });
        }

        if (isDead(entity)) {
          clearHealthTracking(entity);
        }
      } catch (e) {
        console.log("Error in lastTick: " + e);
      }
    });
});