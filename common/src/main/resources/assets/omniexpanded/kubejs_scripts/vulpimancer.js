PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('vulpimancer_anim', 'alienevo_aliens:vulpimancer', 10, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), 'alienevo_aliens:vulpimancer', 'vulpimancer_loop')) {
            if (builder.isFirstPerson()) {
                builder.get('left_arm')
                    .translateX(-5)
                    .translateY(0)
                    .translateZ(0)
                    .setYRotDegrees(-45)
                builder.get('right_arm')
                    .translateX(1)
                    .translateY(-12)
                    .translateZ(-4)
                    .setXRotDegrees(30)
                    .setYRotDegrees(25)
                    .setZRotDegrees(-10)
            } else {
                builder.get('chest').setYRotDegrees(0).setZRotDegrees(0)
                builder.get('right_arm').setYRotDegrees(0).setZRotDegrees(0).rotateX(builder.getModel().rightArm.xRot * -0.20)
                builder.get('left_arm').setYRotDegrees(0).setZRotDegrees(0).rotateX(builder.getModel().leftArm.xRot * -0.20)
                builder.get('right_leg').setYRotDegrees(0).setZRotDegrees(0).rotateX(builder.getModel().rightLeg.xRot * -0.20)
                builder.get('left_leg').setYRotDegrees(0).setZRotDegrees(0).rotateX(builder.getModel().leftLeg.xRot * -0.20)
                if (builder.getPlayer().isCrouching()) {
                    builder.get('head')
                        .translateY(4)
                    builder.get('chest')
                        .translateY(4)
                        .setXRotDegrees(15)
                    builder.get('left_leg')
                        .translateY(11)
                        .translateZ(2)
                    builder.get('right_leg')
                        .translateY(11)
                        .translateZ(2)
                    builder.get('right_arm')
                        .rotateXDegrees(-15)
                        .translateY(1)
                        .translateZ(2)
                    builder.get('left_arm')
                        .rotateXDegrees(-15)
                        .translateY(1)
                        .translateZ(2)
                    builder.get('body')
                        .translateY(0)
                }
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/vulp_sprint', 'alienevo_aliens:vulpimancer', 15, (builder) => {
        const animation = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:vulpimancer', 'sprint_function', builder.getPartialTicks());
        if (animation > 0.0 && !builder.isFirstPerson()) {
            builder.get('left_arm').setXRot(builder.getModel().rightLeg.xRot).animate('easeOutBack', animation);
            builder.get('right_arm').setXRot(builder.getModel().rightLeg.xRot).animate('easeOutBack', animation);
            builder.get('right_leg').setXRot(builder.getModel().leftLeg.xRot + 0.6).animate('easeOutBack', animation);
            builder.get('left_leg').setXRot(builder.getModel().leftLeg.xRot + 0.6).animate('easeOutBack', animation);
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/wild_swim', 'alienevo_aliens:vulpimancer', 15, (builder) => {
        const animation = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:vulpimancer', 'swim_function', builder.getPartialTicks());
        if (animation > 0.0) {
            builder.get('body').setXRotDegrees(60).animate('InOutCubic', animation);
            builder.get('left_arm').setXRot(builder.getModel().rightLeg.xRot).rotateX(builder.getModel().leftArm.xRot * 2).animate('InOutCubic', animation);
            builder.get('right_arm').setXRot(builder.getModel().rightLeg.xRot).rotateX(builder.getModel().leftArm.xRot * 2).animate('InOutCubic', animation);
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/wall_climb', 'alienevo_aliens:vulpimancer', 15, (builder) => {
        const climb = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:vulpimancer', 'surface_climbing_anim', builder.getPartialTicks());
        if (climb > 0.0) {

            builder.get('head')
                .setXRotDegrees(0)
                .animate('InOutCubic', climb);
            builder.get('body').setXRotDegrees(90).translateZ(-10).animate('InOutCubic', climb);


        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/wildmuttlegs', 'alienevo_aliens:vulpimancer', 15, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:vulpimancer", "vulpimancer_loop")) {
            if (!builder.isFirstPerson()) {
                const halfPi = 1.57079632679;
                builder.get('right_leg').rotateX(builder.getModel().rightLeg.xRot * -0.4)
                builder.get('left_leg').rotateX(builder.getModel().leftLeg.xRot * -0.4)

            }
        }

    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/wall_climb_1', 'alienevo_aliens:vulpimancer', 2, (builder) => {
        const progress_wall = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:vulpimancer', 'surface_climb_1', builder.getPartialTicks());
        if (progress_wall > 0.0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(15)
                .animate('easeInOutSine', progress_wall);
            builder.get('left_arm')
                .setXRotDegrees(-25)
                .animate('easeInOutSine', progress_wall);
            builder.get('right_leg')
                .setXRotDegrees(-25)
                .translateZ(-2)
                .animate('easeInOutSine', progress_wall);
            builder.get('left_leg')
                .setXRotDegrees(25)
                .translateZ(2)
                .animate('easeInOutSine', progress_wall);
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/wall_climb_2', 'alienevo_aliens:vulpimancer', 2, (builder) => {
        const progress_wall = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:vulpimancer', 'surface_climb_2', builder.getPartialTicks());
        if (progress_wall > 0.0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-25)
                .animate('easeInOutSine', progress_wall);
            builder.get('left_arm')
                .setXRotDegrees(15)
                .animate('easeInOutSine', progress_wall);
            builder.get('right_leg')
                .setXRotDegrees(25)
                .translateZ(2)
                .animate('easeInOutSine', progress_wall);
            builder.get('left_leg')
                .setXRotDegrees(-25)
                .translateZ(-2)
                .animate('easeInOutSine', progress_wall);
        }
    });
});
