StartupEvents.registry('palladium:abilities', (event) => {
    let MAX_ALIEN_SLOTS = 10;
    let MIN_ALIEN_SLOT = 1;
    let MAX_PLAYLISTS = 10;
    let OMNITRIX_PROPERTY_KEY = 'omnitrix_cycle';
    let NEXT_ALIEN_PROPERTY_KEY = 'omnitrix_next_alien';
    let NEXT_NEXT_ALIEN_PROPERTY_KEY = 'omnitrix_next_next_alien';
    let PREV_ALIEN_PROPERTY_KEY = 'omnitrix_prev_alien';
    let PREV_PREV_ALIEN_PROPERTY_KEY = 'omnitrix_prev_prev_alien';
    let CURRENT_PLAYLIST_KEY = 'current_playlist';
    let CURRENT_ALIEN_SLOT_KEY = 'current_alien_slot';

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    event.create('alienevo:omnitrix_cycle_next')
        .icon(palladium.createItemIcon('minecraft:blaze_rod'))
        .addProperty("property", "string", OMNITRIX_PROPERTY_KEY, "Do not change this property")
        .addProperty("next_property", "string", NEXT_ALIEN_PROPERTY_KEY, "Property for next alien in cycle")
        .addProperty("next_next_property", "string", NEXT_NEXT_ALIEN_PROPERTY_KEY, "Property for alien two ahead in cycle")
        .addProperty("prev_property", "string", PREV_ALIEN_PROPERTY_KEY, "Property for previous alien in cycle")
        .addProperty("prev_prev_property", "string", PREV_PREV_ALIEN_PROPERTY_KEY, "Property for alien two behind in cycle")
        .addProperty("use_multiple_sounds", "boolean", false, "Whether to randomize between multiple cycling sounds")
        .addProperty("cycle_sound", "string", "prototype_cycle_1", "The primary sound to play when cycling")
        .addProperty("alt_sound_1", "string", "prototype_cycle_2", "First alternative cycling sound")
        .addProperty("alt_sound_2", "string", "prototype_cycle_3", "Second alternative cycling sound")
        .addProperty("alt_sound_3", "string", "prototype_cycle_4", "Third alternative cycling sound")
        .addProperty("randomize_pitch", "boolean", false, "Whether to randomize the pitch of cycling sounds")
        .tick((entity, abilityEntry, abilityHolder, isEnabled) => {
            if (isEnabled && entity) {
                checkAndHandlePlaylistChange(entity, abilityEntry);
                
                cycleOmnitrixAlien(entity, abilityEntry, 1);
                playCycleSound(entity, abilityEntry);
            }
        });

    event.create('alienevo:omnitrix_cycle_previous')
        .icon(palladium.createItemIcon('minecraft:blaze_rod'))
        .addProperty("property", "string", OMNITRIX_PROPERTY_KEY, "Do not change this property")
        .addProperty("next_property", "string", NEXT_ALIEN_PROPERTY_KEY, "Property for next alien in cycle")
        .addProperty("next_next_property", "string", NEXT_NEXT_ALIEN_PROPERTY_KEY, "Property for alien two ahead in cycle")
        .addProperty("prev_property", "string", PREV_ALIEN_PROPERTY_KEY, "Property for previous alien in cycle")
        .addProperty("prev_prev_property", "string", PREV_PREV_ALIEN_PROPERTY_KEY, "Property for alien two behind in cycle")
        .addProperty("use_multiple_sounds", "boolean", false, "Whether to randomize between multiple cycling sounds")
        .addProperty("cycle_sound", "string", "prototype_cycle_1", "The primary sound to play when cycling")
        .addProperty("alt_sound_1", "string", "prototype_cycle_2", "First alternative cycling sound")
        .addProperty("alt_sound_2", "string", "prototype_cycle_3", "Second alternative cycling sound")
        .addProperty("alt_sound_3", "string", "prototype_cycle_4", "Third alternative cycling sound")
        .addProperty("randomize_pitch", "boolean", false, "Whether to randomize the pitch of cycling sounds")
        .tick((entity, abilityEntry, abilityHolder, isEnabled) => {
            if (isEnabled && entity) {
                checkAndHandlePlaylistChange(entity, abilityEntry);
                
                cycleOmnitrixAlien(entity, abilityEntry, -1);
                playCycleSound(entity, abilityEntry);
            }
        });

    function playCycleSound(entity, abilityEntry) {
        let useMultipleSounds = abilityEntry.getPropertyByName('use_multiple_sounds');
        let randomizePitch = abilityEntry.getPropertyByName('randomize_pitch');
        
        let soundToPlay;
        
        if (useMultipleSounds) {
            let primarySound = abilityEntry.getPropertyByName('cycle_sound');
            let altSound1 = abilityEntry.getPropertyByName('alt_sound_1');
            let altSound2 = abilityEntry.getPropertyByName('alt_sound_2');
            let altSound3 = abilityEntry.getPropertyByName('alt_sound_3');

            let maxSoundOption = 4;
            
            let soundChoice = getRandomInt(1, maxSoundOption);
            
            switch (soundChoice) {
                case 1:
                    soundToPlay = primarySound;
                    break;
                case 2:
                    soundToPlay = altSound1;
                    break;
                case 3:
                    soundToPlay = altSound2;
                    break;
                case 4:
                    soundToPlay = altSound3;
                    break;
                default:
                    soundToPlay = primarySound;
            }
        } else {
            soundToPlay = abilityEntry.getPropertyByName('cycle_sound');
        }

        let pitch = 1.0;
        if (randomizePitch) {
            pitch = 0.85 + (Math.random() * 0.25);
        }
        entity.level.playSound(
            null,
            entity.x,
            entity.y,
            entity.z,
            `alienevo:${soundToPlay}`,
            entity.getSoundSource(),
            0.7,
            pitch
        );
    }

    function checkAndHandlePlaylistChange(entity, abilityEntry) {
        let omnitrixData = entity.persistentData;
        if (!omnitrixData) return;
        
        initializeOmnitrixData(omnitrixData);

        let currentPlaylist = omnitrixData.getInt(CURRENT_PLAYLIST_KEY) || 1;
        updateAllSlotProperties(entity, currentPlaylist);

        updateAdditionalAlienProperties(entity, abilityEntry);
    }

    function updateAllSlotProperties(entity, playlist) {
        for (let slot = 1; slot <= MAX_ALIEN_SLOTS; slot++) {
            let alienType = entity.persistentData.getInt(`alienevo.alien_${playlist}_${slot}`) || 0;
            palladium.setProperty(entity, `alien_evo_slot_${slot}`, alienType);
        }

        let currentSlot = entity.persistentData.getInt(CURRENT_ALIEN_SLOT_KEY) || 1;
        let currentAlien = entity.persistentData.getInt(`alienevo.alien_${playlist}_${currentSlot}`) || 0;

        palladium.setProperty(entity, OMNITRIX_PROPERTY_KEY, currentAlien);
    }

    function cycleOmnitrixAlien(entity, abilityEntry, direction) {
        let omnitrixData = entity.persistentData;
        if (!omnitrixData) return;

        initializeOmnitrixData(omnitrixData);

        let currentPlaylist = omnitrixData.getInt(CURRENT_PLAYLIST_KEY) || 1;
        let currentAlienSlot = omnitrixData.getInt(CURRENT_ALIEN_SLOT_KEY) || 1;

        let alienCount = countAvailableAliens(omnitrixData, currentPlaylist);
        
        if (alienCount === 0) {
            return;
        }

        let nextAlienSlot = findNextValidAlienSlot(entity, omnitrixData, currentPlaylist, currentAlienSlot, direction);

        if (nextAlienSlot !== -1) {
            omnitrixData.putInt(CURRENT_ALIEN_SLOT_KEY, nextAlienSlot);
            let nextAlienNumber = omnitrixData.getInt(`alienevo.alien_${currentPlaylist}_${nextAlienSlot}`);
            
            palladium.setProperty(entity, abilityEntry.getPropertyByName('property'), nextAlienNumber);

            updateAllSlotProperties(entity, currentPlaylist);

            updateAdditionalAlienProperties(entity, abilityEntry);
        }
    }

    function updateAdditionalAlienProperties(entity, abilityEntry) {
        let omnitrixData = entity.persistentData;
        if (!omnitrixData) return;
        
        let currentPlaylist = omnitrixData.getInt(CURRENT_PLAYLIST_KEY) || 1;
        let currentAlienSlot = omnitrixData.getInt(CURRENT_ALIEN_SLOT_KEY) || 1;

        let nextPropName = abilityEntry.getPropertyByName('next_property');
        let nextNextPropName = abilityEntry.getPropertyByName('next_next_property');
        let prevPropName = abilityEntry.getPropertyByName('prev_property');
        let prevPrevPropName = abilityEntry.getPropertyByName('prev_prev_property');

        let nextSlot = findNextValidAlienSlot(entity, omnitrixData, currentPlaylist, currentAlienSlot, 1);
        let prevSlot = findNextValidAlienSlot(entity, omnitrixData, currentPlaylist, currentAlienSlot, -1);

        let nextNextSlot = findNextValidAlienSlot(entity, omnitrixData, currentPlaylist, nextSlot, 1);
        let prevPrevSlot = findNextValidAlienSlot(entity, omnitrixData, currentPlaylist, prevSlot, -1);

        let nextAlien = (nextSlot !== -1) ? omnitrixData.getInt(`alienevo.alien_${currentPlaylist}_${nextSlot}`) : 0;
        let nextNextAlien = (nextNextSlot !== -1) ? omnitrixData.getInt(`alienevo.alien_${currentPlaylist}_${nextNextSlot}`) : 0;
        let prevAlien = (prevSlot !== -1) ? omnitrixData.getInt(`alienevo.alien_${currentPlaylist}_${prevSlot}`) : 0;
        let prevPrevAlien = (prevPrevSlot !== -1) ? omnitrixData.getInt(`alienevo.alien_${currentPlaylist}_${prevPrevSlot}`) : 0;

        palladium.setProperty(entity, nextPropName, nextAlien);
        palladium.setProperty(entity, nextNextPropName, nextNextAlien);
        palladium.setProperty(entity, prevPropName, prevAlien);
        palladium.setProperty(entity, prevPrevPropName, prevPrevAlien);
    }

    function findNextValidAlienSlot(entity, omnitrixData, playlist, startSlot, direction) {
        let validSlots = [];
        for (let slot = MIN_ALIEN_SLOT; slot <= MAX_ALIEN_SLOTS; slot++) {
            if (isValidAlien(omnitrixData.getInt(`alienevo.alien_${playlist}_${slot}`))) {
                validSlots.push(slot);
            }
        }
        
        if (validSlots.length === 0) {
            return -1;
        }
        
        validSlots.sort((a, b) => a - b);
        
        let currentIndex = validSlots.indexOf(startSlot);
        
        if (currentIndex === -1) {
            return validSlots[0];
        }
        
        let nextIndex = currentIndex + direction;
        
        if (nextIndex >= validSlots.length) {
            nextIndex = 0;
        } else if (nextIndex < 0) {
            nextIndex = validSlots.length - 1;
        }
        
        let nextSlot = validSlots[nextIndex];
        
        return nextSlot;
    }

    function initializeOmnitrixData(omnitrixData) {
        if (!omnitrixData.getInt(CURRENT_ALIEN_SLOT_KEY)) {
            omnitrixData.putInt(CURRENT_ALIEN_SLOT_KEY, MIN_ALIEN_SLOT);
        }
        if (!omnitrixData.getInt(CURRENT_PLAYLIST_KEY)) {
            omnitrixData.putInt(CURRENT_PLAYLIST_KEY, 1);
        }

        for (let playlist = 1; playlist <= MAX_PLAYLISTS; playlist++) {
            for (let slot = MIN_ALIEN_SLOT; slot <= MAX_ALIEN_SLOTS; slot++) {
                let key = `alienevo.alien_${playlist}_${slot}`;
                if (omnitrixData.getInt(key) === 0) {
                    omnitrixData.putInt(key, 0);
                }
            }
        }
    }

    function isValidAlien(alienType) {
        return alienType != null && alienType !== 0;
    }

    function countAvailableAliens(omnitrixData, playlist) {
        let alienCount = 0;
        for (let slot = MIN_ALIEN_SLOT; slot <= MAX_ALIEN_SLOTS; slot++) {
            if (isValidAlien(omnitrixData.getInt(`alienevo.alien_${playlist}_${slot}`))) {
                alienCount++;
            }
        }
        return alienCount;
    }
});