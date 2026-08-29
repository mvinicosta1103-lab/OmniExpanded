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

    event.create('alienevo:omnitrix_transform_slot')
        .icon(palladium.createItemIcon('minecraft:blaze_rod'))
        .addProperty("property", "string", OMNITRIX_PROPERTY_KEY, "Internal property key for the Omnitrix cycle")
        .addProperty("target_slot", "integer", 0, "Specific slot to transform into (0 = current slot, 1-10 = specific slot)")
        .addProperty("remove_alien", "boolean", false, "Whether to remove the current alien instead of transforming")
        .lastTick((entity, abilityEntry, abilityHolder, isEnabled) => {
            if (!isEnabled || !entity) return;

            let username = entity.getGameProfile().getName();
            let hasMasterControl = entity.tags.contains("AlienEvo.MasterControl");
            let targetSlot = abilityEntry.getPropertyByName('target_slot');
            let removeAlien = abilityEntry.getPropertyByName('remove_alien');
            let propertyKey = abilityEntry.getPropertyByName('property');

            try {
                if (removeAlien) {
                    entity.persistentData.putInt('alien_transition_lock', 1);

                    let currentAlienNumber = palladium.getProperty(entity, propertyKey);
                    let watchType = palladium.getProperty(entity, 'watch') || "prototype";
                    let watchNamespace = palladium.getProperty(entity, 'watch_namespace');

                    if (!watchNamespace) {
                        watchNamespace = "alienevo";
                    }

                    if (entity.persistentData.getInt('alien_transition_lock') > 1) {
                        entity.persistentData.putInt('alien_transition_lock', 0);
                        return;
                    }

                    let allPowerIds = [];
                    try {
                        allPowerIds = palladium.powers.getPowerIds(entity);
                    } catch (e) { }

                    let hasBubble = allPowerIds.some(id => id.toString() === "alienevo:transform_bubble");

                    if (hasBubble || currentAlienNumber > 0) {
                        let currentAlienNamespace = 'alienevo_aliens';

                        if (currentAlienNumber > 0) {
                            let currentAlienInfo = global[`alienevo_alien_${currentAlienNumber}`];
                            if (currentAlienInfo) {
                                let currentAlienFullName = currentAlienInfo[0];

                                if (currentAlienFullName.includes(':')) {
                                    let parts = currentAlienFullName.split(':');
                                    currentAlienNamespace = parts[0];
                                }
                            }
                        }

                        for (let powerId of allPowerIds) {
                            let powerStr = powerId.toString();
                            if (powerStr.startsWith(`${currentAlienNamespace}:`) ||
                                (currentAlienNamespace !== 'alienevo_aliens' && powerStr.startsWith('alienevo_aliens:'))) {
                                palladium.superpowers.removeSuperpower(entity, powerId);
                            }
                        }

                        if (hasBubble) {
                            palladium.superpowers.removeSuperpower(entity, new ResourceLocation("alienevo:transform_bubble"));
                            palladium.superpowers.removeSuperpower(entity, new ResourceLocation("alienevo:transform_bubble_tout"));
                        }

                        palladium.setProperty(entity, propertyKey, 0);
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
                    }

                    entity.persistentData.putInt('alien_transition_lock', 0);
                    return;
                }

                if (targetSlot === 0) {
                    if (hasMasterControl) {
                        transformNormal(entity, abilityEntry, username);
                    } else {
                        transformRandom(entity, abilityEntry, username);
                    }
                } else {
                    transformToSlot(entity, abilityEntry, username, targetSlot);
                }
            } catch (e) {
                entity.persistentData.putInt('alien_transition_lock', 0);
            }
        });

    function isPlayerTransformed(entity) {
        let currentAlienNumber = palladium.getProperty(entity, 'omnitrix_cycle');

        if (!currentAlienNumber || currentAlienNumber <= 0) {
            return false;
        }

        let alienInfo = global[`alienevo_alien_${currentAlienNumber}`];
        if (!alienInfo) return false;

        let alienFullName = alienInfo[0];
        let alienNamespace = 'alienevo_aliens';
        let alienPath = alienFullName;

        if (alienFullName.includes(':')) {
            const parts = alienFullName.split(':');
            alienNamespace = parts[0];
            alienPath = parts[1];
        }

        const powerName = `${alienNamespace}:${alienPath}`;

        return abilityUtil.hasPower(entity, powerName);
    }

    function transformToSlot(entity, abilityEntry, username, targetSlot) {
        let omnitrixPropertyKey = abilityEntry.getPropertyByName('property');
        let hasMasterControl = entity.tags.contains("AlienEvo.MasterControl");

        let currentScore = 0;
        try {
            currentScore = palladium.scoreboard.getScore(entity, "AlienEvo.Timer");
        } catch (e) { }

        if (currentScore >= 5500 && !hasMasterControl) {
            entity.tell("§c[Omnitrix] §fNot enough charge for transformation. Recharge required.");
            return;
        }

        let currentPlaylist = entity.persistentData[CURRENT_PLAYLIST_KEY] || DEFAULT_PLAYLIST;
        let useSlot = Math.max(1, Math.min(MAX_SLOTS, targetSlot));
        let alienNumber = entity.persistentData[`alienevo.alien_${currentPlaylist}_${useSlot}`];
        let currentAlienNumber = palladium.getProperty(entity, omnitrixPropertyKey) || 0;
        let isTransformed = isPlayerTransformed(entity);

        if (isTransformed && alienNumber === currentAlienNumber) {
            entity.tell("§e[Omnitrix] §fAlready transformed into this alien.");
            palladium.setProperty(entity, 'quick_change_wheel', "disabled");
            return;
        }

        if (alienNumber && alienNumber >= 1) {
            entity.persistentData[CURRENT_ALIEN_SLOT_KEY] = useSlot;

            if (!isTransformed) {
                storePlayerArmor(entity);
            }

            if (!hasMasterControl) {
                try {
                    palladium.scoreboard.addScore(entity, "AlienEvo.Timer", 500);
                } catch (e) { }

                let chance = getRandomInt(1, 100);
                if (chance <= 20) {
                    transformRandom(entity, abilityEntry, username);
                    return;
                }
            }

            palladium.setProperty(entity, omnitrixPropertyKey, alienNumber);
            transformToAlien(entity, alienNumber, username, abilityEntry);
            updateAllSlotProperties(entity, currentPlaylist);
        } else {
            entity.tell("§c[Omnitrix] §fNo alien DNA detected in the selected slot.");
            palladium.setProperty(entity, 'quick_change_wheel', "disabled");
        }
    }

    function storePlayerArmor(player) {
        let armorSlots = ['head', 'chest', 'legs', 'feet'];

        let hasAnyArmor = armorSlots.some(slot => {
            let armorItem = player[slot + 'ArmorItem'];
            return armorItem && armorItem.id !== 'minecraft:air';
        });

        if (hasAnyArmor) {
            let hasStoredArmor = false;

            armorSlots.forEach(slot => {
                let armorItem = player[slot + 'ArmorItem'];
                if (armorItem && armorItem.id !== 'minecraft:air') {
                    hasStoredArmor = true;
                    player.persistentData.put(slot + 'ArmorStore', armorItem);
                    player.server.runCommandSilent(`item replace entity ${player.getGameProfile().getName()} armor.${slot} with air`);
                }
            });

            if (hasStoredArmor) {
                player.persistentData.putBoolean('hasStoredArmor', true);
            }
            return hasStoredArmor;
        }

        return false;
    }

    function transformRandom(entity, abilityEntry, username) {
        let omnitrixPropertyKey = abilityEntry.getPropertyByName('property');

        let current_playlist = entity.persistentData[CURRENT_PLAYLIST_KEY] || DEFAULT_PLAYLIST;
        let current_slot = entity.persistentData[CURRENT_ALIEN_SLOT_KEY] || DEFAULT_SLOT;
        let selectedAlienNum = entity.persistentData[`alienevo.alien_${current_playlist}_${current_slot}`] || 0;

        let chance = getRandomInt(1, 100);

        if (chance <= 20) {
            let alien_num = 0;
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
                transformToAlien(entity, alien_num, username, abilityEntry);
            } else {
                if (selectedAlienNum > 0) {
                    palladium.setProperty(entity, omnitrixPropertyKey, selectedAlienNum);
                    transformToAlien(entity, selectedAlienNum, username, abilityEntry);
                }
            }
        } else {
            if (selectedAlienNum > 0) {
                palladium.setProperty(entity, omnitrixPropertyKey, selectedAlienNum);
                transformToAlien(entity, selectedAlienNum, username, abilityEntry);
            }
        }
    }

    function transformToAlien(entity, alienNumber, username, abilityEntry) {
        try {
            entity.persistentData.putInt('alien_transition_lock', 1);

            let propertyKey = abilityEntry.getPropertyByName('property');
            let currentAlienNumber = palladium.getProperty(entity, propertyKey);

            let alienInfo = global[`alienevo_alien_${alienNumber}`];
            if (!alienInfo) {
                entity.persistentData.putInt('alien_transition_lock', 0);
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

            let targetAlienPowerID = `${alienNamespace}:${alienPath}`;

            if (entity.persistentData.getInt('alien_transition_lock') > 1) {
                entity.persistentData.putInt('alien_transition_lock', 0);
                return;
            }

            let allPowerIds = [];
            try {
                allPowerIds = palladium.powers.getPowerIds(entity);
            } catch (e) { }

            let hasBubble = allPowerIds.some(id => id.toString() === "alienevo:transform_bubble");

            let isAlreadyTransformed = false;
            let hasTargetAlienPower = false;

            try {
                hasTargetAlienPower = allPowerIds.some(id => {
                    return id.toString() === targetAlienPowerID;
                });

                isAlreadyTransformed = allPowerIds.some(id => {
                    let powerStr = id.toString();
                    return powerStr.startsWith("alienevo_aliens:") ||
                        (alienNamespace !== 'alienevo_aliens' && powerStr.startsWith(`${alienNamespace}:`));
                });
            } catch (e) { }

            if (hasBubble || currentAlienNumber > 0) {
                let currentAlienNamespace = 'alienevo_aliens';

                if (currentAlienNumber > 0) {
                    let currentAlienInfo = global[`alienevo_alien_${currentAlienNumber}`];
                    if (currentAlienInfo) {
                        let currentAlienFullName = currentAlienInfo[0];

                        if (currentAlienFullName.includes(':')) {
                            let parts = currentAlienFullName.split(':');
                            currentAlienNamespace = parts[0];
                        }
                    }
                }

                // FIXED: Build a set of known alien namespaces only
                let alienNamespaces = new Set();
                alienNamespaces.add('alienevo_aliens');
                alienNamespaces.add(currentAlienNamespace);
                alienNamespaces.add(alienNamespace);

                for (let playlist = 1; playlist <= MAX_PLAYLISTS; playlist++) {
                    for (let slot = 1; slot <= MAX_SLOTS; slot++) {
                        let alienNum = entity.persistentData.getInt(`alienevo.alien_${playlist}_${slot}`);
                        if (alienNum > 0) {
                            let alienInfo = global[`alienevo_alien_${alienNum}`];
                            if (alienInfo) {
                                let alienFullName = alienInfo[0];
                                if (alienFullName.includes(':')) {
                                    let parts = alienFullName.split(':');
                                    alienNamespaces.add(parts[0]);
                                }
                            }
                        }
                    }
                }

                for (let powerId of allPowerIds) {
                    let powerStr = powerId.toString();
                    let shouldRemove = false;

                    for (let alienNs of alienNamespaces) {
                        if (powerStr.startsWith(`${alienNs}:`)) {
                            shouldRemove = true;
                            break;
                        }
                    }

                    if (shouldRemove) {
                        palladium.superpowers.removeSuperpower(entity, powerId);
                    }
                }

            }

            if (hasBubble) {
                palladium.superpowers.removeSuperpower(entity, new ResourceLocation("alienevo:transform_bubble"));
                palladium.superpowers.removeSuperpower(entity, new ResourceLocation("alienevo:transform_bubble_tout"));
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
                entity.persistentData.putInt(CURRENT_PLAYLIST_KEY, foundPlaylist);
                entity.persistentData.putInt(CURRENT_ALIEN_SLOT_KEY, foundSlot);
            }

            palladium.setProperty(entity, propertyKey, alienNumber);

            let watchType = palladium.getProperty(entity, 'watch') || 'prototype';
            let watchNamespace = palladium.getProperty(entity, 'watch_namespace');

            if (!watchNamespace) {
                watchNamespace = "alienevo";
            }

            let omnitrixResourceLocation = new ResourceLocation(`${watchNamespace}:${watchType}_omnitrix`);
            palladium.superpowers.removeSuperpower(entity, omnitrixResourceLocation);

            let alienPowerId = new ResourceLocation(alienNamespace, alienPath);
            palladium.superpowers.addSuperpower(entity, alienPowerId);

            if (!hasTargetAlienPower) {
                palladium.setProperty(entity, 'quick_change_wheel', "disabled");
                entity.level.playSound(
                    null,
                    entity.x,
                    entity.y,
                    entity.z,
                    `alienevo:${watchType}_transform`,
                    entity.getSoundSource(),
                    1.0,
                    1.0
                );
                palladium.superpowers.addSuperpower(entity, new ResourceLocation("alienevo:transform_bubble"));
            }
        } catch (e) {
        }
    }
});