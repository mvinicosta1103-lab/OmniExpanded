PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('pyronite_anim', 'alienevo_aliens:pyronite', 10, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), 'alienevo_aliens:pyronite', 'pyronite_loop')) {
            if (builder.isFirstPerson()) {
                builder.get('left_arm').moveX(-2).scaleX(1.2).scaleY(1.2).scaleZ(1.2)
                builder.get('right_arm').moveX(2).scaleX(1.2).scaleY(1.2).scaleZ(1.2)
            }
            if (!builder.isFirstPerson()) {
                builder.get('left_arm').rotateX(builder.getModel().leftArm.xRot * -0.2)
                builder.get('right_arm').rotateX(builder.getModel().rightArm.xRot * -0.2)
                builder.get('right_leg').rotateX(builder.getModel().rightLeg.xRot * -0.4)
                builder.get('left_leg').rotateX(builder.getModel().leftLeg.xRot * -0.4)
            }
            if (builder.getPlayer().isCrouching() && !builder.isFirstPerson()) {
                builder.get('body')
                    .setY(1)
                builder.get('chest')
                    .setXRotDegrees(22)
                    .setY(builder.getModel().head.y - 1)
                builder.get('head')
                    .setY(builder.getModel().head.y - 1)
                    .setZ(builder.getModel().head.z - 1)
                builder.get('left_arm')
                    .setY(builder.getModel().leftArm.y - 1)
                builder.get('right_arm')
                    .setY(builder.getModel().rightArm.y - 1)
            }

        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/surf', 'alienevo_aliens:pyronite', 200, (builder) => {
        let surf = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo_aliens:pyronite', 'pyro_surf_anim', builder.getPartialTicks());
        if (surf > 0 && !builder.isFirstPerson()) {
            builder.get('head')
                .setX(0)
                .setY(0)
                .setZ(0)
                .setYRotDegrees(-22.5)
                .animate('InOutCubic', surf);
            builder.get('chest')
                .setX(0)
                .setY(0)
                .setZ(0)
                .setYRotDegrees(-90)
                .setXRotDegrees(0)
                .setZRotDegrees(0)
                .animate('InOutCubic', surf);
            builder.get('right_arm')
                .setX(0.25)
                .setY(2)
                .setZ(-4.75)
                .setXRotDegrees(-90)
                .setYRotDegrees(-45)
                .setZRotDegrees(90)
                .animate('InOutCubic', surf);
            builder.get('left_arm')
                .setX(0)
                .setY(2)
                .setZ(5)
                .setXRotDegrees(90)
                .setYRotDegrees(-45)
                .setZRotDegrees(-90)
                .animate('InOutCubic', surf);
            builder.get('right_leg')
                .setX(0.10000000000000009)
                .setY(12)
                .setZ(-2.50)
                .setYRotDegrees(-112.5)
                .rotateX(builder.getModel().rightLeg.xRot * -1)
                .animate('InOutCubic', surf);
            builder.get('left_leg')
                .setX(-0.10000000000000009)
                .setY(12)
                .setZ(2)
                .setYRotDegrees(-90)
                .rotateX(builder.getModel().leftLeg.xRot * -1)
                .animate('InOutCubic', surf);
            builder.get('body')
                .setXRotDegrees(-20)
                .animate('InOutCubic', surf);
        }
        if (surf > 0.0 && builder.isFirstPerson()) {
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/tornado', 'alienevo_aliens:pyronite', 200, (builder) => {
        let tornado = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo_aliens:pyronite', 'spin_timer', builder.getPartialTicks());
        if (tornado > 0 && !builder.isFirstPerson()) {
            builder.get('body').rotateYDegrees(-720).animate('InOutCubic', tornado);
        }
        if (tornado > 0.0 && builder.isFirstPerson()) {
        }
    });
});
ClientEvents.tick(event => {
    if (abilityUtil.hasPower(event.player, "alienevo_aliens:pyronite")) {
        const spinEnabled = abilityUtil.isEnabled(event.player, "alienevo_aliens:pyronite", "spin_timer");
        const leapEnabled = abilityUtil.isEnabled(event.player, "alienevo_aliens:pyronite", "leap");
        if (spinEnabled || leapEnabled) {
            let mode = Client.options.getCameraType();
            if (mode !== 'third_person_back' && mode !== 'third_person_front') {
                event.player.persistentData.camera_reset = 1;
                Client.options.setCameraType('third_person_back');
            }
        }
        let end = event.player.persistentData.camera_reset;
        if (!spinEnabled && !leapEnabled && end === 1) {
            event.player.persistentData.camera_reset = 0;
            Client.options.setCameraType('first_person');
        }
    }
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/nova', 'alienevo_aliens:pyronite', 200, (builder) => {
        let nova = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo_aliens:pyronite', 'fire_nova', builder.getPartialTicks());
        if (nova > 0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setX(-5)
                .setY(2)
                .setZ(0)
                .setZRotDegrees(67.5)
                .animate('InOutCubic', nova);
            builder.get('left_arm')
                .setX(5)
                .setY(2)
                .setZ(0)
                .setZRotDegrees(-67.5)
                .animate('InOutCubic', nova);
            builder.get('right_leg')
                .setX(-1.9)
                .setY(12)
                .setZ(0)
                .setZRotDegrees(22.5)
                .animate('InOutCubic', nova);
            builder.get('left_leg')
                .setX(1.9)
                .setY(12)
                .setZ(0)
                .setZRotDegrees(-22.5)
                .animate('InOutCubic', nova);
        }
        if (nova > 0.0 && builder.isFirstPerson()) {
        }
    });
});
