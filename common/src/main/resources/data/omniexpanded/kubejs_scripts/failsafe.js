global.sound = (entity, soundId, volume, pitch, shift) => {
    entity.level.runCommandSilent(`playsound ${soundId} player @p ${entity.x} ${entity.y} ${entity.z} ${volume} ${pitch - shift/2 + Math.random()*shift}`);
};

global.applyKnockback = (entity, target, strength) => {
    let dx = target.x - entity.x;
    let dz = target.z - entity.z;
    let distance = Math.sqrt(dx * dx + dz * dz);

    if (distance > 0) {
        let multiplier = strength / distance;
        target.addMotion(
            dx * multiplier,
            0.4,
            dz * multiplier
        );
    }
};

function getCooldownTime(entity) {
    return entity.persistentData.getInt('totemCooldown') || 0;
}

function setCooldownTime(entity, time) {
    entity.persistentData.putInt('totemCooldown', time);
}

function isOnCooldown(entity) {
    let currentTime = entity.level.time;
    let cooldownTime = getCooldownTime(entity);
    return currentTime < cooldownTime;
}

function getRemainingCooldown(entity) {
    let currentTime = entity.level.time;
    let cooldownTime = getCooldownTime(entity);
    let remainingTicks = cooldownTime - currentTime;
    return Math.max(0, Math.ceil(remainingTicks / 20));
}


let users = ['minecraft:player'];

users.forEach(key => {
    EntityEvents.death(key, e=> {
        let bypasses = ['outOfWorld'];
        let knockbackRadius = 10;
        let knockbackStrength = 3;

        let {entity, source} = e;

        if (isOnCooldown(entity)) {
            return;
        }

        if (!abilityUtil.hasPower(entity, "alienevo:prototype_omnitrix")) {
            return;
        }

        if (!palladium.abilities.isUnlocked(entity, new ResourceLocation("alienevo:prototype_omnitrix"), "failsafe_unlock")) {
            return;
        }

        if (bypasses.includes(source.type)) {
            return;
        }

        let cooldownDuration = 18000;
        setCooldownTime(entity, entity.level.time + cooldownDuration);

        palladium.scoreboard.setScore(entity, "AlienEvo.Timer", 2);

        let box = AABB.ofSize(entity.position(), knockbackRadius * 2, knockbackRadius * 2, knockbackRadius * 2);
        let nearbyEntities = entity.level.getEntities(entity, box);

        nearbyEntities.forEach(target => {
            if (target !== entity && target.type !== "minecraft:item" &&
                target.type !== "minecraft:item_frame" &&
                target.type !== "minecraft:glow_item_frame" &&
                target.type !== "minecraft:armor_stand") {
                global.applyKnockback(entity, target, knockbackStrength);
            }
        });

        superpowerUtil.addSuperpower(entity, new ResourceLocation(`alienevo:transform_bubble`));
        global.sound(entity, 'item.totem.use', 0.3, 1.8, 0.2);
        global.sound(entity, 'alienevo:prototype_failsafe', 1.0, 1.0, 0.0);
        entity.extinguish()
        entity.setHealth(1.0);
        e.cancel();
    })
});


EntityEvents.death(event => {
 const entity = event.entity;

 if (!entity.player) {
     return;
 }

 const username = entity.getGameProfile().getName();

 let currentAlienNumber = palladium.getProperty(entity, 'omnitrix_cycle');

 if (!currentAlienNumber || currentAlienNumber <= 0) {
   return;
 }

 let alienInfo = global[`alienevo_alien_${currentAlienNumber}`];
 if (!alienInfo) {
   return;
 }

 let alienFullName = alienInfo[0];
 let alienNamespace = 'alienevo_aliens';
 let alienPath = alienFullName;

 if (alienFullName.includes(':')) {
   const parts = alienFullName.split(':');
   alienNamespace = parts[0];
   alienPath = parts[1];
 }

 const powerName = `${alienNamespace}:${alienPath}`;

 if (abilityUtil.hasPower(entity, powerName)) {
   entity.persistentData.remove('alienevo.previous_health');
   entity.persistentData.remove('alienevo.health_percentage');

   entity.setHealth(1.0);

   entity.server.runCommandSilent(`execute as ${username} at @s run superpower remove ${alienNamespace}:${alienPath}`);
   entity.server.runCommandSilent(`execute as ${username} at @s run superpower remove alienevo_aliens:all`);

   if (alienNamespace !== 'alienevo_aliens') {
     entity.server.runCommandSilent(`execute as ${username} at @s run superpower remove ${alienNamespace}:all`);
   }

   let watchType = palladium.getProperty(entity, 'watch') || "prototype";
   let watchNamespace = palladium.getProperty(entity, 'watch_namespace') || "alienevo";
   let useTimeoutBubble = palladium.getProperty(entity, 'use_timeout_bubble');

   if (entity.tags.contains("AlienEvo.MasterControl")) {
     palladium.superpowers.addSuperpower(entity, new ResourceLocation("alienevo:transform_bubble"));
   } else if (useTimeoutBubble === true) {
     palladium.superpowers.addSuperpower(entity, new ResourceLocation("alienevo:transform_bubble_tout"));
   } else {
     palladium.superpowers.addSuperpower(entity, new ResourceLocation("alienevo:transform_bubble"));
   }

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

   if (entity.tags.contains("AlienEvo.MasterControl")) {
     palladium.scoreboard.setScore(entity, 'AlienEvo.Timer', 1000);
   } else {
     palladium.scoreboard.setScore(entity, 'AlienEvo.Timer', 3000);
   }

   palladium.setProperty(entity, 'watch_state', "timeout");

   entity.tags.remove("AlienEvo.Transformation");

   event.cancel();
 } else {
 }
});