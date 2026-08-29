StartupEvents.registry('palladium:abilities', (event) => {
    const MAX_ALIEN_SLOTS = 10;
    const MIN_ALIEN_SLOT = 1;
    const OMNITRIX_PROPERTY_KEY = 'omnitrix_cycle';
    const CURRENT_PLAYLIST_KEY = 'current_playlist';
    const CURRENT_ALIEN_SLOT_KEY = 'current_alien_slot';
    const CYCLE_COOLDOWN_KEY = 'omnitrix_cycle_cooldown';
    const CYCLE_DELAY = 5;
    
    event.create('alienevo:omnitrix_cycle_next_animated')
        .icon(palladium.createItemIcon('minecraft:blaze_rod'))
        .addProperty("property", "string", OMNITRIX_PROPERTY_KEY, "Do not change this property")
        .tick((entity, abilityEntry, abilityHolder, isEnabled) => {
            if (isEnabled && entity) {
                const omnitrixData = entity.persistentData;
                if (!omnitrixData) return;

                if (omnitrixData[CYCLE_COOLDOWN_KEY] === undefined) {
                    omnitrixData[CYCLE_COOLDOWN_KEY] = 0;
                }

                if (omnitrixData[CYCLE_COOLDOWN_KEY] <= 0) {
                    cycleOmnitrixAlien(entity, abilityEntry, 1);
                    omnitrixData[CYCLE_COOLDOWN_KEY] = CYCLE_DELAY;
                } else {
                    omnitrixData[CYCLE_COOLDOWN_KEY]--;
                }
            }
        });
    
    function cycleOmnitrixAlien(entity, abilityEntry, direction) {
        const omnitrixData = entity.persistentData;
        if (!omnitrixData) return;
        
        initializeOmnitrixData(omnitrixData);
        
        const currentPlaylist = omnitrixData[CURRENT_PLAYLIST_KEY];
        const currentAlienSlot = omnitrixData[CURRENT_ALIEN_SLOT_KEY];
        
        const alienCount = countAvailableAliens(omnitrixData, currentPlaylist);
                
        if (alienCount === 0) {
            return;
        }
        
        const nextAlienSlot = findNextValidAlienSlot(entity, omnitrixData, currentPlaylist, currentAlienSlot, direction);
        
        if (nextAlienSlot !== -1) {
            omnitrixData[CURRENT_ALIEN_SLOT_KEY] = nextAlienSlot;
            const nextAlienNumber = omnitrixData[`alienevo.alien_${currentPlaylist}_${nextAlienSlot}`];
                        
            palladium.setProperty(entity, abilityEntry.getPropertyByName('property'), nextAlienNumber);
                    
        }
    }
    
    function findNextValidAlienSlot(entity, omnitrixData, playlist, startSlot, direction) {
        const validSlots = [];
        for (let slot = MIN_ALIEN_SLOT; slot <= MAX_ALIEN_SLOTS; slot++) {
            if (isValidAlien(omnitrixData[`alienevo.alien_${playlist}_${slot}`])) {
                validSlots.push(slot);
            }
        }
                
        if (validSlots.length === 0) {
            return -1;
        }
                
        validSlots.sort((a, b) => a - b);
                
        const currentIndex = validSlots.indexOf(startSlot);
                
        if (currentIndex === -1) {
            return validSlots[0];
        }
                
        let nextIndex = currentIndex + direction;
                
        if (nextIndex >= validSlots.length) {
            nextIndex = 0;
        } else if (nextIndex < 0) {
            nextIndex = validSlots.length - 1;
        }
                
        const nextSlot = validSlots[nextIndex];
                
        return nextSlot;
    }
    
    function initializeOmnitrixData(omnitrixData) {
        if (!omnitrixData[CURRENT_ALIEN_SLOT_KEY]) {
            omnitrixData[CURRENT_ALIEN_SLOT_KEY] = MIN_ALIEN_SLOT;
        }
        if (!omnitrixData[CURRENT_PLAYLIST_KEY]) {
            omnitrixData[CURRENT_PLAYLIST_KEY] = MIN_ALIEN_SLOT;
        }
    }
    
    function isValidAlien(alienType) {
        return alienType != null && alienType !== 0;
    }
    
    function countAvailableAliens(omnitrixData, playlist) {
        let alienCount = 0;
        for (let slot = MIN_ALIEN_SLOT; slot <= MAX_ALIEN_SLOTS; slot++) {
            if (isValidAlien(omnitrixData[`alienevo.alien_${playlist}_${slot}`])) {
                alienCount++;
            }
        }
        return alienCount;
    }
});