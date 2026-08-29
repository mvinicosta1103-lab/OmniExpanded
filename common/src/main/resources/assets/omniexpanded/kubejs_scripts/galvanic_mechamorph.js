PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('galvanic/aim', 'alienevo_aliens:galvanic_mechamorph', 200, (builder) => {
        let animation = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:galvanic_mechamorph', 'punch_righthand', builder.getPartialTicks());
        if (animation > 0) {
            if (!builder.isFirstPerson()) {
                builder.get('right_arm')
                    .setXRotDegrees(-105)
                    .setYRotDegrees(0)
                    .scaleX(1.5)
                    .scaleY(5)
                    .scaleZ(1.5)
                    .animate('easeInQuart', animation);
            }
            if (builder.isFirstPerson()) {
                builder.get('right_arm')
                    .setXRotDegrees(0)
                    .setYRotDegrees(0)
                    .setZRotDegrees(-15)
                    .setY(-5)
                    .scaleY(2)
                    .animate('easeInQuart', animation);
            }
        }
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:galvanic_mechamorph", "punch_lefthand")) {
            let animation = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:galvanic_mechamorph', 'punch_lefthand', builder.getPartialTicks());
            if (animation > 0) {
                if (!builder.isFirstPerson()) {
                    builder.get('left_arm')
                        .setXRotDegrees(-105)
                        .setYRotDegrees(0)
                        .scaleX(1.5)
                        .scaleY(5)
                        .scaleZ(1.5)
                        .animate('easeInQuart', animation);
                }
                if (builder.isFirstPerson()) {
                    builder.get('left_arm')
                        .setXRotDegrees(0)
                        .setYRotDegrees(0)
                        .setZRotDegrees(-15)
                        .setY(-5)
                        .scaleY(2)
                        .animate('easeInQuart', animation);
                }
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('puddle_walk', 'alienevo_aliens:galvanic_mechamorph', 200, (builder) => {
        let animation = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo_aliens:galvanic_mechamorph', 'puddle_walk', builder.getPartialTicks()
        );
        if (animation > 0.0) {
            builder.get('chest')
                .scaleX((builder.getModel().leftArm.xRot * 0.2 + 1))
                .scaleZ((-builder.getModel().leftArm.xRot * 0.2 + 1))
            if (builder.getPlayer().isCrouching()) {
                builder.get('chest')
                    .setXRotDegrees(0)
                    .setY(0)
            }
        }
    }
    );
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('galvanic_mechamorph_anim', 'alienevo_aliens:galvanic_mechamorph', 10, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), 'alienevo_aliens:galvanic_mechamorph', 'galvanic_mechamorph_loop')) {
            if (builder.isFirstPerson()) {
            } else {
                if (builder.getPlayer().isCrouching()) {
                    builder.get('body')
                        .setY(3)
                    builder.get('chest')
                        .setXRotDegrees(15)
                    builder.get('head')
                        .setZ(builder.getModel().head.z - 1)
                    builder.get('left_leg')
                        .setY(builder.getModel().leftLeg.y + 2)
                        .setZ(builder.getModel().leftLeg.z)
                    builder.get('right_leg')
                        .setY(builder.getModel().rightLeg.y + 2)
                        .setZ(builder.getModel().rightLeg.z)
                }

            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('galvanic/glide', 'alienevo_aliens:galvanic_mechamorph', 200, (builder) => {
        let animation = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:galvanic_mechamorph', 'glide_anim', builder.getPartialTicks());
        if (animation > 0) {
            if (!builder.isFirstPerson()) {
                builder.get('chest').scaleX(3).scaleY(1.5).scaleZ(0.5).setX(0).setY(0).setZ(0).setXRotDegrees(0).setYRotDegrees(0).setZRotDegrees(0).animate('easeInOutQuart', animation);
                builder.get('head').setX(0).setY(0).setZ(0).setXRotDegrees(15).animate('easeInOutQuart', animation);
                builder.get('body').setXRotDegrees(-70).animate('easeInOutQuart', animation);
                builder.get('right_arm').scaleX(0.5).scaleY(0.5).scaleZ(1).setX(-14).setY(3).setXRotDegrees(-22.5).setYRotDegrees(70).setZRotDegrees(80).animate('easeInOutQuart', animation);
                builder.get('left_arm').scaleX(0.5).scaleY(0.5).scaleZ(1).setX(14).setY(3).setXRotDegrees(-22.5).setYRotDegrees(-70).setZRotDegrees(-80).animate('easeInOutQuart', animation);
                builder.get('right_leg').scaleZ(0.5).scaleY(0.5).setX(-8).setY(20).setZ(-0.5).setXRotDegrees(0).setYRotDegrees(0).setZRotDegrees(25).animate('easeInOutQuart', animation);
                builder.get('left_leg').scaleZ(0.5).scaleY(0.5).setX(8).setY(20).setZ(-0.5).setXRotDegrees(0).setYRotDegrees(0).setZRotDegrees(-25).animate('easeInOutQuart', animation);
            }
            if (builder.isFirstPerson()) {
                builder.get('right_arm').scaleX(0.5).scaleY(0.5).animate('easeInOutQuart', animation);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('galvanic/puddle', 'alienevo_aliens:galvanic_mechamorph', 15, (builder) => {
        let animation = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:galvanic_mechamorph', 'puddle', builder.getPartialTicks(), 1, 7);
        if (animation > 0) {
            if (!builder.isFirstPerson()) {
                builder.get('body')
                    .scaleY(0.1)
                    .scaleZ(1.2)
                    .scaleX(1.2)
                    .animate('easeInOutQuart', animation);
                builder.get('right_arm')
                    .scaleX(0)
                    .scaleY(0)
                    .scaleZ(0)
                    .animate('easeInOutQuart', animation);
                builder.get('left_arm')
                    .scaleX(0)
                    .scaleY(0)
                    .scaleZ(0)
                    .animate('easeInOutQuart', animation);
            }
            if (builder.isFirstPerson()) {
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('galvanic/puddlef', 'alienevo_aliens:galvanic_mechamorph', 200, (builder) => {
        let animation = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:galvanic_mechamorph', 'puddle', builder.getPartialTicks(), 7, 8);
        if (animation > 0) {
            if (!builder.isFirstPerson()) {
                builder.get('body')
                    .scaleY(10)
                    .animate('easeInOutQuart', animation);
            }
            if (builder.isFirstPerson()) {
            }
        }
    });
});

PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/gallimbs', 'alienevo_aliens:galvanic_mechamorph', 15, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:galvanic_mechamorph", "galvanic_mechamorph_loop")) {
            if (!builder.isFirstPerson()) {
                builder.get('left_arm').rotateX(builder.getModel().leftArm.xRot * -0.1)
                builder.get('right_arm').rotateX(builder.getModel().rightArm.xRot * -0.1)
                builder.get('right_leg').rotateX(builder.getModel().rightLeg.xRot * -0.4)
                builder.get('left_leg').rotateX(builder.getModel().leftLeg.xRot * -0.4)
            }
        }
    });
});