EntityEvents.hurt(event => {
    let entity = event.entity;
    if (entity.type == 'minecraft:player' &&
        abilityUtil.hasPower(entity, "alienevo_aliens:petrosapien") &&
        abilityUtil.isEnabled(entity, "alienevo_aliens:petrosapien", "shield_activate")) {
        let player = entity;
        let rayTrace = player.rayTrace(6);
        if (rayTrace && rayTrace.entity && rayTrace.entity == event.source.actual) {
            event.level.playSound(null, entity.x, entity.y, entity.z, "minecraft:block.amethyst_block.break", "ambient", 2, 1);
            entity.invulnerableTime = 20;
            event.source.actual.invulnerableTime = 0;
        }
        if (!rayTrace || !rayTrace.entity || rayTrace.entity != event.source.actual) {
            entity.invulnerableTime = 0;
        }
    }
});

EntityEvents.hurt(event => {
    let entity = event.entity;
    if (
        abilityUtil.hasPower(entity, "alienevo_aliens:machine/machine_husk") ||
        abilityUtil.hasPower(entity, "alienevo_aliens:machine/machine_husk_baby") ||
        abilityUtil.hasPower(entity, "alienevo_aliens:machine/machine_husk_staff") ||
        abilityUtil.hasPower(entity, "alienevo_aliens:machine/machine_ravager")
    ) {
        let oldHealth = entity.health;
        event.server.scheduleInTicks(1, () => {
            if (entity.health < oldHealth) {
                entity.level.playSound(null, entity.x, entity.y, entity.z, "minecraft:entity.iron_golem.damage", "master", 0.5, 1);
                entity.level.playSound(null, entity.x, entity.y, entity.z, "minecraft:entity.iron_golem.hurt", "master", 0.5, 1);
                entity.level.spawnParticles('minecraft:electric_spark', true, entity.x, entity.y + 1.7, entity.z, 0.1, 0.1, 0.1, 5, 1);
            }
        });
    }
});

EntityEvents.hurt(event => {
    let entity = event.entity;
    if (
        abilityUtil.hasPower(entity, "alienevo_aliens:galvan_villager/galvan_villager_01") ||
        abilityUtil.hasPower(entity, "alienevo_aliens:galvan_villager/galvan_villager_02") ||
        abilityUtil.hasPower(entity, "alienevo_aliens:galvan_villager/galvan_villager_03")
    ) {
        let oldHealth = entity.health;
        event.server.scheduleInTicks(1, () => {
            if (entity.health < oldHealth) {
                entity.level.playSound(null, entity.x, entity.y, entity.z, "minecraft:entity.frog.hurt", "master", 1, 1.5)
            }
        });
    }
});


EntityEvents.death(event => {
    let entity = event.entity;

    if (event.source && event.source.player) {
        let player = event.source.player;

        if (abilityUtil.hasPower(player, "alienevo_aliens:vulpimancer")) {

            let foodValue = 0;

            let entityType = entity.type.toString();

            if (entityType.includes('zombie') ||
                entityType.includes('skeleton') ||
                entityType.includes('creeper') ||
                entityType.includes('spider') ||
                entity.tags.contains('monster')) {
                foodValue = 1; // 2 food bars
            } else if (entityType.includes('cow') ||
                entityType.includes('pig') ||
                entityType.includes('sheep') ||
                entityType.includes('chicken') ||
                entityType.includes('rabbit') ||
                entity.tags.contains('animal')) {
                foodValue = 2; // 1.5 food bars
            } else {
                foodValue = 1; // 0.5 food bars
            }

            player.potionEffects.add("minecraft:saturation", 1, foodValue, true, true);
        }
    }
});

EntityEvents.hurt(event => {
    let { entity, source } = event
    if (!source.actual) return
    if (event.source && event.source.player &&
        abilityUtil.hasPower(event.source.player, "alienevo_aliens:petrosapien") &&
        abilityUtil.isEnabled(event.source.player, "alienevo_aliens:petrosapien", "battle_mode") &&
        !abilityUtil.isEnabled(event.source.player, "alienevo_aliens:petrosapien", "shield_activate")
    ) {
        let player = source.actual;
        performSweepAttack(player, entity, 0.5);
    }
})
let LivingEntity = Java.loadClass('net.minecraft.world.entity.LivingEntity')
let ArmorStand = Java.loadClass('net.minecraft.world.entity.decoration.ArmorStand');
let Projectile = Java.loadClass('net.minecraft.world.entity.projectile.Projectile');

function performSweepAttack(player, target, baseDamage) {
    let level = player.level;
    let yRotRad = player.yaw * (JavaMath.PI / 180);
    let knockbackX = Math.sin(yRotRad);
    let knockbackZ = -Math.cos(yRotRad);
    let sweepHitBox = player.mainHandItem.getSweepHitBox(player, target);
    let sweepEntities = level.getEntitiesOfClass(LivingEntity, sweepHitBox);
    let entityReachSq = Math.pow(player.getEntityReach(), 3);

    for (let i = 0; i < sweepEntities.size(); i++) {
        let entity = sweepEntities.get(i);
        if (
            entity != player &&
            entity != target &&
            !player.isAlliedTo(player.team) &&
            (!(entity instanceof ArmorStand) || !entity.isMarker()) &&
            player.distanceToSqr(entity) < entityReachSq
        ) {
            if (entity.persistentData.swept) continue;
            entity.persistentData.swept = true;
            entity.knockback(0.4, knockbackX, knockbackZ);
            entity.attack(player.damageSources().playerAttack(player), 1.0 + baseDamage);
            entity.server.scheduleInTicks(1, () => {
                entity.persistentData.remove("swept");
            });
        }
    }
    level.playSound(
        null,
        player.x,
        player.y,
        player.z,
        "entity.player.attack.sweep",
        player.getSoundSource(),
        1.0,
        1.0
    );
    player.sweepAttack();
}

const $ResourceKey = Java.loadClass("net.minecraft.resources.ResourceKey")
const $TagKey = Java.loadClass("net.minecraft.tags.TagKey")
const DAMAGE_TYPE = $ResourceKey.createRegistryKey("damage_type")
const IS_PROJECTILE = $TagKey.create(DAMAGE_TYPE, 'minecraft:is_projectile')

EntityEvents.hurt(event => {
    let { entity, source } = event

    if (!source.actual || source.is(IS_PROJECTILE)) return

    if (event.source && event.source.player &&
        abilityUtil.hasPower(event.source.player, "alienevo_aliens:vulpimancer") &&
        abilityUtil.isEnabled(event.source.player, "alienevo_aliens:vulpimancer", "slash_abil") &&
        !abilityUtil.isEnabled(event.source.player, "alienevo_aliens:vulpimancer", "quill_barrage") &&
        !abilityUtil.isEnabled(event.source.player, "alienevo_aliens:vulpimancer", "bite_motion")
    ) {
        let player = source.actual;
        performSweepAttack(player, entity, 0.5);
    }
})


EntityEvents.hurt(event => {
    let entity = event.entity;

    if (entity.type == 'minecraft:player' &&
        abilityUtil.hasPower(entity, "alienevo_aliens:ectonurite") &&
        abilityUtil.isEnabled(entity, "alienevo_aliens:ectonurite", "intangibility")) {

        entity.invulnerableTime = 20;
        event.cancel();
    }
});

EntityEvents.hurt(event => {
    let attacker = event.source.player;

    if (attacker &&
        abilityUtil.hasPower(attacker, "alienevo_aliens:ectonurite") &&
        abilityUtil.isEnabled(attacker, "alienevo_aliens:ectonurite", "invis")) {

        attacker.addTag("AlienEvo.GhostDamage");

        event.server.scheduleInTicks(20, callback => {
            if (attacker.isAlive()) {
                attacker.removeTag("AlienEvo.GhostDamage");
            }
        });
    }
});


function isAttackFromBehind(target, attacker) {
    try {
        let targetX = target.getX();
        let targetZ = target.getZ();
        let attackerX = attacker.getX();
        let attackerZ = attacker.getZ();
        let yaw = target.getYaw();

        if ([targetX, targetZ, attackerX, attackerZ, yaw].some(val => val === null || val === undefined || isNaN(val))) {
            return { isFromBehind: false };
        }

        yaw = ((yaw % 360) + 360) % 360;
        let yawRadians = yaw * (Math.PI / 180.0);

        let facingX = -Math.sin(yawRadians);
        let facingZ = Math.cos(yawRadians);

        if (isNaN(facingX) || isNaN(facingZ)) {
            let toAttackerX = attackerX - targetX;
            let toAttackerZ = attackerZ - targetZ;

            let isFromBehind = false;
            if (yaw >= 315 || yaw < 45) {
                isFromBehind = toAttackerZ < 0;
            } else if (yaw >= 45 && yaw < 135) {
                isFromBehind = toAttackerX > 0;
            } else if (yaw >= 135 && yaw < 225) {
                isFromBehind = toAttackerZ > 0;
            } else {
                isFromBehind = toAttackerX < 0;
            }

            return { isFromBehind: isFromBehind };
        }

        let toAttackerX = attackerX - targetX;
        let toAttackerZ = attackerZ - targetZ;

        let dotProduct = facingX * toAttackerX + facingZ * toAttackerZ;
        let isFromBehind = dotProduct < 0;

        return { isFromBehind: isFromBehind };
    } catch (error) {
        return { isFromBehind: false };
    }
}

EntityEvents.hurt(event => {
    let entity = event.entity;
    let source = event.source;

    if (entity.type == 'minecraft:player') {
        try {
            if (abilityUtil.hasPower(entity, "alienevo_aliens:arburian_pelarota")) {
                let hasBallForm = abilityUtil.isEnabled(entity, "alienevo_aliens:arburian_pelarota", "ball_pivot");

                if (!hasBallForm && source && source.actual) {
                    let result = isAttackFromBehind(entity, source.actual);

                    if (result.isFromBehind) {
                        entity.invulnerableTime = 20;
                        event.level.playSound(null, entity.x, entity.y, entity.z, "minecraft:item.armor.equip_leather", "ambient", 1.0, 1.1);
                        event.level.playSound(null, entity.x, entity.y, entity.z, "minecraft:entity.slime.jump", "ambient", 0.2, 1.3);
                        event.level.playSound(null, entity.x, entity.y, entity.z, "minecraft:entity.snow_golem.hurt", "ambient", 0.3, 1.6);
                        event.cancel();
                    }
                }
            }
        } catch (e) {
        }
    }
});


