const gravityAttribute = "forge:entity_gravity";

const DustParticleOptions = Java.loadClass('net.minecraft.core.particles.DustParticleOptions');
const Vec3f = Java.loadClass('org.joml.Vector3f');

const hexToRgb = (hex) => {
    hex = hex.toString().replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return new Vec3f(r / 255, g / 255, b / 255);
};

const isAtLeast10BlocksAboveGround = (player) => {
    const level = player.level;
    const playerPos = player.blockPosition();

    for (let i = 1; i <= 10; i++) {
        const checkPos = playerPos.below(i);
        const blockBelow = level.getBlockState(checkPos);

        if (!blockBelow.isAir()) {
            return false;
        }
    }

    return true;
};

const createBlockWave = (player, radius, enableVisuals, isDestructionEnabled) => {
    if (radius === undefined) radius = 5.0;
    if (enableVisuals === undefined) enableVisuals = true;
    if (isDestructionEnabled === undefined) isDestructionEnabled = true;

    if (!enableVisuals) return;

    var footX = Math.floor(player.x);
    var footY = Math.floor(player.y) - 1;
    var footZ = Math.floor(player.z);
    var playerY = Math.floor(player.y);

    for (var x = -radius; x <= radius; x++) {
        for (var z = -radius; z <= radius; z++) {
            if (x === 0 && z === 0) {
                continue;
            }

            var distance = Math.sqrt(x * x + z * z);
            if (distance <= radius) {
                var delay = Math.floor(radius - distance);
                var blockX_sched = footX + x;
                var blockZ_sched = footZ + z;
                var currentDistance_sched = distance;
                var current_x = x;
                var current_z = z;

                player.server.schedule(delay, () => {
                    var block = player.level.getBlock(blockX_sched, footY, blockZ_sched);
                    var blockId = block.getId();

                    if (blockId === "minecraft:air") return;

                    let isIndestructible = false;
                    let isSolid = false;
                    let isStorageBlock = false;

                    try {
                        let pos = BlockPos(blockX_sched, footY, blockZ_sched);
                        isSolid = !block.blockState.getCollisionShape(player.level, pos).isEmpty();

                        let blockType = Block.getBlock(blockId);
                        if (blockType && blockType.defaultDestroyTime() < 0) {
                            isIndestructible = true;
                        }

                        let storageBlockIds = [
                            'minecraft:chest',
                            'minecraft:trapped_chest',
                            'minecraft:ender_chest',
                            'minecraft:shulker_box',
                            'minecraft:white_shulker_box',
                            'minecraft:orange_shulker_box',
                            'minecraft:magenta_shulker_box',
                            'minecraft:light_blue_shulker_box',
                            'minecraft:yellow_shulker_box',
                            'minecraft:lime_shulker_box',
                            'minecraft:pink_shulker_box',
                            'minecraft:gray_shulker_box',
                            'minecraft:light_gray_shulker_box',
                            'minecraft:cyan_shulker_box',
                            'minecraft:purple_shulker_box',
                            'minecraft:blue_shulker_box',
                            'minecraft:brown_shulker_box',
                            'minecraft:green_shulker_box',
                            'minecraft:red_shulker_box',
                            'minecraft:black_shulker_box',
                            'minecraft:barrel',
                            'minecraft:furnace',
                            'minecraft:blast_furnace',
                            'minecraft:smoker',
                            'minecraft:dropper',
                            'minecraft:dispenser',
                            'minecraft:hopper',
                            'minecraft:brewing_stand',
                            'minecraft:beacon',
                            'minecraft:lectern',
                            'minecraft:bookshelf',
                            'minecraft:chiseled_bookshelf',
                            'minecraft:jukebox',
                            'minecraft:flower_pot',
                            'minecraft:item_frame',
                            'minecraft:glow_item_frame',
                            'minecraft:armor_stand'
                        ];

                        if (storageBlockIds.includes(blockId)) {
                            isStorageBlock = true;
                        }

                        if (blockId.includes('chest') ||
                            blockId.includes('barrel') ||
                            blockId.includes('furnace') ||
                            blockId.includes('shulker') ||
                            blockId.includes('hopper') ||
                            blockId.includes('dispenser') ||
                            blockId.includes('dropper')) {
                            isStorageBlock = true;
                        }

                        try {
                            let blockEntity = player.level.getBlockEntity(blockX_sched, footY, blockZ_sched);
                            if (blockEntity && (blockEntity.getCapability || blockEntity.hasCapability)) {
                                isStorageBlock = true;
                            }
                        } catch (capError) {}

                    } catch (error) {
                        isSolid = false;
                    }

                    if (!isSolid || isStorageBlock) return;

                    var effectStrength = currentDistance_sched / radius;
                    var blockParticleCount = Math.ceil(25 * effectStrength);

                    if (isDestructionEnabled && !isIndestructible && !isStorageBlock) {
                        var motionY = 0.1 + Math.abs(current_x) * 0.03 + Math.abs(current_z) * 0.03;

                        try {
                            let fallingBlockEntity = player.level.createEntity("falling_block");
                            fallingBlockEntity.setPosition(blockX_sched + 0.5, footY + 0.5, blockZ_sched + 0.5);

                            let entityNbt = fallingBlockEntity.nbt;
                            entityNbt.BlockState = { Name: blockId };

                            if (block.properties) {
                                entityNbt.BlockState.Properties = block.properties;
                            }

                            entityNbt.Motion = [0, motionY, 0];

                            fallingBlockEntity.mergeNbt(entityNbt);
                            block.set("air");
                            fallingBlockEntity.spawn();

                            try {
                                fallingBlockEntity.setMotion(0, motionY, 0);
                            } catch (e) {
                                try {
                                    fallingBlockEntity.setDeltaMovement(0, motionY, 0);
                                } catch (e2) {
                                    let velocity = fallingBlockEntity.getDeltaMovement();
                                    velocity = velocity.add(0, motionY, 0);
                                    fallingBlockEntity.setDeltaMovement(velocity);
                                }
                            }
                        } catch (error) {
                            try {
                                player.runCommandSilent(
                                    `summon falling_block ${blockX_sched} ${footY} ${blockZ_sched} {Motion:[0.0d,${motionY}d,0.0d],Time:1,BlockState:{Name:"${blockId}"}}`
                                );
                                block.set("air");
                            } catch (commandError) {}
                        }
                    }

                    if (blockParticleCount > 0) {
                        player.level.spawnParticles(
                            'block ' + blockId,
                            true,
                            blockX_sched + 0.5,
                            playerY + 0.5,
                            blockZ_sched + 0.5,
                            0.2, 0.4, 0.2,
                            blockParticleCount,
                            0.1
                        );

                        player.level.spawnParticles(
                            'minecraft:explosion',
                            true,
                            blockX_sched + 0.5,
                            playerY + 0.5,
                            blockZ_sched + 0.5,
                            0.1, 0.1, 0.1,
                            1,
                            0.0
                        );
                    }

                    try {
                        player.level.playSound(
                            null,
                            blockX_sched,
                            footY,
                            blockZ_sched,
                            'minecraft:entity.generic.explode',
                            player.getSoundSource(),
                            0.3 * effectStrength,
                            0.8 + Math.random() * 0.4
                        );
                    } catch (soundError) {}
                });
            }
        }
    }
};

let playersWithGravity = new Set();

PlayerEvents.tick(e => {
    let p = e.player
    let { x, y, z } = p

    if (!p.isPlayer() || p.isFake()) {
        return;
    }

    let abilityEnabled = false;
    try {
        abilityEnabled = palladium.abilities.isEnabled(p, "alienevo_aliens:arburian_pelarota", "slam");
    } catch (error) {
        return;
    }

    if (abilityEnabled && !playersWithGravity.has(p.uuid.toString())) {
        if (!p.isInWater()) {
            try {
                const ori_data = p.getAttribute(gravityAttribute).value
            } catch (e) { }

            if (!p.onGround()) {
                if (isAtLeast10BlocksAboveGround(p)) {
                    p.potionEffects.add("minecraft:slowness", 35, 4, false, false)
                    p.potionEffects.add("minecraft:resistance", 38, 255, false, false)
                    try {
                        p.modifyAttribute(gravityAttribute, "gravity_slam", 6, "addition")
                    } catch (e) { }

                    p.tags.add("gravity_slam_active");

                    playersWithGravity.add(p.uuid.toString());
                }
            } else {
                p.potionEffects.add("minecraft:slowness", 35, 4, false, false)
                p.potionEffects.add("minecraft:levitation", 18, 60, false, false)
                p.potionEffects.add("minecraft:resistance", 38, 255, false, false)

                try {
                    p.modifyAttribute(gravityAttribute, "gravity_slam", 6, "addition")
                } catch (e) { }

                p.tags.add("gravity_slam_active");

                playersWithGravity.add(p.uuid.toString());
            }
        }
    }

    if (!abilityEnabled && playersWithGravity.has(p.uuid.toString())) {
        playersWithGravity.delete(p.uuid.toString());
    }

    let hasHighGravity = false
    try {
        if (p.getAttribute(gravityAttribute).value > 5) {
            hasHighGravity = true
        }
    } catch (error) {
        hasHighGravity = false
    }

    if ((p.getDeltaMovement().get("y") < -5 || p.inWater) && p.onGround() && hasHighGravity) {
        try {
            p.removeAttribute(gravityAttribute, "gravity_slam")
        } catch (error) { }

        p.tags.remove("gravity_slam_active");
        p.removeEffect("minecraft:slowness");
        p.removeEffect("minecraft:resistance");
        p.removeEffect("minecraft:levitation");

        playersWithGravity.delete(p.uuid.toString());

        e.level.createExplosion(x, y, z).strength(1.9).explosionMode('none').exploder(p).explode()
        e.level.createExplosion(x, y, z).strength(.2).explosionMode('tnt').exploder(p).explode()

        e.level.spawnParticles("minecraft:explosion", false, x, y, z, 1, 0.5, 1, 5, 8)
        e.level.spawnParticles("minecraft:explosion_emitter", false, x, y, z, 1, 0.75, 1, 2, 1)

        createBlockWave(p, 6.0, true, true);
    }

    try {
        if (p.getEffect("minecraft:resistance").getAmplifier() == 255 && p.getEffect("minecraft:slowness").getAmplifier() == 4) {
        }
    } catch (error) {
        return
    }
})