PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('kryp/slam', 'alienevo:kryptonian', 200, (builder) => {
        let kryp_slam = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo:kryptonian', 'kryp_slam', builder.getPartialTicks(), 8, 16);
        builder.get('body')
            .animate('easeOutCubic', kryp_slam);
        builder.get('head')
            .setX(0)
            .setY(2.25)
            .setZ(-3)
            .rotateXDegrees(10)
            .animate('easeOutCubic', kryp_slam);
        builder.get('body')
            .setY(-3)
            .animate('easeOutCubic', kryp_slam);
        builder.get('chest')
            .setX(0)
            .setY(2)
            .setZ(-3)
            .setXRotDegrees(20)
            .animate('easeOutCubic', kryp_slam);
        builder.get('right_arm')
            .setX(-5)
            .setY(5)
            .setZ(-3)
            .setXRotDegrees(-20)
            .setYRotDegrees(-23)
            .setZRotDegrees(19)
            .animate('easeOutCubic', kryp_slam);
        builder.get('left_arm')
            .setX(5)
            .setY(5)
            .setZ(-3)
            .setXRotDegrees(-20)
            .setYRotDegrees(23)
            .setZRotDegrees(-19)
            .animate('easeOutCubic', kryp_slam);
        builder.get('right_leg')
            .setX(-1.9)
            .setY(12)
            .setZ(-4)
            .setXRotDegrees(75)
            .animate('easeOutCubic', kryp_slam);
        builder.get('left_leg')
            .setX(1.9)
            .setY(7)
            .setZ(-3)
            .setXRotDegrees(10)
            .animate('easeOutCubic', kryp_slam);
        if (kryp_slam > 0.0 && builder.isFirstPerson()) {
            builder.get('right_arm')
                .setY(10)
                .setX(15)
                .setZ(15)
                .setXRotDegrees(0)
                .setZRotDegrees(-15)
                .setYRotDegrees(-15)
                .translateZ(20)
                .translateX(30)
                .translateY(-2)
                .animate('easeOutCubic', kryp_slam);
            builder.get('left_arm')
                .setY(10)
                .setX(-15)
                .setZ(15)
                .setXRotDegrees(0)
                .setZRotDegrees(15)
                .setYRotDegrees(15)
                .translateZ(20)
                .translateX(-30)
                .translateY(-2)
                .animate('easeOutCubic', kryp_slam);
        }
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo:kryptonian", "kryp_slam")) {
            kryp_slam = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo:kryptonian', 'kryp_slam', builder.getPartialTicks(), 1, 7);
            if (kryp_slam > 0.0 && !builder.isFirstPerson()) {
                builder.get('right_arm')
                    .setXRotDegrees(-150)
                    .setZRotDegrees(-5)
                    .animate('easeOutCubic', kryp_slam);
                builder.get('left_arm')
                    .setXRotDegrees(-150)
                    .setZRotDegrees(5)
                    .animate('easeOutCubic', kryp_slam);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('kryp/aim', 'alienevo:kryptonian', 200, (builder) => {
        let animation = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo:kryptonian', 'punch_righthand', builder.getPartialTicks());
        if (animation > 0) {
            if (!builder.isFirstPerson()) {
                builder.get('right_arm')
                    .setZ(4)
                    .setXRotDegrees(-100)
                    .setYRotDegrees(0)
                    .setZRotDegrees(0)
                    .animate('easeOutCubic', animation);
                builder.get('left_arm')
                    .setXRotDegrees(-26)
                    .setYRotDegrees(-5)
                    .setZRotDegrees(5)
                    .animate('easeOutCubic', animation);
                builder.get('body')
                    .rotateYDegrees(-45)
                    .animate('easeOutCubic', animation);
                builder.get('head')
                    .rotateYDegrees(-45)
                    .animate('easeOutCubic', animation);
            }
            if (builder.isFirstPerson()) {
                builder.get('right_arm')
                    .setY(-4)
                    .animate('easeOutCubic', animation);
            }
        }
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo:kryptonian", "punch_lefthand")) {
            let animation = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo:kryptonian', 'punch_lefthand', builder.getPartialTicks());
            if (animation > 0) {
                if (!builder.isFirstPerson()) {
                    builder.get('right_arm')
                        .setXRotDegrees(-26)
                        .setYRotDegrees(5)
                        .setZRotDegrees(-5)
                        .animate('easeOutCubic', animation);
                    builder.get('left_arm')
                        .setXRotDegrees(-100)
                        .setZ(0)
                        .animate('easeOutCubic', animation);
                    builder.get('body')
                        .rotateYDegrees(45)
                        .animate('easeOutCubic', animation);
                    builder.get('head')
                        .rotateYDegrees(45)
                        .animate('easeOutCubic', animation);
                }
                if (builder.isFirstPerson()) {
                    builder.get('left_arm')
                        .setY(-4)
                        .animate('easeOutCubic', animation);
                }
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/thunder_clap', 'alienevo:kryptonian', 15, (builder) => {
        let sonic_clap = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo:kryptonian', 'thunder_clap', builder.getPartialTicks());
        if (sonic_clap > 0 && !builder.isFirstPerson()) {
            builder.get('left_arm')
                .setXRotDegrees(-90)
                .setYRotDegrees(45)
                .setZRotDegrees(-0)
                .animate('easeInOutQuint', sonic_clap);
            builder.get('right_arm')
                .setXRotDegrees(-90)
                .setYRotDegrees(-45)
                .setZRotDegrees(0)
                .animate('easeInOutQuint', sonic_clap);
        }
        if (sonic_clap > 0.0 && builder.isFirstPerson()) {
            builder.get('left_arm')
                .setXRotDegrees(-55)
                .setYRotDegrees(15)
                .setZRotDegrees(5)
                .animate('easeInOutQuint', sonic_clap);
            builder.get('right_arm')
                .setXRotDegrees(-55)
                .setYRotDegrees(-15)
                .setZRotDegrees(-5)
                .animate('easeInOutQuint', sonic_clap);
        } else {
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/punch_barrage_1', 'alienevo:kryptonian', 200, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo:kryptonian", "barrage_1")) {
            if (!builder.isFirstPerson()) {
                const halfPi = 1.57079632679;
                builder.get('left_arm')
                    .setXRot(builder.getModel().head.xRot - halfPi)
                    .setYRot(builder.getModel().head.yRot)
                    .setZRot(builder.getModel().head.zRot)
                    .translateZ(2)
                    .translateY(4)
                    .translateX(6);
                builder.get('right_arm')
                    .setXRot(builder.getModel().head.xRot - halfPi)
                    .setYRot(builder.getModel().head.yRot)
                    .setZRot(builder.getModel().head.zRot)
                    .translateZ(-5)
                    .translateY(-2)
                    .translateX(-6);
            }
            if (builder.isFirstPerson()) {
                builder.get('right_arm').setXRotDegrees(-8.5).setYRotDegrees(-32.5).setZRotDegrees(-33).setY(-4).setX(-4).setZ(2);
                builder.get('left_arm').setXRotDegrees(-8.5).setYRotDegrees(32.5).setZRotDegrees(33).setY(1).setX(5).setZ(4);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/punch_barrage_2', 'alienevo:kryptonian', 200, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo:kryptonian", "barrage_2")) {
            if (!builder.isFirstPerson()) {
                const halfPi = 1.57079632679;
                builder.get('left_arm')
                    .setXRot(builder.getModel().head.xRot - halfPi)
                    .setYRot(builder.getModel().head.yRot)
                    .setZRot(builder.getModel().head.zRot)
                    .translateZ(-5)
                    .translateY(-2)
                    .translateX(6);
                builder.get('right_arm')
                    .setXRot(builder.getModel().head.xRot - halfPi)
                    .setYRot(builder.getModel().head.yRot)
                    .setZRot(builder.getModel().head.zRot)
                    .translateZ(2)
                    .translateY(4)
                    .translateX(-6);
            }
            if (builder.isFirstPerson()) {
                builder.get('right_arm').setXRotDegrees(-8.5).setYRotDegrees(-32.5).setZRotDegrees(-33).setY(1).setX(-4).setZ(2);
                builder.get('left_arm').setXRotDegrees(-8.5).setYRotDegrees(32.5).setZRotDegrees(33).setY(-4).setX(5).setZ(4);
            }
        }
    });
});

PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/punch_barrage_3', 'alienevo:kryptonian', 200, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo:kryptonian", "barrage_3")) {
            if (!builder.isFirstPerson()) {
                const halfPi = 1.57079632679;
                builder.get('left_arm')
                    .setXRot(builder.getModel().head.xRot - halfPi)
                    .setYRot(builder.getModel().head.yRot)
                    .setZRot(builder.getModel().head.zRot)
                    .translateZ(2)
                    .translateY(4)
                    .translateX(6);
                builder.get('right_arm')
                    .setXRot(builder.getModel().head.xRot - halfPi)
                    .setYRot(builder.getModel().head.yRot)
                    .setZRot(builder.getModel().head.zRot)
                    .translateZ(-5)
                    .translateY(-2)
                    .translateX(-6);
            }
            if (builder.isFirstPerson()) {
                builder.get('right_arm').setXRotDegrees(-8.5).setYRotDegrees(-32.5).setZRotDegrees(-33).setY(-4).setX(-4).setZ(2);
                builder.get('left_arm').setXRotDegrees(-8.5).setYRotDegrees(32.5).setZRotDegrees(33).setY(1).setX(5).setZ(4);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/punch_barrage_4', 'alienevo:kryptonian', 200, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo:kryptonian", "barrage_4")) {
            if (!builder.isFirstPerson()) {
                const halfPi = 1.57079632679;
                builder.get('left_arm')
                    .setXRot(builder.getModel().head.xRot - halfPi)
                    .setYRot(builder.getModel().head.yRot)
                    .setZRot(builder.getModel().head.zRot)
                    .translateZ(-5)
                    .translateY(-2)
                    .translateX(6);
                builder.get('right_arm')
                    .setXRot(builder.getModel().head.xRot - halfPi)
                    .setYRot(builder.getModel().head.yRot)
                    .setZRot(builder.getModel().head.zRot)
                    .translateZ(2)
                    .translateY(4)
                    .translateX(-6);
            }
            if (builder.isFirstPerson()) {
                builder.get('right_arm').setXRotDegrees(-8.5).setYRotDegrees(-32.5).setZRotDegrees(-33).setY(1).setX(-4).setZ(2);
                builder.get('left_arm').setXRotDegrees(-8.5).setYRotDegrees(32.5).setZRotDegrees(33).setY(-4).setX(5).setZ(4);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/takeoff', 'alienevo:kryptonian', 15, (builder) => {
        let block_anim = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo:kryptonian', 'leap', builder.getPartialTicks());
        if (block_anim > 0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-85)
                .setYRotDegrees(-80)
                .setZRotDegrees(-70)
                .animate('InOutCubic', block_anim);

            builder.get('left_arm')
                .setXRotDegrees(-85)
                .setYRotDegrees(80)
                .setZRotDegrees(70)
                .animate('InOutCubic', block_anim);
        }
        if (block_anim > 0.0 && builder.isFirstPerson()) {
            builder.get('right_arm').setXRotDegrees(-55).setYRotDegrees(15).setZRotDegrees(0).setY(1).setZ(-3).animate('InOutCubic', block_anim);
            builder.get('left_arm').setXRotDegrees(-55).setYRotDegrees(-15).setZRotDegrees(0).setY(1).setZ(-3).animate('InOutCubic', block_anim);
        } else {
        }
    });
});