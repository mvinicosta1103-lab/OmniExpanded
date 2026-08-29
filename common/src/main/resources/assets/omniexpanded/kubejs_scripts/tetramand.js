PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('tetramand_anim', 'alienevo_aliens:tetramand', 10, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), 'alienevo_aliens:tetramand', 'tetramand_loop')) {
            if (builder.isFirstPerson()) {
                builder.get('left_arm')

                builder.get('right_arm')

            } else {
                if (builder.getPlayer().isCrouching()) {
                    builder.get('chest')
                        .setXRotDegrees(20)
                    builder.get('left_arm')
                        .setY(builder.getModel().leftArm.y - 1)
                        .setZ(builder.getModel().leftArm.z + 1.75)
                    builder.get('right_arm')
                        .setY(builder.getModel().rightArm.y - 1)
                        .setZ(builder.getModel().rightArm.z + 1.75)
                }

            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('earth/smash', 'alienevo_aliens:tetramand', 200, (builder) => {
        let earth_slam = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo_aliens:tetramand', 'earth_slam', builder.getPartialTicks(), 7, 12);
        builder.get('body')
            .animate('easeOutCubic', earth_slam);
        builder.get('head')
            .setX(0)
            .setY(2.25)
            .setZ(-3)
            .rotateXDegrees(10)
            .animate('easeOutCubic', earth_slam);
        builder.get('chest')
            .setX(0)
            .setY(2)
            .setZ(-3)
            .setXRotDegrees(20)
            .animate('easeOutCubic', earth_slam);
        builder.get('right_arm')
            .setX(-5)
            .setY(5)
            .setZ(-3)
            .setXRotDegrees(-45)
            .setYRotDegrees(-23)
            .setZRotDegrees(19)
            .animate('easeOutCubic', earth_slam);
        builder.get('left_arm')
            .setX(5)
            .setY(5)
            .setZ(-3)
            .setXRotDegrees(-45)
            .setYRotDegrees(23)
            .setZRotDegrees(-19)
            .animate('easeOutCubic', earth_slam);
        builder.get('right_leg')
            .setX(-1.9)
            .setY(12)
            .setZ(-4)
            .setXRotDegrees(75)
            .animate('easeOutCubic', earth_slam);
        builder.get('left_leg')
            .setX(1.9)
            .setY(7)
            .setZ(-3)
            .setXRotDegrees(10)
            .animate('easeOutCubic', earth_slam);

        if (earth_slam > 0.0 && builder.isFirstPerson()) {
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
                .animate('easeOutCubic', earth_slam);

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
                .animate('easeOutCubic', earth_slam);
        }

        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:tetramand", "earth_slam")) {
            earth_slam = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:tetramand', 'earth_slam', builder.getPartialTicks(), 1, 7);
            if (earth_slam > 0.0 && !builder.isFirstPerson()) {
                builder.get('right_arm')
                    .setXRotDegrees(-150)
                    .setZRotDegrees(-5)
                    .animate('easeOutCubic', earth_slam);

                builder.get('left_arm')
                    .setXRotDegrees(-150)
                    .setZRotDegrees(5)
                    .animate('easeOutCubic', earth_slam);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/block', 'alienevo_aliens:tetramand', 15, (builder) => {
        let block_anim = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:tetramand', 'block_abil', builder.getPartialTicks());
        if (block_anim > 0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-150)
                .setYRotDegrees(-65)
                .setX(builder.getModel().rightArm.x - 1)
                .setY(builder.getModel().rightArm.y + 3)
                .setZ(builder.getModel().rightArm.z - 2)
                .animate('InOutCubic', block_anim);
            builder.get('left_arm')
                .setXRotDegrees(-150)
                .setYRotDegrees(65)
                .setX(builder.getModel().leftArm.x + 1)
                .setY(builder.getModel().leftArm.y + 3)
                .setZ(builder.getModel().leftArm.z - 1)
                .animate('InOutCubic', block_anim);
        }
        if (block_anim > 0.0 && builder.isFirstPerson()) {
            builder.get('right_arm').setXRotDegrees(-55).setYRotDegrees(15).setZRotDegrees(0).setY(1).setZ(-3).animate('InOutCubic', block_anim);
            builder.get('left_arm').setXRotDegrees(-55).setYRotDegrees(-15).setZRotDegrees(0).setY(1).setZ(-3).animate('InOutCubic', block_anim);
        } else {
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/sonic_clap_1', 'alienevo_aliens:tetramand', 15, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:tetramand", "sonic_clap")) {
            let sonic_clap_1 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:tetramand', 'sonic_clap', builder.getPartialTicks(), 1, 6);
            if (sonic_clap_1 > 0 && !builder.isFirstPerson()) {
                builder.get('left_arm')
                    .setXRotDegrees(-90)
                    .setZRotDegrees(0)
                    .setYRotDegrees(-35)
                    .animate('easeOutBack', sonic_clap_1);
                builder.get('right_arm')
                    .setXRotDegrees(-90)
                    .setZRotDegrees(0)
                    .setYRotDegrees(35)
                    .animate('easeOutBack', sonic_clap_1);
            }
            if (sonic_clap_1 > 0 && builder.isFirstPerson()) {
                builder.get('left_arm')
                    .setXRotDegrees(30)
                    .setZRotDegrees(10)
                    .setYRotDegrees(20)
                    .setX(5)
                    .setY(-1)
                    .setZ(-2)
                    .animate('easeOutBack', sonic_clap_1);
                builder.get('right_arm')
                    .setXRotDegrees(30)
                    .setZRotDegrees(-10)
                    .setYRotDegrees(-20)
                    .setX(-5)
                    .setY(-1)
                    .setZ(-2)
                    .animate('easeOutBack', sonic_clap_1);
            } else {
            }
        }
    });
});

PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/sonic_clap_2', 'alienevo_aliens:tetramand', 15, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:tetramand", "sonic_clap")) {
            let sonic_clap_2 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:tetramand', 'sonic_clap', builder.getPartialTicks(), 6, 10);
            if (sonic_clap_2 > 0 && !builder.isFirstPerson()) {
                builder.get('left_arm')
                    .setXRotDegrees(-90)
                    .setZRotDegrees(0)
                    .setYRotDegrees(42.5)
                    .animate('easeOutBounce', sonic_clap_2);
                builder.get('right_arm')
                    .setXRotDegrees(-90)
                    .setZRotDegrees(0)
                    .setYRotDegrees(-42.5)
                    .animate('easeOutBounce', sonic_clap_2);
            }
            if (sonic_clap_2 > 0 && builder.isFirstPerson()) {
                builder.get('left_arm')
                    .setXRotDegrees(-30)
                    .setZRotDegrees(30)
                    .setYRotDegrees(30)
                    .setX(5)
                    .setY(-1)
                    .setZ(-2)
                    .animate('easeOutBounce', sonic_clap_2);
                builder.get('right_arm')
                    .setXRotDegrees(-30)
                    .setZRotDegrees(-30)
                    .setYRotDegrees(-30)
                    .setX(-5)
                    .setY(-1)
                    .setZ(-2)
                    .animate('easeOutBounce', sonic_clap_2);
            } else {
            }
        }
    });
});

PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/sonic_clap_3', 'alienevo_aliens:tetramand', 15, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:tetramand", "sonic_clap")) {
            let sonic_clap_3 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:tetramand', 'sonic_clap', builder.getPartialTicks(), 14, 20);
            if (sonic_clap_3 > 0 && !builder.isFirstPerson()) {
                builder.get('left_arm')
                    .setXRotDegrees((builder.getModel().leftArm.xRot))
                    .setZRotDegrees((builder.getModel().leftArm.zRot))
                    .setYRotDegrees((builder.getModel().leftArm.yRot))
                    .animate('easeInOutSine', sonic_clap_3);
                builder.get('right_arm')
                    .setXRotDegrees((builder.getModel().rightArm.xRot))
                    .setZRotDegrees((builder.getModel().rightArm.zRot))
                    .setYRotDegrees((builder.getModel().rightArm.yRot))
                    .animate('easeInOutSine', sonic_clap_3);
            }
            if (sonic_clap_3 > 0 && builder.isFirstPerson()) {
                builder.get('left_arm')
                    .setXRotDegrees(0)
                    .setZRotDegrees(0)
                    .setYRotDegrees(0)
                    .setX(0)
                    .setY(0)
                    .setZ(0)
                    .animate('easeInOutSine', sonic_clap_3);
                builder.get('right_arm')
                    .setXRotDegrees(0)
                    .setZRotDegrees(0)
                    .setYRotDegrees(0)
                    .setX(0)
                    .setY(0)
                    .setZ(0)
                    .animate('easeInOutSine', sonic_clap_3);
            } else {
            }
        }
    });
});

PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('tetramand/punch', 'alienevo_aliens:tetramand', 200, (builder) => {
        let animation = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:tetramand', 'punch_righthand', builder.getPartialTicks());
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
                    .setY(-10)
                    .animate('easeOutCubic', animation);
            }
        }
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:tetramand", "punch_lefthand")) {
            let animation = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:tetramand', 'punch_lefthand', builder.getPartialTicks());
            if (animation > 0) {
                if (!builder.isFirstPerson()) {
                    builder.get('right_arm')
                        .setXRotDegrees(-26)
                        .setYRotDegrees(5)
                        .setZRotDegrees(-5)
                        .animate('easeOutCubic', animation);
                    builder.get('left_arm')
                        .setXRotDegrees(-100)
                        .setZ(4)
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
                        .setY(-10)
                        .animate('easeOutCubic', animation);
                }
            }
        }

    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/slam_fall', 'alienevo_aliens:tetramand', 250, (builder) => {
        let slamfall_anim = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:tetramand', 'slam_fall', builder.getPartialTicks());
        if (slamfall_anim > 0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-85)
                .setYRotDegrees(-50)
                .setZRotDegrees(-70)
                .animate('InOutCubic', slamfall_anim);
            builder.get('left_arm')
                .setXRotDegrees(-85)
                .setYRotDegrees(50)
                .setZRotDegrees(70)
                .animate('InOutCubic', slamfall_anim);
        }
        if (slamfall_anim > 0.0 && builder.isFirstPerson()) {
            builder.get('right_arm').setXRotDegrees(-35).setYRotDegrees(25).setZRotDegrees(-25).setY(-5).setZ(-10).animate('InOutCubic', slamfall_anim);
            builder.get('left_arm').setXRotDegrees(-45).setYRotDegrees(-35).setZRotDegrees(0).setY(1).setZ(3).animate('InOutCubic', slamfall_anim);
        } else {
            builder.get('body').setY(-4).setZ(16).setXRotDegrees(-65).setYRotDegrees(17.5).setZRotDegrees(-42.5).animate('InOutCubic', slamfall_anim);
            builder.get('chest').setXRotDegrees(15).setYRotDegrees(0).setZRotDegrees(0).animate('InOutCubic', slamfall_anim);
            builder.get('left_arm').setXRotDegrees(7.5).setYRotDegrees(-30).setZRotDegrees(-35).animate('InOutCubic', slamfall_anim);
            builder.get('right_arm').setXRotDegrees(-135).setYRotDegrees(2.5).setZRotDegrees(15).animate('InOutCubic', slamfall_anim);
            builder.get('left_leg').setXRotDegrees(25).setYRotDegrees(10).setZRotDegrees(-30).animate('InOutCubic', slamfall_anim);
            builder.get('right_leg').setXRotDegrees(7.5).setYRotDegrees(20).setZRotDegrees(-20).animate('InOutCubic', slamfall_anim);
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/tornadohook_arms', 'alienevo_aliens:tetramand', 200, (builder) => {
        let tornado = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo_aliens:tetramand', 'spin_timer_arms', builder.getPartialTicks());
        if (tornado > 0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .rotateZDegrees(40)
                .setXRotDegrees(0)
                .animate('easeOutBack', tornado);
            builder.get('left_arm')
                .rotateZDegrees(-40)
                .setXRotDegrees(0)
                .animate('easeOutBack', tornado);
            builder.get('left_leg')
                .setXRotDegrees(0)
                .setYRotDegrees(0)
                .setZRotDegrees(0)
                .animate('easeOutBack', tornado);
            builder.get('right_leg')
                .setXRotDegrees(0)
                .setYRotDegrees(0)
                .setZRotDegrees(0)
                .animate('easeOutBack', tornado);
        }
        if (tornado > 0.0 && builder.isFirstPerson()) {
        }
    });
});

PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/tornadohook', 'alienevo_aliens:tetramand', 200, (builder) => {
        let tornado = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo_aliens:tetramand', 'spin_timer', builder.getPartialTicks());
        if (tornado > 0 && !builder.isFirstPerson()) {
            builder.get('body').rotateYDegrees(-360 * 15).animate('easeInOutSine', tornado);

        }
        if (tornado > 0.0 && builder.isFirstPerson()) {


        }
    });
});
ClientEvents.tick(event => {
    if (abilityUtil.hasPower(event.player, "alienevo_aliens:tetramand")) {
        if (abilityUtil.isEnabled(event.player, "alienevo_aliens:tetramand", "spin_timer")) {
            let mode = Client.options.getCameraType();
            if (mode !== 'third_person_back' && mode !== 'third_person_front') {
                event.player.persistentData.camera_reset = 1;
                Client.options.setCameraType('third_person_back');
            }
        }

        let end = event.player.persistentData.camera_reset;
        if (!abilityUtil.isEnabled(event.player, "alienevo_aliens:tetramand", "spin_timer") && end === 1) {
            event.player.persistentData.camera_reset = 0;
            Client.options.setCameraType('first_person');
        }
    }
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/liftboulder', 'alienevo_aliens:tetramand', 15, (builder) => {
        let lift_boulder = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:tetramand', 'lift_boulder', builder.getPartialTicks());
        if (lift_boulder > 0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-160)
                .setYRotDegrees(-17.5)
                .setZRotDegrees(10)
                .animate('easeInOutCirc', lift_boulder);
            builder.get('left_arm')
                .setXRotDegrees(-160)
                .setYRotDegrees(17.5)
                .setZRotDegrees(-10)
                .animate('easeInOutCirc', lift_boulder);
        }
        if (lift_boulder > 0.0 && builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-65)
                .setYRotDegrees(-25)
                .setZRotDegrees(-25)
                .setZ(7)
                .animate('easeInOutCirc', lift_boulder);
            builder.get('left_arm')
                .setXRotDegrees(-65)
                .setYRotDegrees(25)
                .setZRotDegrees(25)
                .setZ(7)
                .animate('easeInOutCirc', lift_boulder);
        } else {
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/throwboulder', 'alienevo_aliens:tetramand', 200, (builder) => {
        let throw_boulder = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:tetramand', 'throw_boulder', builder.getPartialTicks());
        if (throw_boulder > 0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-120)
                .setYRotDegrees(-17.5)
                .setZRotDegrees(10)
                .animate('easeInQuart', throw_boulder);

            builder.get('left_arm')
                .setXRotDegrees(-120)
                .setYRotDegrees(17.5)
                .setZRotDegrees(-10)
                .animate('easeInQuart', throw_boulder);
        }
        if (throw_boulder > 0.0 && builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-15)
                .setYRotDegrees(-25)
                .setZRotDegrees(-25)
                .setZ(7)
                .animate('easeInOutCirc', throw_boulder);
            builder.get('left_arm')
                .setXRotDegrees(-15)
                .setYRotDegrees(25)
                .setZRotDegrees(25)
                .setZ(7)
                .animate('easeInOutCirc', throw_boulder);
        } else {
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/tetramand_climb_onwall', 'alienevo_aliens:tetramand', 10, (builder) => {
        const on_wall = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:tetramand', 'surface_climbing_anim', builder.getPartialTicks());
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
    event.registerForPower('alienevo_aliens/tetramand_climb_1', 'alienevo_aliens:tetramand', 10, (builder) => {
        const climb_1 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:tetramand', 'climb_1', builder.getPartialTicks());
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
    event.registerForPower('alienevo_aliens/tetramand_climb_2', 'alienevo_aliens:tetramand', 10, (builder) => {
        const climb_2 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:tetramand', 'climb_2', builder.getPartialTicks());
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
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/charge_leap', 'alienevo_aliens:tetramand', 200, (builder) => {
        let charge_leap = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:tetramand', 'leap_charge', builder.getPartialTicks());
        if (!palladium.abilities.isEnabled(builder.getPlayer(), 'alienevo_aliens:tetramand', 'leap_charge')) {
            charge_leap = 0;
        }
        if (charge_leap > 0 && !builder.isFirstPerson()) {
            builder.get('head')
                .setY(builder.getModel().head.y + 2)
                .animate('easeOutQuint', charge_leap);
            builder.get('chest')
                .setXRotDegrees(15)
                .setY(builder.getModel().body.y + 2)
                .animate('easeOutQuint', charge_leap);
            builder.get('left_arm')
                .setXRotDegrees(120)
                .setY(builder.getModel().leftArm.y + 3)
                .setZ(builder.getModel().leftArm.z + 2)
                .animate('easeOutQuint', charge_leap);
            builder.get('right_arm')
                .setXRotDegrees(120)
                .setY(builder.getModel().rightArm.y + 3)
                .setZ(builder.getModel().rightArm.z + 2)
                .animate('easeOutQuint', charge_leap);
            builder.get('right_leg')
                .rotateX(builder.getModel().rightLeg.xRot * -0.5)
                .setZ(builder.getModel().rightLeg.z + 4.5)
                .animate('easeOutQuint', charge_leap);
            builder.get('left_leg')
                .rotateX(builder.getModel().leftLeg.xRot * -0.5)
                .setZ(builder.getModel().leftLeg.z + 2)
                .animate('easeOutQuint', charge_leap);
        }
        if (charge_leap > 0.0 && builder.isFirstPerson()) {
            builder.get('chest')
                .animate('easeInOutCirc', charge_leap);
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('leap/anim', 'alienevo_aliens:tetramand', 201, (builder) => {
        let leap_anim = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo_aliens:tetramand', 'leap_anim', builder.getPartialTicks(), 1, 8);
        builder.get('left_arm')
            .animate('easeInOutCubic', leap_anim);
        if (leap_anim > 0.0 && builder.isFirstPerson()) {
            builder.get('chest')
                .animate('easeInOutCubic', leap_anim);
        }
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:tetramand", "leap_anim")) {
            leap_anim = animationUtil.getAnimationTimerAbilityValue(
                builder.getPlayer(), 'alienevo_aliens:tetramand', 'leap_anim', builder.getPartialTicks(), 1, 16);
            if (leap_anim > 0.0 && !builder.isFirstPerson()) {
                builder.get('left_arm')
                    .setXRotDegrees(-150)
                    .setZ(builder.getModel().leftArm.z - 1.5)
                    .animate('easeOutCirc', leap_anim);
                builder.get('right_arm')
                    .setXRotDegrees(-150)
                    .setZ(builder.getModel().rightArm.z - 1.5)
                    .animate('easeOutCirc', leap_anim);
                builder.get('left_leg')
                    .setXRotDegrees(25)
                    .animate('easeOutCirc', leap_anim);
                builder.get('right_leg')
                    .setXRotDegrees(25)
                    .animate('easeOutCirc', leap_anim);
                builder.get('chest')
                    .animate('easeOutQuint', leap_anim);

            }
        }
    });
});

