let Vec3 = Java.loadClass('net.minecraft.world.phys.Vec3');
let ClientboundSetEntityMotionPacket = Java.loadClass('net.minecraft.network.protocol.game.ClientboundSetEntityMotionPacket');

StartupEvents.registry('palladium:abilities', (event) => {
    event.create('alienevo:astro_laser_damage')
        .icon(palladium.createItemIcon('palladium:vibranium_circuit'))
        .addProperty('radius', 'float', 10, 'Radius in which surrounding entities will be damaged')
        .addProperty('height', 'float', 10, 'Height in which surrounding entities will be damaged')
        .addProperty('damage', 'float', 3.0, 'Damage the ability will deal')
        .addProperty('tag_ex', 'string', 'exclusion_tag', 'Tag that exlcudes entities if desired')
        .addProperty('damage_type', 'string', 'minecraft:player_attack', 'Type of damage.')
        .tick((entity, entry, holder, enabled) => {
            if (enabled) {
                const damage_type = entry.getPropertyByName('damage_type');
                const tag_ex = entry.getPropertyByName('tag_ex');
                const damage = entry.getPropertyByName('damage');
                const radius = entry.getPropertyByName('radius') * 2.0;
                const height = entry.getPropertyByName('height') * 2.0;
                const targets = entity.serverLevel().getEntities(entity, AABB.ofSize(entity.position(), radius, height, radius)).toArray();

                for (let j = 0; j < targets.length; j++) {
                    if (targets[j] !== entity &&
                        targets[j].y < entity.y &&
                        !containsTag(targets[j].getTags().toArray(), tag_ex) &&
                        targets[j].type !== "minecraft:item" &&
                        targets[j].type !== "minecraft:item_frame" &&
                        targets[j].type !== "minecraft:glow_item_frame" &&
                        targets[j].type !== "minecraft:armor_stand" &&
                        targets[j].type !== "palladium:suit_stand") {

                        entity.server.runCommandSilent("execute as " + targets[j].uuid + " at @s run damage @s " + damage + " " + damage_type + " by " + entity.uuid);
                    }
                }
            }
        })
});

StartupEvents.registry('palladium:abilities', (event) => {
    event.create('alienevo:astrojump')
        .addProperty('boost_strength', 'float', 1, 'Boost Strength')
        .firstTick((entity, entry, enabled) => {
            if (enabled) {
                if (palladium.abilities.isEnabled(entity, 'alienevo_aliens:astrobot', 'laser_jump')) {
                    let boost_strength = entry.getPropertyByName('boost_strength');
                    entity.motionY = boost_strength;
                    entity.addTag('astroLaser');
                    entity.persistentData.putInt('astrojump_timer', 0);
                    if (entity.isPlayer()) {
                        entity.connection.send(new ClientboundSetEntityMotionPacket(entity));
                    }
                }
            }
        })
        .lastTick((entity, enabled) => {
            if (enabled) {
                entity.removeTag('astroLaser');
                entity.addTag('astroLaserJumpDisabled');
            }
        })
        .tick((entity, builder, enabled) => {
            if (enabled) {
                if (palladium.abilities.isEnabled(entity, 'alienevo_aliens:astrobot', 'laser_jump')) {
                    let timer = entity.persistentData.getInt('astrojump_timer');
                    entity.persistentData.putInt('astrojump_timer', timer + 1);
                    if (timer <= 15) {
                        entity.potionEffects.add('minecraft:levitation', 3, 0, true, false);
                        entity.potionEffects.add('minecraft:slow_falling', 3, 0, true, false);
                    }
                }
            }
        })
});

StartupEvents.registry('palladium:abilities', (event) => {
    event.create('alienevo:astro_punch_damage')
        .addProperty('radius', 'float', 10, 'Radius in which surrounding entities will be damaged')
        .addProperty('damage', 'float', 3.0, 'Damage the ability will deal')
        .addProperty('tag_ex', 'string', 'exclusion_tag', 'Tag that exlcudes entities if desired')
        .addProperty('damage_type', 'string', 'minecraft:player_attack', 'Type of damage.')
        .tick((entity, entry, holder, enabled) => {
            if (enabled) {
                if (entity.getTags().contains('astroPunchLeft')) {
                    entity.removeTag('astroPunchLeft');
                    entity.addTag('astroPunchRight');
                } else {
                    entity.removeTag('astroPunchRight');
                    entity.addTag('astroPunchLeft')
                }
                entity.addTag('astroLaserJumpDisabled');

                const damage_type = entry.getPropertyByName('damage_type');
                const tag_ex = entry.getPropertyByName('tag_ex');
                const damage = entry.getPropertyByName('damage');
                const radius = entry.getPropertyByName('radius') * 2.0;
                const targets = entity.serverLevel().getEntities(entity, AABB.ofSize(entity.position(), radius, radius, radius)).toArray();
                for (let j = 0; j < targets.length; j++) {
                    if (targets[j] !== entity && !containsTag(targets[j].getTags().toArray(), tag_ex) && targets[j].type !== "minecraft:item" && targets[j].type !== "minecraft:item_frame" && targets[j].type !== "minecraft:glow_item_frame" && targets[j].type !== "minecraft:armor_stand" && targets[j].type !== "palladium:suit_stand") {
                        entity.server.runCommandSilent("execute as " + targets[j].uuid + " at @s run damage @s " + damage + " " + damage_type + " by " + entity.uuid);
                    }
                }
            }
        })
});

StartupEvents.registry('palladium:abilities', (event) => {
    event.create('alienevo:astro_punch_air_damage')
        .addProperty('radius', 'float', 10, 'Radius in which surrounding entities will be damaged')
        .addProperty('damage', 'float', 3.0, 'Damage the ability will deal')
        .addProperty('tag_ex', 'string', 'exclusion_tag', 'Tag that exlcudes entities if desired')
        .addProperty('damage_type', 'string', 'minecraft:player_attack', 'Type of damage.')
        .tick((entity, entry, holder, enabled) => {
            if (enabled) {
                entity.addTag('astroLaserJumpDisabled');
                entity.addTag('astroAirPunchDisabled');

                entity.potionEffects.add('minecraft:levitation', 7, 0, true, false);
                entity.potionEffects.add('minecraft:slow_falling', 7, 0, true, false);

                const damage_type = entry.getPropertyByName('damage_type');
                const tag_ex = entry.getPropertyByName('tag_ex');
                const damage = entry.getPropertyByName('damage');
                const radius = entry.getPropertyByName('radius') * 2.0;
                const targets = entity.serverLevel().getEntities(entity, AABB.ofSize(entity.position(), radius, radius, radius)).toArray();
                for (let j = 0; j < targets.length; j++) {
                    if (targets[j] !== entity && !containsTag(targets[j].getTags().toArray(), tag_ex) && targets[j].type !== "minecraft:item" && targets[j].type !== "minecraft:item_frame" && targets[j].type !== "minecraft:glow_item_frame" && targets[j].type !== "minecraft:armor_stand" && targets[j].type !== "palladium:suit_stand") {
                        entity.server.runCommandSilent("execute as " + targets[j].uuid + " at @s run damage @s " + damage + " " + damage_type + " by " + entity.uuid);
                    }
                }
            }
        })
});

StartupEvents.registry('palladium:abilities', (event) => {
    event.create('alienevo:astro_chargepunch')
        .firstTick((entity, entry, enabled) => {
            if (enabled) {
                if (palladium.abilities.isEnabled(entity, 'alienevo_aliens:astrobot', 'testanim')) {
                    if (!entity.getTags().contains('astroPunchDisabled')) {

                        entity.persistentData.putInt('astroChargePunch_Timer', 0);

                        if (entity.getTags().contains('astroPunchLeft')) {
                            entity.removeTag('astroPunchLeft');
                            entity.addTag('astroPunchRight');
                        } else {
                            entity.removeTag('astroPunchRight');
                            entity.addTag('astroPunchLeft')
                        }
                        entity.addTag('astroLaserJumpDisabled');
                    };

                    if (!entity.getTags().contains('astroPunchDisabled')) {
                        entity.addTag('astroPunchStart');
                        entity.server.scheduleInTicks(1, () => {
                            entity.removeTag('astroPunchStart');
                            entity.addTag('astroPunchDisabled');
                        });
                        entity.server.scheduleInTicks(9, () => {
                            entity.removeTag('astroPunchDisabled');
                        });
                    }
                }
            }
        })
        .tick((entity, enabled) => {
            if (enabled) {
                if (palladium.abilities.isEnabled(entity, 'alienevo_aliens:astrobot', 'testanim')) {
                    let chargetimer = entity.persistentData.getInt('astroChargePunch_Timer');
                    entity.persistentData.putInt('astroChargePunch_Timer', chargetimer + 1);
                    if (chargetimer >= 20) {
                        entity.potionEffects.add('minecraft:speed', 3, 0, true, false);
                    }
                }
            }
        })
        .lastTick((entity, enabled) => {
            if (enabled) {
                if (palladium.abilities.isEnabled(entity, 'alienevo_aliens:astrobot', 'testanim')) {
                    entity.persistentData.putInt('astroChargePunch_Timer', 0);
                }
            }
        })

});

function containsTag(tags, tag) {
    for (let i = 0; i < tags.length; i++) {
        if (tags[i].equals(tag)) {
            return true;
        }
    }
    return false;
}

function applyPunchDamage(entity, entry) {
    const damage_type = entry.getPropertyByName('damage_type');
    const tag_ex = entry.getPropertyByName('tag_ex');
    const damage = entry.getPropertyByName('damage');
    const radius = entry.getPropertyByName('radius') * 2.0;

    const lookAngle = entity.getLookAngle();

    const offsetPosition = entity.position().add(
        lookAngle.x * (radius / 2),
        0,
        lookAngle.z * (radius / 2)
    );

    const targets = entity.serverLevel().getEntities(
        entity,
        AABB.ofSize(offsetPosition, radius, radius, radius)
    ).toArray();

    for (let j = 0; j < targets.length; j++) {
        if (targets[j] !== entity &&
            !containsTag(targets[j].getTags().toArray(), tag_ex) &&
            targets[j].type !== "minecraft:item" &&
            targets[j].type !== "minecraft:item_frame" &&
            targets[j].type !== "minecraft:glow_item_frame" &&
            targets[j].type !== "minecraft:armor_stand" &&
            targets[j].type !== "palladium:suit_stand") {
            entity.server.runCommandSilent("execute as " + targets[j].uuid + " at @s run damage @s " + damage + " " + damage_type + " by " + entity.uuid);
        }
    }
}
