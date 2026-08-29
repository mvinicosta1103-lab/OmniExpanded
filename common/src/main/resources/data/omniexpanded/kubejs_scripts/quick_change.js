ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Arguments } = event;
 
    const getPlayerAliensList = (context, builder) => {
        const player = context.source.player;
        if (!player) return builder.buildFuture();
 
        for (let p = 1; p <= 10; p++) {
            for (let s = 1; s <= 10; s++) {
                let key = `alienevo.alien_${p}_${s}`;
                let value = player.persistentData.get(key);
                
                if (value && value > 0) {
                    let alienKey = `alienevo_alien_${value}`;
                    if (global[alienKey]) {
                        let alienName = global[alienKey][0];
                        if (!alienName.includes(':')) {
                            alienName = `alienevo_aliens:${alienName}`;
                        }
                        builder.suggest(alienName);
                    }
                }
            }
        }
        return builder.buildFuture();
    };
 
    const getKeysList = (context, builder) => {
        builder.suggest("QUICKCHANGE01");
        builder.suggest("QUICKCHANGE02");
        builder.suggest("QUICKCHANGE03");
        builder.suggest("QUICKCHANGE04");
        builder.suggest("QUICKCHANGE05");
        builder.suggest("QUICKCHANGE06");
        builder.suggest("QUICKCHANGE07");
        builder.suggest("QUICKCHANGE08");
        builder.suggest("QUICKCHANGE09");
        builder.suggest("QUICKCHANGE10");
        return builder.buildFuture();
    };
 
    event.register(
        Commands.literal("bindtransform")
        .requires(src => src.hasPermission(0))
        .then(Commands.argument('alien', Arguments.RESOURCE_LOCATION.create(event))
            .suggests(getPlayerAliensList)
            .then(Commands.argument('key', Arguments.STRING.create(event))
                .suggests(getKeysList)
                .executes(ctx => {
                    const player = ctx.source.player;
                    const alienResource = Arguments.RESOURCE_LOCATION.getResult(ctx, "alien");
                    const alienName = alienResource.toString();
                    const keyName = Arguments.STRING.getResult(ctx, "key");
 
                    player.persistentData.putString(`alienevo.bound.${keyName}`, alienName);

                    ctx.source.sendSuccess(Text.of(`Bound ${alienName} to ${keyName}`), true);
                    return 1;
                })
            )
        )
    );
});

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

function retrievePlayerArmor(player) {
    if (!player.persistentData.getBoolean('hasStoredArmor')) {
        return false;
    }
    
    let armorSlots = ['head', 'chest', 'legs', 'feet'];
    
    armorSlots.forEach(slot => {
        if (player.persistentData.contains(slot + 'ArmorStore')) {
            let storedArmor = player.persistentData.get(slot + 'ArmorStore');
            
            let nbtString = '';
            if (storedArmor.tag) {
                nbtString = storedArmor.tag.toString();
            }
            
            let command = `item replace entity ${player.getGameProfile().getName()} armor.${slot} with ${storedArmor.id}${nbtString}`;
            player.server.runCommandSilent(command);
            player.persistentData.remove(slot + 'ArmorStore');
        }
    });
    
    player.persistentData.remove('hasStoredArmor');
    return true;
}
NetworkEvents.dataReceived('quickchange_key_pressed', event => {
    let player = event.player;
    let keyName = event.data.keyName;
    
    const OMNITRIX_PROPERTY_KEY = 'omnitrix_cycle';
    const CURRENT_PLAYLIST_KEY = 'current_playlist';
    const CURRENT_ALIEN_SLOT_KEY = 'current_alien_slot';
    const MAX_SLOTS = 10;

    if (!player || player.type != 'minecraft:player') {
        return;
    }
    
    if (!player.tags.contains("AlienEvo.MasterControl")) {
        return;
    }
    
    let alienFullName = player.persistentData.getString(`alienevo.bound.${keyName}`);
    if (!alienFullName) {
        return;
    }

    let alienNamespace = 'alienevo_aliens';
    let alienPath = alienFullName;

    if (alienFullName.includes(':')) {
        let nameParts = alienFullName.split(':');
        alienNamespace = nameParts[0];
        alienPath = nameParts[1];
    }
    
    let hasAlienInPlaylist = false;
    let alienNumber = -1;

    for (let i = 1; i <= 300; i++) {
        if (global[`alienevo_alien_${i}`]) {
            let globalAlienName = global[`alienevo_alien_${i}`][0];

            if (globalAlienName.toLowerCase() === alienFullName.toLowerCase() || 
                (alienFullName.includes(':') && globalAlienName.toLowerCase() === alienPath.toLowerCase())) {
                alienNumber = i;
                break;
            }
        }
    }

    if (alienNumber === -1) {
        return;
    }

    let foundPlaylist = -1;
    let foundSlot = -1;
    
    for (let playlist = 1; playlist <= 10; playlist++) {
        for (let slot = 1; slot <= 10; slot++) {
            let alienInSlot = player.persistentData.getInt(`alienevo.alien_${playlist}_${slot}`);
            if (alienInSlot === alienNumber) {
                hasAlienInPlaylist = true;
                foundPlaylist = playlist;
                foundSlot = slot;
                break;
            }
        }
        if (hasAlienInPlaylist) break;
    }

    if (!hasAlienInPlaylist) {
        return;
    }
    
    try {
        player.persistentData.putInt('alien_transition_lock', 1);

        let currentAlienNumber = palladium.getProperty(player, OMNITRIX_PROPERTY_KEY);

        let watchType = palladium.getProperty(player, 'watch') || "prototype";

        let watchNamespace = palladium.getProperty(player, 'watch_namespace');

        if (!watchNamespace) {
            watchNamespace = "alienevo";
        }

        let useTimeoutBubble = palladium.getProperty(player, 'use_timeout_bubble');

        let targetAlienPowerID = `${alienNamespace}:${alienPath}`;

        if (player.persistentData.getInt('alien_transition_lock') > 1) {
            player.persistentData.putInt('alien_transition_lock', 0);
            return;
        }

        let allPowerIds = [];
        try {
            allPowerIds = palladium.powers.getPowerIds(player);
        } catch (e) {}

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
                    (currentAlienNamespace !== 'alienevo_aliens' && powerStr.startsWith('alienevo_aliens:')) ||
                    (alienNamespace !== currentAlienNamespace && alienNamespace !== 'alienevo_aliens' && powerStr.startsWith(`${alienNamespace}:`))) {
                    palladium.superpowers.removeSuperpower(player, powerId);
                }
            }

            if (hasBubble) {
                palladium.superpowers.removeSuperpower(player, new ResourceLocation("alienevo:transform_bubble"));
                palladium.superpowers.removeSuperpower(player, new ResourceLocation("alienevo:transform_bubble_tout"));
            }

            palladium.setProperty(player, OMNITRIX_PROPERTY_KEY, 0);

            palladium.superpowers.addSuperpower(player, new ResourceLocation(`${watchNamespace}:${watchType}_omnitrix`));

            if (alienNumber === -1) {
                retrievePlayerArmor(player);
            }
        }

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
        } catch (e) {}

        if (!isAlreadyTransformed) {
            storePlayerArmor(player);
        }

        palladium.setProperty(player, OMNITRIX_PROPERTY_KEY, alienNumber);

        if (foundPlaylist > 0 && foundSlot > 0) {
            player.persistentData.putInt(CURRENT_PLAYLIST_KEY, foundPlaylist);
            player.persistentData.putInt(CURRENT_ALIEN_SLOT_KEY, foundSlot);

            updateAllSlotProperties(player, foundPlaylist);
        }
        
        player.persistentData.putInt('alien_transition_lock', 2);

        let omnitrixResourceLocation = new ResourceLocation(`${watchNamespace}:${watchType}_omnitrix`);
        palladium.superpowers.removeSuperpower(player, omnitrixResourceLocation);

        palladium.superpowers.addSuperpower(player, new ResourceLocation(`${alienNamespace}:${alienPath}`));

        if (!hasTargetAlienPower) {
            player.runCommandSilent(`playsound alienevo:${watchType}_transform player @a[distance=..5] ~ ~ ~ 1 1 1`);
            palladium.superpowers.addSuperpower(player, new ResourceLocation("alienevo:transform_bubble"));
        }

        player.persistentData.putInt('alien_transition_lock', 0);
    } catch (e) {
        player.persistentData.putInt('alien_transition_lock', 0);
    }
});

function updateAllSlotProperties(entity, playlist) {
    const MAX_SLOTS = 10;
    for (let slot = 1; slot <= MAX_SLOTS; slot++) {
        let alienType = entity.persistentData.getInt(`alienevo.alien_${playlist}_${slot}`) || 0;
        palladium.setProperty(entity, `alien_evo_slot_${slot}`, alienType);
    }
}


NetworkEvents.dataReceived('quickchange_wheel_pressed', event => {
    const player = event.player;

    if (player.tags.contains("AlienEvo.RemovedCore")) return;

    let hasMasterControl = player.tags.contains("AlienEvo.MasterControl");

    if (!hasMasterControl) {
        if (!abilityUtil.hasPower(player, "alienevo:quick_change")) return;

        let currentAlienNumber = palladium.getProperty(player, 'omnitrix_cycle');
        if (!currentAlienNumber || currentAlienNumber <= 0) return;
        
        let alienInfo = global[`alienevo_alien_${currentAlienNumber}`];
        if (!alienInfo) return;
        
        let alienFullName = alienInfo[0];
        let alienNamespace = 'alienevo_aliens';
        let alienPath = alienFullName;
        
        if (alienFullName.includes(':')) {
            const parts = alienFullName.split(':');
            alienNamespace = parts[0];
            alienPath = parts[1];
        }
        
        const powerName = `${alienNamespace}:${alienPath}`;

        if (!abilityUtil.hasPower(player, powerName)) return;
    }

    const currentValue = palladium.getProperty(player, 'quick_change_wheel');
    const newValue = currentValue === "enabled" ? "disabled" : "enabled";
    palladium.setProperty(player, 'quick_change_wheel', newValue);
});