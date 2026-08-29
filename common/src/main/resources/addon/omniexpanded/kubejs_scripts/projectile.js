// File: kubejs/server_scripts/phantom_projectile_with_offset.js
let Vec3 = Java.loadClass('net.minecraft.world.phys.Vec3');

StartupEvents.registry('palladium:abilities', event => {
    event.create('alienevo:custom_projectile')
        .icon(palladium.createItemIcon('minecraft:egg'))

        .documentationDescription('Fires a projectile at a local pitch and yaw offset relative to where the player is looking (velocity is still applied so that the projectile is fired where the entity with the power is aiming) (all angles are measured in degrees) (for reference, yaw is left-to-right rotation, and pitch is up-and-down rotation)')

        .addProperty('entity_type', 'string', "minecraft:snowball", 'The entity ID for the projectile to be fired')
        .addProperty('entity_data', 'compound_tag', null, 'NBT data for the projectile entity')
        .addProperty('yaw_offset', 'float', 0.0, 'The value to be added to the source entity\'s yaw (resulting in the projectile originating from somewhere else on the entity with the power)')
        .addProperty('pitch_offset', 'float', 0.0, 'The value to be added to the source entity\'s pitch (resulting in the projectile originating from somewhere else on the entity with the power)')
        .addProperty('yaw_inaccuracy', 'float', 0.0, 'The maximum value to be randomly added or subtracted from the entity\'s yaw (resulting in an inaccuracy effect)')
        .addProperty('pitch_inaccuracy', 'float', 0.0, 'The maximum value to be randomly added or subtracted from the entity\'s pitch (resulting in an inaccuracy effect)')
        .addProperty('yaw_override', 'float', null, 'Locks the calculated yaw value to this (setting this to null will make it ignored')
        .addProperty('pitch_override', 'float', null, 'Locks the calculated pitch value to this (setting this to null will make it ignored')
        .addProperty('count', 'integer', 1, 'The number of projectiles to be fired each tick the ability is active')
        .addProperty('speed', 'float', 5.0, 'The speed of the projectile')
        .addProperty('align_velocity_with_calculated_rotation', 'boolean', false, 'If true, the projectile\'s velocity will be calculated using the new pitch and yaw values (which are affected by offsets and overrides) instead of only source entity\'s rotation')

        .tick((entity, entry, holder, enabled) => {
            if (!enabled) return;

            let TYPE = entry.getPropertyByName('entity_type');
            let NBT = entry.getPropertyByName('entity_data');
            let YAW_OFFSET = entry.getPropertyByName('yaw_offset');
            let PITCH_OFFSET = entry.getPropertyByName('pitch_offset');
            let YAW_INACC = entry.getPropertyByName('yaw_inaccuracy');
            let PITCH_INACC = entry.getPropertyByName('pitch_inaccuracy');
            let YAW_OVERRIDE = entry.getPropertyByName('yaw_override');
            let PITCH_OVERRIDE = entry.getPropertyByName('pitch_override');
            let COUNT = entry.getPropertyByName('count');
            let SPEED = entry.getPropertyByName('speed');
            let ALIGN_VEL_WITH_CALC_ROT = entry.getPropertyByName('align_velocity_with_calculated_rotation');

            for (let i = 0; i < COUNT; i++) {
                let calcYawInacc = Math.random() * 2 * YAW_INACC - YAW_INACC;
                let calcPitchInacc = Math.random() * 2 * PITCH_INACC - PITCH_INACC;

                // NOTE: use entity.level if you prefer; kept your original call
                let projectile = entity.block.createEntity(TYPE);
                if (NBT != null) projectile.mergeNbt(NBT);

                let yaw = -toRadians(entity.getYaw() + YAW_OFFSET + calcYawInacc);
                let pitch = -toRadians(entity.getPitch() + PITCH_OFFSET + calcPitchInacc);

                if (YAW_OVERRIDE != null) yaw = toRadians(YAW_OVERRIDE);
                if (PITCH_OVERRIDE != null) pitch = toRadians(PITCH_OVERRIDE);

                let x = entity.x + Math.cos(pitch) * Math.sin(yaw);
                let y = entity.y + entity.getEyeHeight() + Math.sin(pitch);
                let z = entity.z + Math.cos(pitch) * Math.cos(yaw);

                projectile.setPos(x, y, z);
                projectile.shootFromRotation(entity, entity.pitch, entity.yaw, 0, SPEED, 0)
                if (!ALIGN_VEL_WITH_CALC_ROT) {
                    // normal velocity
                    projectile.setDeltaMovement(entity.getLookAngle().scale(SPEED).add(entity.getDeltaMovement()));
                } else {
                    // velocity aligned with calculated yaw and pitch
                    projectile.setDeltaMovement(
                        Vec3.directionFromRotation(toDegrees(-pitch), toDegrees(-yaw))
                            .scale(SPEED)
                            .add(entity.getDeltaMovement())
                    );
                }

                projectile.setOwner(entity);

                if (abilityUtil.hasPower(entity, "alienevo_aliens:petrosapien")) {

                    let uniform = palladium.getProperty(entity, 'uniform') || "prototype";
                    palladium.setProperty(projectile, 'uniform', uniform);

                    for (let i = 1; i <= 6; i++) {
                        palladium.setProperty(
                            projectile,
                            `petrosapien_${uniform}_skincolor_palette_1_color_${i}`,
                            palladium.getProperty(entity, `petrosapien_${uniform}_skincolor_palette_1_color_${i}`)
                        );
                    }
                }

                if (abilityUtil.hasPower(entity, "alienevo_aliens:vulpimancer") &&
                    abilityUtil.isEnabled(entity, "alienevo_aliens:vulpimancer", "quill_barrage")) {

                    let uniform = palladium.getProperty(entity, 'uniform') || "prototype";
                    palladium.setProperty(projectile, 'uniform', uniform);

                    for (let i = 1; i <= 6; i++) {
                        palladium.setProperty(
                            projectile,
                            `vulpimancer_${uniform}_skincolor_palette_1_color_${i}`,
                            palladium.getProperty(entity, `vulpimancer_${uniform}_skincolor_palette_1_color_${i}`)
                        );
                    }
                }

                projectile.spawn();
            }
        });
});

function toRadians(degrees) {
    return degrees * JavaMath.PI / 180;
}

function toDegrees(radians) {
    return radians * 180 / JavaMath.PI;
}
