StartupEvents.registry('palladium:abilities', (event) => {
    let OMNITRIX_PROPERTY_KEY = 'omnitrix_cycle';
    let CURRENT_PLAYLIST_KEY = 'current_playlist';
    let CURRENT_ALIEN_SLOT_KEY = 'current_alien_slot';
    
    let DEFAULT_PLAYLIST = 1;
    let DEFAULT_SLOT = 1;
    let MAX_PLAYLISTS = 100;
    let MAX_SLOTS = 10;
    
    event.create('alienevo:omnitrix_cycle_playlists')
        .icon(palladium.createItemIcon('minecraft:blaze_rod'))
        .addProperty("cycle_direction", "string", "right", "Direction to cycle playlists")
        .addProperty("property", "string", OMNITRIX_PROPERTY_KEY, "Cycle property")
        .addProperty("update_main_property", "boolean", false, "Whether to update the main omnitrix property")
        .tick((entity, entry, holder, enabled) => {
            if (enabled) {
                let direction = entry.getPropertyByName('cycle_direction') === "right" ? 1 : -1;
                let currentPlaylist = entity.persistentData[CURRENT_PLAYLIST_KEY] || DEFAULT_PLAYLIST;
                let currentSlot = entity.persistentData[CURRENT_ALIEN_SLOT_KEY] || DEFAULT_SLOT;
                let startingPlaylist = currentPlaylist;
                let alienFound = false;
                
                do {
                    currentPlaylist += direction;
                    
                    if (currentPlaylist > MAX_PLAYLISTS) currentPlaylist = 1;
                    if (currentPlaylist < 1) currentPlaylist = MAX_PLAYLISTS;
                    
                    for (let slot = 1; slot <= MAX_SLOTS; slot++) {
                        let alienNumber = entity.persistentData[`alienevo.alien_${currentPlaylist}_${slot}`];
                        
                        if (alienNumber > 0) {
                            entity.persistentData[CURRENT_PLAYLIST_KEY] = currentPlaylist;
                            entity.persistentData[CURRENT_ALIEN_SLOT_KEY] = slot;

                            let updateMainProperty = entry.getPropertyByName('update_main_property');
                            if (updateMainProperty) {
                                let propertyKey = entry.getPropertyByName('property');
                                palladium.setProperty(entity, propertyKey, alienNumber);
                            }

                            updateAllSlotProperties(entity, currentPlaylist);
                            
                            alienFound = true;
                            break;
                        }
                    }
                    
                    if (alienFound) break;
                    
                } while (currentPlaylist !== startingPlaylist);
            }
        });

    function updateAllSlotProperties(entity, playlist) {
        for (let slot = 1; slot <= MAX_SLOTS; slot++) {
            let alienType = entity.persistentData.getInt(`alienevo.alien_${playlist}_${slot}`) || 0;
            palladium.setProperty(entity, `alien_evo_slot_${slot}`, alienType);
        }
    }
});