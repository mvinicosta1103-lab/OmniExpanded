PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('bob/ghost', 'alienevo_aliens:ectonurite', 200, (builder) => {
        let ectonurite_bob = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo_aliens:ectonurite', 'bob_fly', builder.getPartialTicks());
        if (ectonurite_bob > 0.0) {
            if (builder.isFirstPerson()) {
                builder.get('left_arm')
                    .translateX(12)
                    .translateY(-5)
                    .translateZ(-9)
                    .setYRotDegrees(-40)
                    .setZRotDegrees(45)
                builder.get('right_arm')
                    .translateX(-12)
                    .translateY(-5)
                    .translateZ(-9)
                    .setYRotDegrees(40)
                    .setZRotDegrees(-45)
            } else {
                builder.get('left_arm')
                    .rotateX((builder.getModel().leftArm.xRot * -0.8))
                builder.get('right_arm')
                    .rotateX((builder.getModel().rightArm.xRot * -0.8))
                if (builder.getPlayer().isCrouching()) {
                    builder.get('chest')
                        .setXRotDegrees(15)
                    builder.get('head')
                        .moveZ(-0.33)
                        .moveY(0.4)
                }
            }
        }
    });
});