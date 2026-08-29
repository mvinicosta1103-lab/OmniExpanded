ItemEvents.rightClicked('alienevo:code_tablet', event => {
    const player = event.player;
    const item = event.item;
    
    if (!item.hasNBT() && player.persistentData.masterTargetCode) {
        let masterCode = player.persistentData.masterTargetCode;
        
        if (!global.usedPositions) {
            global.usedPositions = new Set();
        }
        
        let availablePositions = [];
        for (let i = 0; i < 6; i++) {
            if (!global.usedPositions.has(i)) {
                availablePositions.push(i);
            }
        }
        
        if (availablePositions.length === 0) {
            global.usedPositions.clear();
            availablePositions = [0, 1, 2, 3, 4, 5];
        }
        
        let selectedPosition = availablePositions[Math.floor(Math.random() * availablePositions.length)];
        global.usedPositions.add(selectedPosition);
        
        let display = [];
        for(let i = 0; i < 6; i++) {
            if(i === selectedPosition) {
                display.push(`{"text":"${masterCode[i]}","color":"gold"}`);
            } else {
                display.push(`{"text":"§k0","color":"gold"}`);
            }
        }
        
        item.nbt = {
            used: true,
            position: selectedPosition,
            display: {
                Lore: [
                    '{"translate":"codehints.alienevo.master_control","color":"green","italic":false}',
                    `{"translate":"codehints.alienevo.code","color":"yellow","italic":false,"extra":[${display.join(',')}]}`
                ]
            }
        }; 
    }
});

ItemEvents.rightClicked('alienevo:code_tablet_selfdestruct', event => {
    const player = event.player;
    const item = event.item;
    
    if (!item.hasNBT() && player.persistentData.selfDestructTargetCode) {
        let selfDestructCode = player.persistentData.selfDestructTargetCode;
        
        if (!global.usedSelfDestructPositions) {
            global.usedSelfDestructPositions = new Set();
        }
        
        let availablePositions = [];
        for (let i = 0; i < 6; i++) {
            if (!global.usedSelfDestructPositions.has(i)) {
                availablePositions.push(i);
            }
        }
        
        if (availablePositions.length === 0) {
            global.usedSelfDestructPositions.clear();
            availablePositions = [0, 1, 2, 3, 4, 5];
        }
        
        let selectedPosition = availablePositions[Math.floor(Math.random() * availablePositions.length)];
        global.usedSelfDestructPositions.add(selectedPosition);
        
        let display = [];
        for(let i = 0; i < 6; i++) {
            if(i === selectedPosition) {
                display.push(`{"text":"${selfDestructCode[i]}","color":"red"}`);
            } else {
                display.push(`{"text":"§k0","color":"red"}`);
            }
        }
        
        item.nbt = {
            used: true,
            position: selectedPosition,
            display: {
                Lore: [
                    '{"translate":"codehints.alienevo.self_destruct","color":"dark_red","italic":false}',
                    `{"translate":"codehints.alienevo.code","color":"red","italic":false,"extra":[${display.join(',')}]}`
                ]
            }
        };
    }
});