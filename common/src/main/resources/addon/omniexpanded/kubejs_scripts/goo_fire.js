const FIRE_SPREAD_PATTERNS = [
    {x: 1, y: 0, z: 0}, {x: -1, y: 0, z: 0},
    {x: 0, y: 0, z: 1}, {x: 0, y: 0, z: -1},
    {x: 1, y: 0, z: 1}, {x: -1, y: 0, z: 1},
    {x: 1, y: 0, z: -1}, {x: -1, y: 0, z: -1},
    {x: 0, y: 1, z: 0}, {x: 1, y: 1, z: 0},
    {x: -1, y: 1, z: 0}, {x: 0, y: 1, z: 1},
    {x: 0, y: 1, z: -1}
];

function isFireBlock(block) {
    return block && (block.id === 'minecraft:fire' || block.id === 'minecraft:soul_fire');
}

function checkForFireNearby(level, x, y, z, radius) {
    const radiusSquared = radius * radius;
    
    for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dz = -radius; dz <= radius; dz++) {
                if (dx*dx + dz*dz > radiusSquared) continue;
                
                try {
                    let block = level.getBlock(x + dx, y + dy, z + dz);
                    if (isFireBlock(block)) {
                        
                        return true;
                    }
                } catch (e) {
                    console.log(`Error checking block: ${e}`);
                }
            }
        }
    }
    return false;
}

StartupEvents.registry('palladium:abilities', (event) => {
    event.create('alienevo:goo_fire')
        .icon(palladium.createItemIcon('palladium:vibranium_circuit'))
        .tick((entity, entry, holder, enabled) => {
            if (!enabled) return;

            try {
                let level = entity.level;
                if (level.isClientSide()) return;

                if (entity.getTags().contains('extinguished'))
                    return;
                

                let pos = entity.blockPosition();
                let posX = pos.getX();
                let posY = pos.getY();
                let posZ = pos.getZ();

                let entityDimension = level.dimension;

                if (checkForFireNearby(level, posX, posY, posZ, 4.5)) {
                    let server = level.getServer();
                    let fireCount = 3 + Math.floor(Math.random() * 5); // 3 to 7 fires

                    for (let i = 0; i < fireCount; i++) {
                        let dx = Math.floor(Math.random() * 5) - 2;
                        let dy = Math.floor(Math.random() * 3) - 1;
                        let dz = Math.floor(Math.random() * 5) - 2;

                        let targetX = posX + dx;
                        let targetY = posY + dy;
                        let targetZ = posZ + dz;

                        let targetBlock = level.getBlock(targetX, targetY, targetZ);

                        if (targetBlock?.id === 'minecraft:air') {
                            server.runCommandSilent(
                                `execute in ${entityDimension} run setblock ${targetX} ${targetY} ${targetZ} minecraft:fire`
                            );
                        }
                    }

                    if (Math.random() > 0.5) {
                        let dx = Math.floor(Math.random() * 5) - 2;
                        let dz = Math.floor(Math.random() * 5) - 2;

                        let targetX = posX + dx;
                        let targetY = posY - 1;
                        let targetZ = posZ + dz;

                        let targetBlock = level.getBlock(targetX, targetY, targetZ);

                        if (targetBlock?.id === 'minecraft:air') {
                            server.runCommandSilent(
                                `execute in ${entityDimension} run setblock ${targetX} ${targetY} ${targetZ} minecraft:fire`
                            );
                        }
                    }
                }
            } catch (e) {
                console.log(`Error in goo_fire ability: ${e}`);
            }
        });
});

