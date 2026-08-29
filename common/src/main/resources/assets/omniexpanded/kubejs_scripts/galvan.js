PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/galvanlimbs', 'alienevo_aliens:galvan', 15, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), 'alienevo_aliens:galvan', 'galvan_limbs')) {
            if (!builder.isFirstPerson()) {
                builder.get('left_arm').rotateX(builder.getModel().leftArm.xRot * -0.4)
                builder.get('right_arm').rotateX(builder.getModel().rightArm.xRot * -0.4)
                builder.get('right_leg').rotateX(builder.getModel().rightLeg.xRot * -0.4)
                builder.get('left_leg').rotateX(builder.getModel().leftLeg.xRot * -0.4)
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/galvansuit', 'alienevo_aliens:galvan', 15, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), 'alienevo_aliens:galvan', 'galvan_suit')) {
            if (!builder.isFirstPerson()) {
                builder.get('left_arm').rotateX(builder.getModel().leftArm.xRot * -0.4).moveX(4).moveY(8)
                builder.get('right_arm').rotateX(builder.getModel().rightArm.xRot * -0.4).moveX(-4).moveY(8)
                builder.get('right_leg').rotateX(builder.getModel().rightLeg.xRot * -0.4)
                builder.get('left_leg').rotateX(builder.getModel().leftLeg.xRot * -0.4)
            }
            if (builder.isFirstPerson()) {
                builder.get('left_arm').scaleX(0.75).scaleY(0.75).scaleZ(0.75).moveX(4).moveY(5)
                builder.get('right_arm').scaleX(0.75).scaleY(0.75).scaleZ(0.75).moveX(-4).moveY(5)
            }
            if (builder.getPlayer().isCrouching()) {
                builder.get('head').setY(0)
                builder.get('chest').setXRotDegrees(12).setY(0)
                builder.get('left_leg').setY(10)
                builder.get('right_leg').setY(10)
                builder.get('left_arm').setY(2+8).setZ(1.5)
                builder.get('right_arm').setY(2+8).setZ(1.5)
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/galvan_tongue_anim', 'alienevo_aliens:galvan', 10, (builder) => {
        const animation = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:galvan', 'galvan_tongue_anim', builder.getPartialTicks());
        if (animation > 0.0) {
            if (builder.isFirstPerson()) {
                builder.get('right_arm').setZRotDegrees(25).animate('easeInOutBack', animation);
                builder.get('left_arm').setZRotDegrees(-25).animate('easeInOutBack', animation);
            } else {
                builder.get('body').setY(builder.getModel().body.y + 2).animate('easeInOutBack', animation);
                builder.get('right_arm').setXRotDegrees(35).setYRotDegrees(0).setZRotDegrees(37.5).setZ(builder.getModel().rightArm.z + 3).animate('easeInOutBack', animation);
                builder.get('left_arm').setXRotDegrees(35).setYRotDegrees(0).setZRotDegrees(-37.5).setZ(builder.getModel().leftArm.z + 3).animate('easeInOutBack', animation);
                builder.get('chest').setXRotDegrees(32.5).setYRotDegrees(0).setZRotDegrees(0).animate('easeInOutBack', animation);
                builder.get('right_leg').setXRotDegrees(-30).setYRotDegrees(23).setZRotDegrees(18).setY(builder.getModel().rightLeg.y - 3).setZ(builder.getModel().rightLeg.z + 7.5).animate('easeInOutBack', animation);
                builder.get('left_leg').setXRotDegrees(-30).setYRotDegrees(-23).setZRotDegrees(-18).setY(builder.getModel().leftLeg.y - 3).setZ(builder.getModel().leftLeg.z + 7.5).animate('easeInOutBack', animation);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/galvan_climb_onwall', 'alienevo_aliens:galvan', 10, (builder) => {
        const on_wall = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:galvan', 'surface_climbing_anim', builder.getPartialTicks());
        if (on_wall > 0.0) {
            if (builder.isFirstPerson()) {
            } else {
                builder.get('left_arm')
                    .setXRotDegrees(-145)
                    .animate('InOutCubic', on_wall);
                builder.get('right_arm')
                    .setXRotDegrees(-145)
                    .animate('InOutCubic', on_wall);
                builder.get('body')
                    .translateZ(0)
                    .animate('InOutCubic', on_wall);
                builder.get('right_leg')
                    .setZ(builder.getModel().rightLeg.z - 1)
                    .setXRotDegrees(-10)
                    .animate('InOutCubic', on_wall);
                builder.get('left_leg')
                    .setZ(builder.getModel().leftLeg.z - 1)
                    .setXRotDegrees(-10)
                    .animate('InOutCubic', on_wall);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/galvan_climb_1', 'alienevo_aliens:galvan', 10, (builder) => {
        const climb_1 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:galvan', 'climb_1', builder.getPartialTicks());
        if (climb_1 > 0.0) {
            if (builder.isFirstPerson()) {
            } else {
                builder.get('right_arm')
                    .setXRotDegrees(-135)
                    .animate('easeInOutSine', climb_1);
                builder.get('left_arm')
                    .setY(builder.getModel().leftArm.y + 5)
                    .setXRotDegrees(-160)
                    .animate('easeInOutSine', climb_1);
                builder.get('right_leg')
                    .setY(builder.getModel().rightLeg.y - 7)
                    .setZ(builder.getModel().rightLeg.z - 2)
                    .setXRotDegrees(-10)
                    .animate('easeInOutSine', climb_1);
                builder.get('left_leg')
                    .setZ(builder.getModel().leftLeg.z - 2)
                    .setXRotDegrees(10)
                    .animate('easeInOutSine', climb_1);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/galvan_climb_2', 'alienevo_aliens:galvan', 10, (builder) => {
        const climb_2 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:galvan', 'climb_2', builder.getPartialTicks());
        if (climb_2 > 0.0) {
            if (builder.isFirstPerson()) {
            } else {
                builder.get('right_arm')
                    .setY(builder.getModel().leftArm.y + 5)
                    .setXRotDegrees(-160)
                    .animate('easeInOutSine', climb_2);
                builder.get('left_arm')
                    .setXRotDegrees(-135)
                    .animate('easeInOutSine', climb_2);
                builder.get('left_leg')
                    .setY(builder.getModel().rightLeg.y - 7)
                    .setZ(builder.getModel().rightLeg.z - 2)
                    .setXRotDegrees(-10)
                    .animate('easeInOutSine', climb_2);
                builder.get('right_leg')
                    .setZ(builder.getModel().rightLeg.z - 2)
                    .setXRotDegrees(10)
                    .animate('easeInOutSine', climb_2);
            }
        }
    });
}); 