StartupEvents.registry('palladium:abilities', (event) => {
    const OMNITRIX_PROPERTY_KEY = 'omnitrix_cycle';
    const CURRENT_PLAYLIST_KEY = 'current_playlist';
    const CURRENT_ALIEN_SLOT_KEY = 'current_alien_slot';
    
    const DEFAULT_PLAYLIST = 1;
    const DEFAULT_SLOT = 1;

    event.create('alienevo:omnitrix_detransform')
        .icon(palladium.createItemIcon('minecraft:blaze_rod'))
        .addProperty("property", "string", OMNITRIX_PROPERTY_KEY, "Internal property key for the Omnitrix cycle")

        .lastTick((entity, entry, holder, enabled) => {
            if (enabled) {
                let playerUsername = entity.getGameProfile().getName();
                
                let watchType = palladium.getProperty(entity, 'watch');
                let watchNamespace = palladium.getProperty(entity, 'watch_namespace');
                
                if (!watchNamespace) {
                    watchNamespace = "alienevo";
                }
                
                let useTimeoutBubble = palladium.getProperty(entity, 'use_timeout_bubble');
                
                if (!watchType) {
                    watchType = "prototype";
                }

                const hasMasterControl = entity.tags.contains("AlienEvo.MasterControl");

                const propertyKey = entry.getPropertyByName('property');
                
                let currentAlienId = -1;
                
                let alienNamespace = entity.persistentData.getString('alienevo.current_namespace');
                let alienPath = entity.persistentData.getString('alienevo.current_path');
                
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
                    currentAlienId = palladium.getProperty(entity, propertyKey);
                }
                
                if (currentAlienId < 1) {
                    let currentPlaylistId = entity.persistentData[CURRENT_PLAYLIST_KEY] || DEFAULT_PLAYLIST;
                    let currentSlotId = entity.persistentData[CURRENT_ALIEN_SLOT_KEY] || DEFAULT_SLOT;
                    
                    currentAlienId = entity.persistentData[`alienevo.alien_${currentPlaylistId}_${currentSlotId}`];
                }
                
                if (currentAlienId && currentAlienId >= 1) {
                    palladium.setProperty(entity, propertyKey, currentAlienId);
                    
                    let alienData = global[`alienevo_alien_${currentAlienId}`];
                    if (!alienData) {
                        return;
                    }
                    
                    let alienFullIdentifier = alienData[0];
                    let currentNamespace = 'alienevo_aliens';
                    let currentPath = alienFullIdentifier;
                    
                    if (alienFullIdentifier.includes(':')) {
                        const identifierParts = alienFullIdentifier.split(':');
                        currentNamespace = identifierParts[0];
                        currentPath = identifierParts[1];
                    }
                    
                    if (!hasMasterControl) {
                        palladium.setProperty(entity, 'watch_state', "timeout");
                    }
                    
                    entity.server.runCommandSilent(`execute as ${playerUsername} at @s run superpower remove ${currentNamespace}:${currentPath}`);
                    
                    if (hasMasterControl) {
                        palladium.superpowers.addSuperpower(entity, new ResourceLocation("alienevo:transform_bubble"));
                    } else if (useTimeoutBubble === true) {
                        palladium.superpowers.addSuperpower(entity, new ResourceLocation("alienevo:transform_bubble_tout"));
                    } else {
                        palladium.superpowers.addSuperpower(entity, new ResourceLocation("alienevo:transform_bubble"));
                    }
                    
                    
                    if (currentNamespace !== 'alienevo_aliens') {
                        entity.server.runCommandSilent(`execute as ${playerUsername} at @s run superpower remove alienevo_aliens:all`);
                    }
                    
                    if (alienNamespace && alienNamespace !== currentNamespace && alienNamespace !== 'alienevo_aliens') {
                        entity.server.runCommandSilent(`execute as ${playerUsername} at @s run superpower remove ${alienNamespace}:all`);
                    }
                    
                    superpowerUtil.addSuperpower(entity, new ResourceLocation(`${watchNamespace}:${watchType}_omnitrix`));
                    entity.server.runCommandSilent(`execute as ${playerUsername} at @s run superpower remove alienevo_aliens:all`);
                    entity.tags.remove("AlienEvo.Transformation");
                    
                    if (!hasMasterControl) {
                        let scoreboardManager = Utils.server.scoreboard;
                        let timerObjective = scoreboardManager.getObjective('AlienEvo.Timer');
                        let playerTimerScore = scoreboardManager.getOrCreatePlayerScore(playerUsername, timerObjective);
                        let currentTimerValue = playerTimerScore.getScore();
                        
                        entity.server.runCommandSilent(`execute as ${playerUsername} at @s run scoreboard players set @s AlienEvo.Timer ${Math.floor(currentTimerValue / 2)}`);
                    }
                    palladium.setProperty(entity, 'quick_change_wheel', "disabled");
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
                }
            }
        });
});