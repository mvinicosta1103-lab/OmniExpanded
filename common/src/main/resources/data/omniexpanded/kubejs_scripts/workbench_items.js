ItemEvents.entityInteracted(event => {
    let username = event.player.getGameProfile().getName();
    
    if (event.target.type != 'minecraft:interaction') {
        return;
    }
    
    let colorType;
    if (event.target.getTags().contains('baseprimary_interaction')) {
        colorType = {
            tag: 'baseprimary_interaction',
            scoreboardObjective: 'AlienEvo.BasePrimary',
            logName: 'BasePrimary'
        };
    } else if (event.target.getTags().contains('basesecondary_interaction')) {
        colorType = {
            tag: 'basesecondary_interaction',
            scoreboardObjective: 'AlienEvo.BaseSecondary',
            logName: 'BaseSecondary'
        };
    } else if (event.target.getTags().contains('basetertiary_interaction')) {
        colorType = {
            tag: 'basetertiary_interaction',
            scoreboardObjective: 'AlienEvo.BaseTertiary',
            logName: 'BaseTertiary'
        };
    } else if (event.target.getTags().contains('coretop_interaction')) {
        colorType = {
            tag: 'coretop_interaction',
            scoreboardObjective: 'AlienEvo.CoreTop',
            logName: 'CoreTop'
        };
    } else if (event.target.getTags().contains('coreside_interaction')) {
        colorType = {
            tag: 'coreside_interaction',
            scoreboardObjective: 'AlienEvo.CoreSide',
            logName: 'CoreSide'
        };
    } else if (event.target.getTags().contains('tubes_interaction')) {
        colorType = {
            tag: 'tubes_interaction',
            scoreboardObjective: 'AlienEvo.Tubes',
            logName: 'Tubes'
        };
    } else if (event.target.getTags().contains('dialinner_interaction')) {
        colorType = {
            tag: 'dialinner_interaction',
            scoreboardObjective: 'AlienEvo.DialInner',
            logName: 'DialInner'
        };
    } else if (event.target.getTags().contains('dialouter_interaction')) {
        colorType = {
            tag: 'dialouter_interaction',
            scoreboardObjective: 'AlienEvo.DialOuter',
            logName: 'DialOuter'
        };
    } else if (event.target.getTags().contains('buttons_interaction')) {
        colorType = {
            tag: 'buttons_interaction',
            scoreboardObjective: 'AlienEvo.Buttons',
            logName: 'Buttons'
        };
    } else {
        return;
    }
    
    let x = Math.floor(event.target.x);
    let y = Math.floor(event.target.y);
    let z = Math.floor(event.target.z);
    
    let hasWorkbenchPower = event.server.runCommandSilent(
        `execute as ${username} positioned ${x} ${y} ${z} if entity @e[type=armor_stand,tag=workbench_stand,distance=0..1,sort=nearest,limit=1,palladium.power=alienevo:omnitrix_workbench]`
    );
    
    if (!hasWorkbenchPower) {
        return;
    }

    const ITEM_SCORES = {
        'alienevo:upgrade_crystal': 0,
        'alienevo:upgrade_crystal_white': 1,
        'alienevo:upgrade_crystal_light_gray': 2,
        'alienevo:upgrade_crystal_gray': 3,
        'alienevo:upgrade_crystal_black': 4,
        'alienevo:upgrade_crystal_brown': 5,
        'alienevo:upgrade_crystal_red': 6,
        'alienevo:upgrade_crystal_orange': 7,
        'alienevo:upgrade_crystal_yellow': 8,
        'alienevo:upgrade_crystal_green': 9,
        'alienevo:upgrade_crystal_cyan': 10,
        'alienevo:upgrade_crystal_light_blue': 11,
        'alienevo:upgrade_crystal_blue': 12,
        'alienevo:upgrade_crystal_purple': 13,
        'alienevo:upgrade_crystal_magenta': 14,
        'alienevo:upgrade_crystal_pink': 15,

        'minecraft:amethyst_shard': 16,
        'minecraft:copper_ingot': 17,
        'minecraft:diamond': 18,
        'minecraft:emerald': 19,
        'minecraft:gold_ingot': 20,
        'minecraft:iron_ingot': 21,
        'minecraft:lapis_lazuli': 22,
        'minecraft:netherite_ingot': 23,
        'minecraft:quartz': 24,
        'minecraft:redstone': 25
    };
    
    const SCORE_TO_ITEM = {
        0: 'alienevo:upgrade_crystal',
        1: 'alienevo:upgrade_crystal_white',
        2: 'alienevo:upgrade_crystal_light_gray',
        3: 'alienevo:upgrade_crystal_gray',
        4: 'alienevo:upgrade_crystal_black',
        5: 'alienevo:upgrade_crystal_brown',
        6: 'alienevo:upgrade_crystal_red',
        7: 'alienevo:upgrade_crystal_orange',
        8: 'alienevo:upgrade_crystal_yellow',
        9: 'alienevo:upgrade_crystal_green',
        10: 'alienevo:upgrade_crystal_cyan',
        11: 'alienevo:upgrade_crystal_light_blue',
        12: 'alienevo:upgrade_crystal_blue',
        13: 'alienevo:upgrade_crystal_purple',
        14: 'alienevo:upgrade_crystal_magenta',
        15: 'alienevo:upgrade_crystal_pink',
        16: 'minecraft:amethyst_shard',
        17: 'minecraft:copper_ingot',
        18: 'minecraft:diamond',
        19: 'minecraft:emerald',
        20: 'minecraft:gold_ingot',
        21: 'minecraft:iron_ingot',
        22: 'minecraft:lapis_lazuli',
        23: 'minecraft:netherite_ingot',
        24: 'minecraft:quartz',
        25: 'minecraft:redstone'
    };
    
    let mainHandItem = event.player.getMainHandItem();
    
    let cmd = `scoreboard players get @e[type=armor_stand,tag=workbench_stand,distance=0..1.1,sort=nearest,limit=1] ${colorType.scoreboardObjective}`;
    let currentScore = event.server.runCommandSilent(`execute positioned ${x} ${y} ${z} run ${cmd}`);
    let scoreValue = parseInt(currentScore);

    if (mainHandItem.id === 'minecraft:air') {
        if (!isNaN(scoreValue) && scoreValue !== -1) {
            let itemToReturn = SCORE_TO_ITEM[scoreValue];
            if (itemToReturn) {
                event.player.give(Item.of(itemToReturn));
                
                let resetCommand = `execute as ${username} positioned ${x} ${y} ${z} run scoreboard players set @e[type=armor_stand,tag=workbench_stand,sort=nearest,limit=1] ${colorType.scoreboardObjective} -1`;
                event.server.runCommandSilent(resetCommand);
            }
        }
        event.cancel();
        return;
    }
    
    if (!ITEM_SCORES.hasOwnProperty(mainHandItem.id)) {
        return;
    }
    
    let targetScore = ITEM_SCORES[mainHandItem.id];
    
    if (!isNaN(scoreValue) && scoreValue !== -1) {
        if (scoreValue === targetScore) {
            return;
        }
        
        let previousItemId = SCORE_TO_ITEM[scoreValue];
        if (previousItemId) {
            event.player.give(Item.of(previousItemId));
        }
    }
    
    let setScoreCommand = `execute as ${username} positioned ${x} ${y} ${z} run scoreboard players set @e[type=armor_stand,tag=workbench_stand,sort=nearest,limit=1] ${colorType.scoreboardObjective} ${targetScore}`;
    event.server.runCommandSilent(setScoreCommand);
    
    event.server.runCommandSilent(`execute positioned ${x} ${y} ${z} run playsound minecraft:entity.item_frame.add_item master @a[distance=..10] ~ ~ ~ 1 1`);
    
    mainHandItem.count--;
    
    event.cancel();
});