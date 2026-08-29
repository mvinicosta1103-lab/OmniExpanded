const ClipContextR = Java.loadClass("net.minecraft.world.level.ClipContext")

function calculateViewVector(xRot, yRot) {
    let f = xRot * JavaMath.PI / 180.0;
    let f1 = -yRot * JavaMath.PI / 180.0;
    let f2 = JavaMath.cos(f1);
    let f3 = JavaMath.sin(f1);
    let f4 = JavaMath.cos(f);
    let f5 = JavaMath.sin(f);
    return new Vec3(f3 * f4, -f5, f2 * f4);
}

function rayTrace(entity, distance, yOffset) {
    let feetPos = entity.position().add(0, yOffset, 0);
    let viewVec = entity.motionDirection.normal;

    let endVec = feetPos.add(viewVec.x * distance, viewVec.y * distance, viewVec.z * distance);
    return entity.level.clip(new ClipContextR(feetPos, endVec, "outline", "none", entity));
}

function checkTwoBlocksInFront(entity, level) {
    let lowerBlock = rayTrace(entity, 1, 0);
    let upperBlock = rayTrace(entity, 1, 1);

    if (lowerBlock.type !== "miss" && upperBlock.type !== "miss") {
        let lowerPos = new BlockPos(lowerBlock.blockPos);
        let upperPos = new BlockPos(upperBlock.blockPos);
        let lowerState = level.getBlock(lowerPos).blockState;
        let upperState = level.getBlock(upperPos).blockState;

        return lowerState.isCollisionShapeFullBlock(level, lowerPos) &&
            upperState.isCollisionShapeFullBlock(level, upperPos);
    }

    return false;
}

function checkOneBlockInFront(entity, level) {
    let block = rayTrace(entity, 1, 0);

    if (block.type !== "miss") {
        let pos = new BlockPos(block.blockPos);
        let state = level.getBlock(pos).blockState;
        return state.isCollisionShapeFullBlock(level, pos);
    }

    return false;
}

(function () {
    let ClientboundSetEntityMotionPacket = Java.loadClass('net.minecraft.network.protocol.game.ClientboundSetEntityMotionPacket');
    StartupEvents.registry('palladium:abilities', (event) => {
        event.create('alienevo:wall_run')
            .documentationDescription('Allows you to run on walls, including moving up and down.')
            .addProperty('run_speed', 'float', 0.1, 'Wall running speed.')
            .addProperty("data_name", "string", "wall_run", "Persistent data used")
            .firstTick((entity, entry, holder, enabled) => {
                if (enabled) {
                }
            })
            .lastTick((entity, entry, holder, enabled) => {
                if (enabled) {
                    let data_name = entry.getPropertyByName('data_name');
                    entity.persistentData[data_name] = 0;
                }
            })
            .tick((entity, entry, holder, enabled) => {
                if (enabled) {
                    let run_speed = entry.getPropertyByName('run_speed');
                    let data_name = entry.getPropertyByName('data_name');
                    let head_rotation = entity.pitch
                    let level = entity.serverLevel()
                    let isWallRunning = entity.persistentData[data_name] !== 0;

                    if (!isWallRunning && !checkTwoBlocksInFront(entity, level)) {
                        entity.persistentData[data_name] = 0;
                        return;
                    }

                    if (isWallRunning && !checkOneBlockInFront(entity, level)) {
                        entity.persistentData[data_name] = 0;
                        return;
                    }

                    entity.persistentData[data_name] = 1;

                    if (head_rotation <= -70 && head_rotation >= -90) {
                        entity.persistentData[data_name] = 2;
                        entity.setMotion(0, run_speed, 0);
                    } else if (head_rotation >= 70 && head_rotation <= 90) {
                        entity.persistentData[data_name] = 3;
                        entity.setMotion(0, -run_speed, 0);
                    }

                    entity.connection.send(new ClientboundSetEntityMotionPacket(entity));
                }
            })
    });
})();

function containsTag(tags, tag) {
    for (let i = 0; i < tags.length; i++) {
        if (tags[i].equals(tag)) {
            return true;
        }
    }
    return false;
}