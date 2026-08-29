PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('lepidopterran_anim', 'alienevo_aliens:lepidopterran', 10, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), 'alienevo_aliens:lepidopterran', 'lepidopterran_loop')) {
            if (!builder.isFirstPerson()) {
                builder.get('left_arm').rotateX((builder.getModel().leftArm.xRot * -0.75))
                builder.get('head').rotateY((builder.getModel().head.yRot * -0.5))
                builder.get('right_arm').rotateX((builder.getModel().rightArm.xRot * -0.75))
                builder.get('left_leg').setXRotDegrees(0).rotateY(-1.25 + Math.cos(builder.getModel().rightLeg.xRot * 0.7)).rotateZ(-builder.getModel().leftLeg.xRot * 0.05)
                builder.get('right_leg').setXRotDegrees(0).rotateY(1.25 + -Math.cos(builder.getModel().rightLeg.xRot * 0.7)).rotateZ(-builder.getModel().rightLeg.xRot * 0.05)

                if (builder.getPlayer().isCrouching()) {
                    builder.get('right_leg').setY(builder.getModel().rightLeg.y - 2).setZ(builder.getModel().rightLeg.z - 1)
                    builder.get('left_leg').setY(builder.getModel().leftLeg.y - 2).setZ(builder.getModel().leftLeg.z - 1)
                }
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/slimerain', 'alienevo_aliens:lepidopterran', 200, (builder) => {
        let slime = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo_aliens:lepidopterran', 'slime_rain', builder.getPartialTicks());
        if (slime > 0 && !builder.isFirstPerson()) {
            builder.get('body').rotateYDegrees(-720).animate('easeInOutSine', slime);

        }
        if (slime > 0.0 && builder.isFirstPerson()) {


        }
    });
});
ClientEvents.tick(event => {
    if (abilityUtil.hasPower(event.player, "alienevo_aliens:lepidopterran")) {
        if (abilityUtil.isEnabled(event.player, "alienevo_aliens:lepidopterran", "slime_rain")) {
            let mode = Client.options.getCameraType();
            if (mode !== 'third_person_back' && mode !== 'third_person_front') {
                event.player.persistentData.camera_reset = 1;
                Client.options.setCameraType('third_person_back');
            }
        }

        let end = event.player.persistentData.camera_reset;
        if (!abilityUtil.isEnabled(event.player, "alienevo_aliens:lepidopterran", "slime_rain") && end === 1) {
            event.player.persistentData.camera_reset = 0;
            Client.options.setCameraType('first_person');
        }
    }
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('lep_anim', 'alienevo_aliens:lepidopterran', 10, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), 'alienevo_aliens:lepidopterran', 'lepidopterran_loop')) {
            if (builder.isFirstPerson()) {
                builder.get('left_arm')
                    .translateX(-5)
                    .translateY(0)
                    .translateZ(0)
                    .setYRotDegrees(-45)
                builder.get('right_arm')
                    .translateX(2)
                    .translateY(0)
                    .translateZ(0)
                    .setYRotDegrees(15)
                    .setXRotDegrees(20)
            }
        }
    });
});
