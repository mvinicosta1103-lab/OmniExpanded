PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/bite', 'alienevo_aliens:piscciss_volann', 15, (builder) => {
        const animation = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:piscciss_volann', 'bite', builder.getPartialTicks());
        if (animation > 0.0) {
            if (builder.isFirstPerson()) {
            } else {
                builder.get('body')
                    .setXRotDegrees(-30)
                    .animate('easeInOutQuart', animation);
                builder.get('right_arm')
                    .setXRotDegrees(10)
                    .setYRotDegrees(10)
                    .setZRotDegrees(17.5)
                    .animate('easeInOutQuart', animation);
                builder.get('left_arm')
                    .setXRotDegrees(10)
                    .setYRotDegrees(-10)
                    .setZRotDegrees(-17.5)
                    .animate('easeInOutQuart', animation);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/aquajet', 'alienevo_aliens:piscciss_volann', 15, (builder) => {
        const animation = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:piscciss_volann', 'aqua_jet', builder.getPartialTicks());
        if (animation > 0.0) {
            if (builder.isFirstPerson()) {
            } else {
                builder.get('body')
                    .setYRotDegrees(-360 * 2)
                    .animate('easeInOutBack ', animation);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/tail_slam', 'alienevo_aliens:piscciss_volann', 15, (builder) => {
        const animation = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:piscciss_volann', 'tail_slam', builder.getPartialTicks());
        if (animation > 0.0) {
            if (builder.isFirstPerson()) {
            } else {
                builder.get('body')
                    .setXRotDegrees(-360)
                    .animate('easeInOutSine', animation);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/tail_slam_moveup', 'alienevo_aliens:piscciss_volann', 15, (builder) => {
        const animation = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:piscciss_volann', 'tail_slam', builder.getPartialTicks(), 1, 2);
        if (animation > 0.0) {
            if (builder.isFirstPerson()) {
            } else {
                builder.get('body')
                    .setY(15)
                    .animate('inOutCubic', animation);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/tail_slam_hit', 'alienevo_aliens:piscciss_volann', 15, (builder) => {
        const animation = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:piscciss_volann', 'tail_slam', builder.getPartialTicks(), 8, 10);
        if (animation > 0.0) {
            if (builder.isFirstPerson()) {
            } else {
                builder.get('body')
                    .setXRotDegrees(-360)
                    .animate('easeInOutSine', animation);
            }
        }
    });
});
ClientEvents.tick(event => {
    if (abilityUtil.hasPower(event.player, "alienevo_aliens:piscciss_volann")) {
        if (abilityUtil.isEnabled(event.player, "alienevo_aliens:piscciss_volann", "tail_slam")) {
            let mode = Client.options.getCameraType();
            if (mode !== 'third_person_back' && mode !== 'third_person_front') {
                event.player.persistentData.camera_reset = 1;
                Client.options.setCameraType('third_person_back');
            }
        }

        let end = event.player.persistentData.camera_reset;
        if (!abilityUtil.isEnabled(event.player, "alienevo_aliens:piscciss_volann", "tail_slam") && end === 1) {
            event.player.persistentData.camera_reset = 0;
            Client.options.setCameraType('first_person');
        }
    }
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/ripjawslimbs', 'alienevo_aliens:piscciss_volann', 15, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:piscciss_volann", "piscciss_volann_loop")) {
            if (!builder.isFirstPerson()) {
                builder.get('left_arm').rotateX(builder.getModel().leftArm.xRot * -0.15)
                builder.get('right_arm').rotateX(builder.getModel().rightArm.xRot * -0.15)
                builder.get('right_leg').rotateX(builder.getModel().rightLeg.xRot * -0.5)
                builder.get('left_leg').rotateX(builder.getModel().leftLeg.xRot * -0.5)
                if (builder.getPlayer().isCrouching()) {
                    builder.get('body')
                        .setY(1)
                    builder.get('chest')
                        .setXRotDegrees(15)
                    builder.get('head')
                        .setZ(builder.getModel().head.z - 1)
                    builder.get('left_arm')
                        .setY(builder.getModel().leftArm.y - 1)
                        .setZ(builder.getModel().leftArm.z)
                    builder.get('right_arm')
                        .setY(builder.getModel().rightArm.y - 1)
                        .setZ(builder.getModel().rightArm.z)
                }

            }
        }

    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/armlock', 'alienevo_aliens:piscciss_volann', 15, (builder) => {
        const animation = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:piscciss_volann', 'arm_lock', builder.getPartialTicks());
        if (animation > 0.0) {
            if (builder.isFirstPerson()) {
            } else {
                builder.get('right_arm')
                    .setXRotDegrees(0)
                    .setYRotDegrees(0)
                    .setZRotDegrees(0)
                    .animate('easeInOutBack ', animation);
                builder.get('left_arm')
                    .setXRotDegrees(0)
                    .setYRotDegrees(0)
                    .setZRotDegrees(0)
                    .animate('easeInOutBack ', animation);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/pisccissvolann_climb_onwall', 'alienevo_aliens:piscciss_volann', 10, (builder) => {
        const on_wall = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:piscciss_volann', 'surface_climbing_anim', builder.getPartialTicks());
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
    event.registerForPower('alienevo_aliens/pisccissvolann_climb_1', 'alienevo_aliens:piscciss_volann', 10, (builder) => {
        const climb_1 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:piscciss_volann', 'climb_1', builder.getPartialTicks());
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
    event.registerForPower('alienevo_aliens/pisccissvolann_climb_2', 'alienevo_aliens:piscciss_volann', 10, (builder) => {
        const climb_2 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:piscciss_volann', 'climb_2', builder.getPartialTicks());
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
    event.registerForPower('alienevo_aliens/volannlimbs', 'alienevo_aliens:piscciss_volann', 15, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:piscciss_volann", "piscciss_volann_loop")) {
            if (!builder.isFirstPerson()) {
                const halfPi = 1.57079632679;
                builder.get('left_arm').rotateX(builder.getModel().leftArm.xRot * -0.2)
                builder.get('right_arm').rotateX(builder.getModel().rightArm.xRot * -0.2)
                builder.get('right_leg').rotateX(builder.getModel().rightLeg.xRot * -0.2)
                builder.get('left_leg').rotateX(builder.getModel().leftLeg.xRot * -0.2)

            }
        }
    });
});
