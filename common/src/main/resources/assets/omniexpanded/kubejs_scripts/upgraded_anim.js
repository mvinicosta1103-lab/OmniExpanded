// Same easing helper prototype_anim.js uses. Kept local (instead of relying on
// script load order) so this file works standalone.
function easeOutElastic(t, bounciness) {
    var p = bounciness * 3.14159;
    var elasticIn = 1 - Math.pow(Math.cos(((1 - t) * 3.14159) / 2), 3) * Math.cos((1 - t) * p);
    return 1 - elasticIn;
}

PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('omniexpanded/activation_upgraded', 'omniexpanded:upgraded_omnitrix', 200, (builder) => {
        let activation = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'omniexpanded:upgraded_omnitrix', 'activate', builder.getPartialTicks());
        if (activation > 0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-118)
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
                .setXRotDegrees(-109)
                .setYRotDegrees(40)
                .setZRotDegrees(-39)
                .setX(12)
                .setY(9)
                .setZ(5)
                .animate('easeOutBack', activation);
            builder.get('right_arm')
                .setXRotDegrees(-79)
                .setYRotDegrees(-15)
                .setZRotDegrees(-8)
                .setX(-3.5)
                .setY(-1.6)
                .setZ(-2.1)
                .animate('easeOutBack', activation);
        }
    });
});

PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('omniexpanded/spin_left_upgraded', 'omniexpanded:upgraded_omnitrix', 200, (builder) => {
        let spin_right = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'omniexpanded:upgraded_omnitrix', 'spin_left', builder.getPartialTicks());
        if (spin_right > 0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-118 + 10)
                .animate('easeInOutQuad', spin_right);
        }
        if (spin_right > 0.0 && builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-79 + 8)
                .animate('easeInOutQuad', spin_right);
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('omniexpanded/spin_right_upgraded', 'omniexpanded:upgraded_omnitrix', 200, (builder) => {
        let spin_left = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'omniexpanded:upgraded_omnitrix', 'spin_right', builder.getPartialTicks());
        if (spin_left > 0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-118 - 10)
                .animate('easeInOutQuad', spin_left);
        }
        if (spin_left > 0.0 && builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-79 - 8)
                .animate('easeInOutQuad', spin_left);
        }
    });
});

// transform START

PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('omniexpanded/transform_left_r_1_upgraded', 'omniexpanded:upgraded_omnitrix', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "omniexpanded:upgraded_omnitrix", "transform")) {
            let transform_left_r_1 = animationUtil.getAnimationTimerAbilityValue(
                builder.getPlayer(), 'omniexpanded:upgraded_omnitrix', 'transform', builder.getPartialTicks(), 1, 11);

            if (transform_left_r_1 > 0 && !builder.isFirstPerson()) {
                let eased = easeOutElastic(transform_left_r_1, 1.5);
                builder.get('left_arm')
                    .setXRotDegrees(-124 + 20 * eased)
                    .setYRotDegrees(22 + 1 * eased)
                    .setZRotDegrees(-115 + 23 * eased);
            }
            if (transform_left_r_1 > 0 && builder.isFirstPerson()) {
                let eased = easeOutElastic(transform_left_r_1, 1.5);
                builder.get('left_arm')
                    .setXRotDegrees(-109 + 35 * eased)
                    .setYRotDegrees(40 - 6 * eased)
                    .setZRotDegrees(-39 + 10 * eased);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('omniexpanded/transform_left_t_1_upgraded', 'omniexpanded:upgraded_omnitrix', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "omniexpanded:upgraded_omnitrix", "transform")) {
            let transform_left_t_1 = animationUtil.getAnimationTimerAbilityValue(
                builder.getPlayer(), 'omniexpanded:upgraded_omnitrix', 'transform', builder.getPartialTicks(), 1, 13);

            if (transform_left_t_1 > 0 && !builder.isFirstPerson()) {
                let eased = easeOutElastic(transform_left_t_1, 1);
                builder.get('left_arm')
                    .moveZ(1 * eased);
            }
            if (transform_left_t_1 > 0 && builder.isFirstPerson()) {
                let eased = easeOutElastic(transform_left_t_1, 1);
                builder.get('left_arm')
                    .moveX(0 * eased)
                    .moveY(0 * eased)
                    .moveZ(1 * eased);
                // .setX(12 - 4 * eased)
                // .setY(9 - 3 * eased)
                // .setZ(5 + 3 * eased);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('omniexpanded/transform_left_r_2_upgraded', 'omniexpanded:upgraded_omnitrix', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "omniexpanded:upgraded_omnitrix", "transform")) {
            let transform_left_r_2 = animationUtil.getAnimationTimerAbilityValue(
                builder.getPlayer(), 'omniexpanded:upgraded_omnitrix', 'transform', builder.getPartialTicks(), 13, 18);
            if (transform_left_r_2 > 0 && !builder.isFirstPerson()) {
                builder.get('left_arm')
                    .setXRotDegrees(-124 - 20)
                    .setYRotDegrees(22)
                    .setZRotDegrees(-115)
                    .animate('easeInOutBack', transform_left_r_2);
            }
            if (transform_left_r_2 > 0 && builder.isFirstPerson()) {
                builder.get('left_arm')
                    .setXRotDegrees(-109 + 6)
                    .setYRotDegrees(40 + 5)
                    .setZRotDegrees(-39)
                    .animate('easeInOutBack', transform_left_r_2);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('omniexpanded/transform_left_t_2_upgraded', 'omniexpanded:upgraded_omnitrix', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "omniexpanded:upgraded_omnitrix", "transform")) {
            let transform_left_2 = animationUtil.getAnimationTimerAbilityValue(
                builder.getPlayer(), 'omniexpanded:upgraded_omnitrix', 'transform', builder.getPartialTicks(), 11, 18);
            if (transform_left_2 > 0 && !builder.isFirstPerson()) {
                builder.get('left_arm')
                    .moveX(0.5)
                    .moveZ(-1)
                    .animate('easeInOutBack', transform_left_2);
            }
            if (transform_left_2 > 0 && builder.isFirstPerson()) {
                builder.get('left_arm')
                    .setX(12 - 1)
                    .setY(9 - 2)
                    .setZ(5 - 2)
                    .animate('easeInOutBack', transform_left_2);
            }
        }
    });
});

PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('omniexpanded/transform_right_r_1_upgraded', 'omniexpanded:upgraded_omnitrix', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "omniexpanded:upgraded_omnitrix", "transform")) {
            let transform_right_r_1 = animationUtil.getAnimationTimerAbilityValue(
                builder.getPlayer(), 'omniexpanded:upgraded_omnitrix', 'transform', builder.getPartialTicks(), 1, 12);

            if (transform_right_r_1 > 0 && !builder.isFirstPerson()) {
                let eased = easeOutElastic(transform_right_r_1, 1);
                builder.get('right_arm')
                    .setXRotDegrees(-118 + 4 * eased)
                    .setYRotDegrees(-38 + 63 * eased)
                    .setZRotDegrees(57 - 27 * eased);
            }
            if (transform_right_r_1 > 0 && builder.isFirstPerson()) {
                let eased = easeOutElastic(transform_right_r_1, 1.5);
                builder.get('right_arm')
                    .setXRotDegrees(-79 + 36 * eased)
                    .setYRotDegrees(-15 + 39 * eased)
                    .setZRotDegrees(-8 + 40 * eased);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('omniexpanded/transform_right_t_1_upgraded', 'omniexpanded:upgraded_omnitrix', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "omniexpanded:upgraded_omnitrix", "transform")) {
            let transform_right_t_1 = animationUtil.getAnimationTimerAbilityValue(
                builder.getPlayer(), 'omniexpanded:upgraded_omnitrix', 'transform', builder.getPartialTicks(), 1, 13);
            if (transform_right_t_1 > 0 && !builder.isFirstPerson()) {
                let eased = easeOutElastic(transform_right_t_1, 1);
                builder.get('right_arm')
                    .moveY(-1 * eased);
            }
            if (transform_right_t_1 > 0 && builder.isFirstPerson()) {
                let eased = easeOutElastic(transform_right_t_1, 1);
                builder.get('right_arm')
                    .setX(-3.5 - 2 * eased)
                    .setY(-1.6 + 7 * eased)
                    .setZ(-2.1 - 3 * eased);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('omniexpanded/transform_right_r_2_upgraded', 'omniexpanded:upgraded_omnitrix', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "omniexpanded:upgraded_omnitrix", "transform")) {
            let transform_right_r_2 = animationUtil.getAnimationTimerAbilityValue(
                builder.getPlayer(), 'omniexpanded:upgraded_omnitrix', 'transform', builder.getPartialTicks(), 13, 19);
            if (transform_right_r_2 > 0 && !builder.isFirstPerson()) {
                builder.get('right_arm')
                    .setXRotDegrees(-118 - 3)
                    .setYRotDegrees(-38 + 20)
                    .setZRotDegrees(57 + 7)
                    .animate('easeInOutBack', transform_right_r_2);
            }
            if (transform_right_r_2 > 0 && builder.isFirstPerson()) {
                builder.get('right_arm')
                    .setXRotDegrees(-79 + 15)
                    .setYRotDegrees(-15 + 5)
                    .setZRotDegrees(-8 + 2)
                    .animate('easeInOutBack', transform_right_r_2);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('omniexpanded/transform_right_t_2_upgraded', 'omniexpanded:upgraded_omnitrix', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "omniexpanded:upgraded_omnitrix", "transform")) {
            let transform_right_t_2 = animationUtil.getAnimationTimerAbilityValue(
                builder.getPlayer(), 'omniexpanded:upgraded_omnitrix', 'transform', builder.getPartialTicks(), 11, 19);
            if (transform_right_t_2 > 0 && !builder.isFirstPerson()) {
                builder.get('right_arm')
                    .moveX(0.45)
                    .moveY(1)
                    .moveZ(-1)
                    .animate('easeInOutBack', transform_right_t_2);
            }
            if (transform_right_t_2 > 0 && builder.isFirstPerson()) {
                builder.get('right_arm')
                    .setX(-3.5 - 1)
                    .setY(-1.6)
                    .setZ(-2.1 - 1.5)
                    .animate('easeInOutBack', transform_right_t_2);
            }
        }
    });
});

// transform END

PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('omniexpanded/settings_upgraded', 'omniexpanded:upgraded_omnitrix', 200, (builder) => {
        let settings = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'omniexpanded:upgraded_omnitrix', 'settings_menu', builder.getPartialTicks());
        if (settings > 0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-118)
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
                .setYRotDegrees(-17)
                .setZRotDegrees(-8)
                .setX(-3.5)
                .setY(-1.6)
                .setZ(-1.9)
                .animate('easeOutBack', settings);
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('omniexpanded/spin_lefts_upgraded', 'omniexpanded:upgraded_omnitrix', 200, (builder) => {
        let spin_right = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'omniexpanded:upgraded_omnitrix', 'spinl_settings', builder.getPartialTicks());
        if (spin_right > 0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-118 + 10)
                .animate('easeInOutQuad', spin_right);
        }
        if (spin_right > 0.0 && builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-70)
                .animate('easeInOutQuad', spin_right);
        }
    });
});

PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('omniexpanded/spin_rights_upgraded', 'omniexpanded:upgraded_omnitrix', 200, (builder) => {
        let spin_left = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'omniexpanded:upgraded_omnitrix', 'spin_right_settings', builder.getPartialTicks());
        if (spin_left > 0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-118 - 10)
                .animate('easeInOutQuad', spin_left);
        }
        if (spin_left > 0.0 && builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-90)
                .animate('easeInOutQuad', spin_left);
        }
    });
});

PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('omniexpanded/spin_right_playlist_upgraded', 'omniexpanded:upgraded_omnitrix', 200, (builder) => {
        let spin_left = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'omniexpanded:upgraded_omnitrix', 'spin_right_playlist', builder.getPartialTicks());
        if (spin_left > 0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-118 - 10)
                .animate('easeInOutQuad', spin_left);
        }
        if (spin_left > 0.0 && builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-90)
                .animate('easeInOutQuad', spin_left);
        }
    });
});

PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('omniexpanded/activation_quick_upgraded', 'omniexpanded:upgraded_omnitrix', 200, (builder) => {
        let activation = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'omniexpanded:upgraded_omnitrix', 'activate_quick', builder.getPartialTicks());
        if (activation > 0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-118)
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
                .setXRotDegrees(-109)
                .setYRotDegrees(40)
                .setZRotDegrees(-39)
                .setX(12)
                .setY(9)
                .setZ(5)
                .animate('easeOutBack', activation);
            builder.get('right_arm')
                .setXRotDegrees(-79)
                .setYRotDegrees(-16)
                .setZRotDegrees(-8)
                .setX(-3.5)
                .setY(-1.6)
                .setZ(-2.1)
                .animate('easeOutBack', activation);
        }
    });
});