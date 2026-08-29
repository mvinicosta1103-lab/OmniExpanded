function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

StartupEvents.registry('palladium:abilities', (event) => {
    let OMNITRIX_PROPERTY_KEY = 'omnitrix_cycle';
    let CURRENT_PLAYLIST_KEY = 'current_playlist';
    let CURRENT_ALIEN_SLOT_KEY = 'current_alien_slot';

    let DEFAULT_PLAYLIST = 1;
    let DEFAULT_SLOT = 1;

    let MAX_PLAYLISTS = 10;
    let MAX_SLOTS = 10;

    event.create('alienevo:omnitrix_transform')
        .icon(palladium.createItemIcon('minecraft:blaze_rod'))
        .addProperty("property", "string", OMNITRIX_PROPERTY_KEY, "Internal property key for the Omnitrix cycle")
        .addProperty("transform_sound", "string", "prototype", "The primary sound set to use during transformation (e.g., 'prototype')")
        .addProperty("use_multiple_sounds", "boolean", false, "Whether to randomize between multiple transformation sounds")
        .addProperty("alt_sound_1", "string", "omnitrix", "First alternative transformation sound")
        .addProperty("alt_sound_2", "string", "alien_force", "Second alternative transformation sound")
        .addProperty("use_randomizer", "boolean", true, "Whether to use the randomizer functionality")
        .addProperty("use_rarity_unlock", "boolean", true, "Whether to use rarity-based unlocking system")

        .lastTick((entity, abilityEntry, abilityHolder, isEnabled) => {
            if (!isEnabled || !entity) return;

            let username = entity.getGameProfile().getName();

            let hasMasterControl = entity.tags.contains("AlienEvo.MasterControl");

            if (hasMasterControl) {

                transformMasterControlUnlock(entity, abilityEntry, username);
            } else {
                let useRandomizer = abilityEntry.getPropertyByName('use_randomizer');

                if (useRandomizer) {
                    transformRandom(entity, abilityEntry, username);
                } else {
                    transformNormal(entity, abilityEntry, username);
                }
            }
        });

    function transformMasterControlUnlock(entity, abilityEntry, username) {
        let omnitrixPropertyKey = abilityEntry.getPropertyByName('property');

        let currentPlaylist = entity.persistentData[CURRENT_PLAYLIST_KEY] || DEFAULT_PLAYLIST;
        let currentAlienSlot = entity.persistentData[CURRENT_ALIEN_SLOT_KEY] || DEFAULT_SLOT;
        let selectedAlienNum = entity.persistentData[`alienevo.alien_${currentPlaylist}_${currentAlienSlot}`];


        let chance = getRandomInt(1, 500);

        if (chance === 1) {

            let newAlienUnlocked = tryUnlockRandomAlien(entity);

            if (newAlienUnlocked) {

                let emptySlot = findNearestEmptySlot(entity);

                if (emptySlot) {

                    entity.persistentData[`alienevo.alien_${emptySlot.playlist}_${emptySlot.slot}`] = newAlienUnlocked;


                    entity.persistentData[CURRENT_PLAYLIST_KEY] = emptySlot.playlist;
                    entity.persistentData[CURRENT_ALIEN_SLOT_KEY] = emptySlot.slot;

                    palladium.setProperty(entity, omnitrixPropertyKey, newAlienUnlocked);
                    let transformSound = getTransformSound(abilityEntry, entity);
                    transformToAlien(entity, newAlienUnlocked, username, transformSound, abilityEntry);
                    return;
                }
            }
        }


        if (selectedAlienNum && selectedAlienNum >= 1) {
            palladium.setProperty(entity, omnitrixPropertyKey, selectedAlienNum);
            let transformSound = getTransformSound(abilityEntry, entity);
            transformToAlien(entity, selectedAlienNum, username, transformSound, abilityEntry);
        }
    }

    function transformNormal(entity, abilityEntry, username) {
        let omnitrixPropertyKey = abilityEntry.getPropertyByName('property');

        let currentPlaylist = entity.persistentData[CURRENT_PLAYLIST_KEY] || DEFAULT_PLAYLIST;
        let currentAlienSlot = entity.persistentData[CURRENT_ALIEN_SLOT_KEY] || DEFAULT_SLOT;

        let alienNumber = entity.persistentData[`alienevo.alien_${currentPlaylist}_${currentAlienSlot}`];

        if (alienNumber && alienNumber >= 1) {
            palladium.setProperty(entity, omnitrixPropertyKey, alienNumber);

            let transformSound = getTransformSound(abilityEntry, entity);
            transformToAlien(entity, alienNumber, username, transformSound, abilityEntry);
        }
    }

    function getUnlockedAliens(entity) {

        let unlocked = [];

        for (let playlist = 1; playlist <= MAX_PLAYLISTS; playlist++) {
            for (let slot = 1; slot <= MAX_SLOTS; slot++) {
                let alienInSlot = entity.persistentData[`alienevo.alien_${playlist}_${slot}`];
                if (alienInSlot && alienInSlot > 0 && !unlocked.includes(alienInSlot)) {
                    unlocked.push(alienInSlot);
                }
            }
        }

        return unlocked;
    }

    function addUnlockedAlien(entity, alienId) {

        return;
    }


    function getRandomizationEntries() {
        var entries = [];

        if (global.alienevo_randomization && typeof global.alienevo_randomization === 'object' && !Array.isArray(global.alienevo_randomization)) {
            for (var alienId in global.alienevo_randomization) {
                var raw = global.alienevo_randomization[alienId];
                var enabled = (raw instanceof Array) ? !!raw[0] : !!raw;
                var idNum = parseInt(alienId);
                if (!isNaN(idNum)) {
                    entries.push({ id: idNum, enabled: enabled });
                }
            }
            return entries;
        }

        for (var key in global) {
            if (!key || typeof key !== 'string') continue;
            if (key.indexOf('alienevo_randomization_') !== 0) continue;

            var idStr = key.substring('alienevo_randomization_'.length);
            var idNum2 = parseInt(idStr);
            if (isNaN(idNum2)) continue;

            var raw2 = global[key];
            var enabled2 = (raw2 instanceof Array) ? !!raw2[0] : !!raw2;
            entries.push({ id: idNum2, enabled: enabled2 });
        }

        return entries;
    }



    function getAvailableAliensForUnlock(entity) {
        let unlocked = getUnlockedAliens(entity);
        let available = [];

        // Use normalized entries from either source
        const entries = getRandomizationEntries();

        for (const { id: alienIdNum, enabled } of entries) {
            if (!enabled || unlocked.includes(alienIdNum) || alienIdNum === 0) {
                continue;
            }
            available.push({ id: alienIdNum });
        }

        return available;
    }


    function tryUnlockRandomAlien(entity) {
        let available = getAvailableAliensForUnlock(entity);

        if (available.length === 0) {
            return null;
        }


        let randomAlien = available[getRandomInt(0, available.length - 1)];


        return randomAlien.id;
    }

    function findNearestEmptySlot(entity) {
        let currentPlaylist = entity.persistentData[CURRENT_PLAYLIST_KEY] || DEFAULT_PLAYLIST;
        let currentSlot = entity.persistentData[CURRENT_ALIEN_SLOT_KEY] || DEFAULT_SLOT;


        for (let slot = 1; slot <= MAX_SLOTS; slot++) {
            let alienInSlot = entity.persistentData[`alienevo.alien_${currentPlaylist}_${slot}`];
            if (!alienInSlot || alienInSlot === 0) {
                return { playlist: currentPlaylist, slot: slot };
            }
        }


        for (let playlist = 1; playlist <= MAX_PLAYLISTS; playlist++) {
            if (playlist === currentPlaylist) continue;

            for (let slot = 1; slot <= MAX_SLOTS; slot++) {
                let alienInSlot = entity.persistentData[`alienevo.alien_${playlist}_${slot}`];
                if (!alienInSlot || alienInSlot === 0) {
                    return { playlist: playlist, slot: slot };
                }
            }
        }

        return null;
    }

    function transformRandom(entity, abilityEntry, username) {
        let omnitrixPropertyKey = abilityEntry.getPropertyByName('property');

        let current_playlist = entity.persistentData[CURRENT_PLAYLIST_KEY] || DEFAULT_PLAYLIST;
        let current_slot = entity.persistentData[CURRENT_ALIEN_SLOT_KEY] || DEFAULT_SLOT;
        let selectedAlienNum = entity.persistentData[`alienevo.alien_${current_playlist}_${current_slot}`] || 0;


        let unlockChance = getRandomInt(1, 500);

        let randomizeChance = getRandomInt(1, 5);

        let alien_num = 0;

        if (unlockChance === 1) {
            let useRarityUnlock = abilityEntry.getPropertyByName('use_rarity_unlock');

            if (useRarityUnlock) {

                let newAlienUnlocked = tryUnlockRandomAlien(entity);

                if (newAlienUnlocked) {

                    let emptySlot = findNearestEmptySlot(entity);

                    if (emptySlot) {

                        entity.persistentData[`alienevo.alien_${emptySlot.playlist}_${emptySlot.slot}`] = newAlienUnlocked;


                        entity.persistentData[CURRENT_PLAYLIST_KEY] = emptySlot.playlist;
                        entity.persistentData[CURRENT_ALIEN_SLOT_KEY] = emptySlot.slot;

                        palladium.setProperty(entity, omnitrixPropertyKey, newAlienUnlocked);
                        let transformSound = getTransformSound(abilityEntry, entity);
                        transformToAlien(entity, newAlienUnlocked, username, transformSound, abilityEntry);
                        return;
                    }
                }
            }
        }

        if (randomizeChance === 1) {

            let attempts = 0;
            let max_attempts = 50;
            let random_playlist = DEFAULT_PLAYLIST;
            let random_slot = DEFAULT_SLOT;

            while (alien_num <= 0 && attempts < max_attempts) {
                random_playlist = getRandomInt(1, MAX_PLAYLISTS);
                random_slot = getRandomInt(1, MAX_SLOTS);
                alien_num = entity.persistentData[`alienevo.alien_${random_playlist}_${random_slot}`] || 0;
                attempts++;
            }

            if (alien_num > 0) {
                entity.persistentData[CURRENT_PLAYLIST_KEY] = random_playlist;
                entity.persistentData[CURRENT_ALIEN_SLOT_KEY] = random_slot;

                palladium.setProperty(entity, omnitrixPropertyKey, alien_num);
                let transformSound = getTransformSound(abilityEntry, entity);
                transformToAlien(entity, alien_num, username, transformSound, abilityEntry);
                return;
            }
        }


        if (selectedAlienNum > 0) {
            palladium.setProperty(entity, omnitrixPropertyKey, selectedAlienNum);
            let transformSound = getTransformSound(abilityEntry, entity);
            transformToAlien(entity, selectedAlienNum, username, transformSound, abilityEntry);
        }
    }



    function getTransformSound(abilityEntry, entity) {
        let useMultipleSounds = abilityEntry.getPropertyByName('use_multiple_sounds');


        let hasMasterControl = entity && entity.tags && entity.tags.contains("AlienEvo.MasterControl");

        if (useMultipleSounds) {

            let primarySound = abilityEntry.getPropertyByName('transform_sound');
            let altSound1 = abilityEntry.getPropertyByName('alt_sound_1');
            let altSound2 = abilityEntry.getPropertyByName('alt_sound_2');


            if (hasMasterControl) {
                let soundChoice = getRandomInt(1, 3);

                switch (soundChoice) {
                    case 1:
                        return primarySound;
                    case 2:
                        return altSound1;
                    case 3:
                        return altSound2;
                    default:
                        return primarySound;
                }
            } else {

                let soundChoice = getRandomInt(1, 2);

                return soundChoice === 1 ? primarySound : altSound1;
            }
        } else {

            return abilityEntry.getPropertyByName('transform_sound');
        }
    }

    function transformToAlien(entity, alienNumber, username, transformSound, abilityEntry) {
        let alienInfo = global[`alienevo_alien_${alienNumber}`];
        if (!alienInfo) {
            return;
        }

        let alienFullName = alienInfo[0];
        let alienNamespace = 'alienevo_aliens';
        let alienPath = alienFullName;

        if (alienFullName.includes(':')) {
            let parts = alienFullName.split(':');
            alienNamespace = parts[0];
            alienPath = parts[1];
        }


        let foundPlaylist = -1;
        let foundSlot = -1;

        for (let playlist = 1; playlist <= MAX_PLAYLISTS; playlist++) {
            for (let slot = 1; slot <= MAX_SLOTS; slot++) {
                let alienInSlot = entity.persistentData[`alienevo.alien_${playlist}_${slot}`];
                if (alienInSlot === alienNumber) {
                    foundPlaylist = playlist;
                    foundSlot = slot;
                    break;
                }
            }
            if (foundPlaylist > 0) break;
        }


        if (foundPlaylist > 0 && foundSlot > 0) {
            entity.persistentData[CURRENT_PLAYLIST_KEY] = foundPlaylist;
            entity.persistentData[CURRENT_ALIEN_SLOT_KEY] = foundSlot;
        }


        let watchNamespace = palladium.getProperty(entity, 'watch_namespace');
        let watchName = palladium.getProperty(entity, 'watch');

        let watchTypePowerId = new ResourceLocation(watchNamespace, `${watchName}_omnitrix`);
        palladium.superpowers.removeSuperpower(entity, watchTypePowerId);


        let alienPowerId = new ResourceLocation(alienNamespace, alienPath);
        palladium.superpowers.addSuperpower(entity, alienPowerId);


        let bubbleNamespace = 'alienevo';
        let bubblePowerId = new ResourceLocation(bubbleNamespace, 'transform_bubble');
        palladium.superpowers.addSuperpower(entity, bubblePowerId);

        entity.level.playSound(
            null,
            entity.x,
            entity.y,
            entity.z,
            `alienevo:${transformSound}_transform`,
            entity.getSoundSource(),
            1.0,
            1.0
        );
    }
});