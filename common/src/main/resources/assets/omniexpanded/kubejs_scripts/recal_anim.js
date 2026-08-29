PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/recal_activation', 'alienevo:recal_omnitrix', 200, (builder) => {
        let activation = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo:recal_omnitrix', 'activate', builder.getPartialTicks());
        if (activation > 0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-116)
                .setYRotDegrees(-38)
                .setZRotDegrees(57)
                .setX(-5 - 0.45)
                .setY(2 + 1.6)
                .setZ(0 + 0.675)
                .animate('easeOutBack', activation);
            builder.get('left_arm')
                .setXRotDegrees(-124)
                .setYRotDegrees(22)
                .setZRotDegrees(-115)
                .setX(5 + 1)
                .setY(2 + 2)
                .setZ(0 - 1.5)
                .animate('easeOutBack', activation);
        }
        if (activation > 0.0 && builder.isFirstPerson()) {
            builder.get('left_arm')
                .setXRotDegrees(-109 + 30)
                .setYRotDegrees(39)
                .setZRotDegrees(-39 + 58)
                .setX(12 - 3 + 1)
                .setY(9 - 3 - 2)
                .setZ(5 + 1 - 1)
                .animate('easeOutBack', activation);
            builder.get('right_arm')
                .setXRotDegrees(-77)
                .setYRotDegrees(-16 - 6)
                .setZRotDegrees(-8 - 12)
                .setX(-3.5 - 1.8)
                .setY(-1.6 + 0.8)
                .setZ(-2.1 - 0.7 + 1.2)

                .animate('easeOutBack', activation);
        }
    });
});

PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/recal_spin_left', 'alienevo:recal_omnitrix', 200, (builder) => {
        let spin_right = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo:recal_omnitrix', 'spin_left', builder.getPartialTicks());
        if (spin_right > 0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-116 + 10)
                .animate('InOutCubic', spin_right);
        }
        if (spin_right > 0.0 && builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-77 + 6)
                .animate('InOutCubic', spin_right);
        }
    });
});

PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/recal_spin_right', 'alienevo:recal_omnitrix', 200, (builder) => {
        let spin_left = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo:recal_omnitrix', 'spin_right', builder.getPartialTicks());
        if (spin_left > 0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-116 - 10)
                .animate('InOutCubic', spin_left);
        }
        if (spin_left > 0.0 && builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-77 - 6)
                .animate('InOutCubic', spin_left);
        }
    });
});

PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/recal_transform', 'alienevo:recal_omnitrix', 200, (builder) => {
        let transform = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo:recal_omnitrix', 'transform', builder.getPartialTicks(), 1, 7);
        if (transform > 0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-110)
                .setYRotDegrees(15)
                .setZRotDegrees(33)
                .setX(-5 - 0.2)
                .setY(2 + 1.1)
                .setZ(0 + 1.2)
                .animate('easeInOutExpo', transform);
        }
        if (transform > 0.0 && builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-79 + 8)
                .setYRotDegrees(-6 + 14 + 10)
                .setZRotDegrees(-8 + 3)
                .animate('easeInOutExpo', transform);
        }
    });
});

PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/recal_transform_slam', 'alienevo:recal_omnitrix', 200, (builder) => {
        let transform = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo:recal_omnitrix', 'transform', builder.getPartialTicks(), 1, 11);
        if (transform > 0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setZ(0)
                .animate('easeInBack', transform);
            builder.get('left_arm')
                .setXRotDegrees(-129)
                .setYRotDegrees(18)
                .setZRotDegrees(-121)
                .setX(5 + 0.8)
                .setY(2 + 2)
                .setZ(0 - 1.5)
                .animate('easeInOutSine', transform);
        }
        if (transform > 0.0 && builder.isFirstPerson()) {
            builder.get('right_arm')
                .setZ(-1.7 - 2)
                .animate('easeInBack', transform);
        }
    });
});

PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/recal_transform_slam_2', 'alienevo:recal_omnitrix', 200, (builder) => {
        let transform = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo:recal_omnitrix', 'transform', builder.getPartialTicks(), 7, 12);
        if (transform > 0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-118)
                .setYRotDegrees(-23)
                .setZRotDegrees(64)
                .setX(-5 + 1)
                .setY(2 + 1.1)
                .setZ(0 - 1.3)
                .animate('easeInOutSine', transform);
        }
        if (transform > 0.0 && builder.isFirstPerson()) {
            builder.get('right_arm')
                .setYRotDegrees(-16 + 5)
                .setZ(-1.7 - 4)
                .animate('easeInOutSine', transform);
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/recal_settings', 'alienevo:recal_omnitrix', 200, (builder) => {
        let settings = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo:recal_omnitrix', 'settings_menu', builder.getPartialTicks());
        if (settings > 0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-116)
                .setYRotDegrees(-38)
                .setZRotDegrees(57)
                .setX(-5 - 0.45)
                .setY(2 + 1.6)
                .setZ(0 + 0.675)
                .animate('easeOutBack', settings);
            builder.get('left_arm')
                .setXRotDegrees(-124)
                .setYRotDegrees(22)
                .setZRotDegrees(-115)
                .setX(5 + 1)
                .setY(2 + 2)
                .setZ(0 - 1.5)
                .animate('easeOutBack', settings);
        }
        if (settings > 0.0 && builder.isFirstPerson()) {
            builder.get('left_arm')
                .setXRotDegrees(-109)
                .setYRotDegrees(40)
                .setZRotDegrees(-39)
                .setX(12)
                .setY(9)
                .setZ(5)
                .animate('easeOutBack', settings);
            builder.get('right_arm')
                .setXRotDegrees(-79)
                .setYRotDegrees(-16)
                .setZRotDegrees(-8)
                .setX(-2.8)
                .setY(-1.6)
                .setZ(-1.7)
                .animate('easeOutBack', settings);
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/recal_spin_lefts', 'alienevo:recal_omnitrix', 200, (builder) => {
        let spin_right = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo:recal_omnitrix', 'spin_left_settings', builder.getPartialTicks());
        if (spin_right > 0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-116 + 10)
                .animate('InOutCubic', spin_right);
        }
        if (spin_right > 0.0 && builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-70)
                .animate('InOutCubic', spin_right);
        }
    });
});

PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/recal_spin_rights', 'alienevo:recal_omnitrix', 200, (builder) => {
        let spin_left = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo:recal_omnitrix', 'spin_right_settings', builder.getPartialTicks());
        if (spin_left > 0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-116 - 10)
                .animate('InOutCubic', spin_left);
        }
        if (spin_left > 0.0 && builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-90)
                .animate('InOutCubic', spin_left);
        }
    });
});

PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/recal_spin_right_playlist', 'alienevo:recal_omnitrix', 200, (builder) => {
        let spin_left = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo:recal_omnitrix', 'spin_right_playlist', builder.getPartialTicks());
        if (spin_left > 0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-116 - 10)
                .animate('InOutCubic', spin_left);
        }
        if (spin_left > 0.0 && builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-90)
                .animate('InOutCubic', spin_left);
        }
    });
});


