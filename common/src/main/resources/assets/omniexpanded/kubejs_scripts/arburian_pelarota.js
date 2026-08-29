PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('ball/form', 'alienevo_aliens:arburian_pelarota', 200, (builder) => {
        let ball_form = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'ball_roll', builder.getPartialTicks());
        builder.get('right_arm')
            .setXRotDegrees(0).setYRotDegrees(0).setZRotDegrees(0)
            .animate('InOutExpo', ball_form);
        builder.get('left_arm')
            .setXRotDegrees(0).setYRotDegrees(0).setZRotDegrees(0)
            .animate('InOutExpo', ball_form);
        builder.get('chest')
            .setXRotDegrees(0).setYRotDegrees(0).setZRotDegrees(0)
            .animate('InOutExpo', ball_form);


        if (ball_form > 0.0 && builder.isFirstPerson()) {
        }
    });
});

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

let heightDist = 0;
let heightDistO = 0;
let lastY = 0;
let onGroundTimer = 0;
let squashAmount = 0;
let squashAmountO = 0;
let landingVelocity = 0;
let targetSquashAmount = 0;

PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('ball/roll_1', 'alienevo_aliens:arburian_pelarota', 200, (builder) => {
        let ball_roll_1 = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'ball_pivot', builder.getPartialTicks(), 0, 6);
        if (ball_roll_1 > 0.0) {
            builder.get('body')
                .setY(4)
                .animate('easeInOutBack', ball_roll_1);
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('ball/roll_1_scale', 'alienevo_aliens:arburian_pelarota', 200, (builder) => {
        let ball_roll_1_scale = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'ball_pivot', builder.getPartialTicks(), 0, 6);
        if (ball_roll_1_scale > 0.0) {
            builder.get('body')
                .scaleY(1 + 0.2)
                .animate('linear', ball_roll_1_scale);
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('ball/roll_2', 'alienevo_aliens:arburian_pelarota', 200, (builder) => {
        let ball_roll_2 = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'ball_pivot', builder.getPartialTicks(), 6, 12);
        if (ball_roll_2 > 0.0) {
            builder.get('body')
                .setY(0)
                .scaleY(1 - 0.2)
                .animate('easeOutBack', ball_roll_2);
        }
    });
});
ClientEvents.tick(event => {
    if (abilityUtil.hasPower(event.player, "alienevo_aliens:arburian_pelarota")) {
        // Check if either ball_roll or rumble is enabled
        let ballRollEnabled = abilityUtil.isEnabled(event.player, "alienevo_aliens:arburian_pelarota", "ball_roll");
        let rumbleEnabled = abilityUtil.isEnabled(event.player, "alienevo_aliens:arburian_pelarota", "rumble");

        if (ballRollEnabled || rumbleEnabled) {
            let mode = Client.options.getCameraType();
            if (mode !== 'third_person_back' && mode !== 'third_person_front') {
                event.player.persistentData.camera_reset = 1;
                Client.options.setCameraType('third_person_back');
            }
        }

        let end = event.player.persistentData.camera_reset;
        // Reset camera only when both abilities are disabled
        if (!ballRollEnabled && !rumbleEnabled && end === 1) {
            event.player.persistentData.camera_reset = 0;
            Client.options.setCameraType('first_person');
        }
    }
});

PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/aburianlimbs', 'alienevo_aliens:arburian_pelarota', 15, (builder) => {

        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "arburian_loop")) {
            if (!builder.isFirstPerson()) {
                let halfPi = 1.57079632679;
                builder.get('left_arm').rotateX(builder.getModel().leftArm.xRot * -0.3)
                builder.get('right_arm').rotateX(builder.getModel().rightArm.xRot * -0.3)
                builder.get('right_leg').rotateX(builder.getModel().rightLeg.xRot * -0.4)
                builder.get('left_leg').rotateX(builder.getModel().leftLeg.xRot * -0.4)
            }
            if (builder.isFirstPerson()) {
                builder.get('left_arm').scaleX(0.75).scaleY(0.75).scaleZ(0.75)
                builder.get('right_arm').scaleX(0.75).scaleY(0.75).scaleZ(0.75)
            }
            if (builder.getPlayer().isCrouching() && !builder.isFirstPerson()) {
                builder.get('chest').setXRotDegrees(12).setY(0)
                builder.get('left_leg').setY(10)
                builder.get('right_leg').setY(10)
                builder.get('left_arm').setY(2)
                builder.get('right_arm').setY(2)
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('ball/roll_boost', 'alienevo_aliens:arburian_pelarota', 250, (builder) => {
        let ball_boost = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'boost_still', builder.getPartialTicks(), 0, 40);
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "boost_still")) {
            if (ball_boost > 0.0) {
                builder.get('chest')
                    .rotateX(30)
                    .animate('easeInExpo', ball_boost);
            } else {
            }
        }
    });
});

PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('ball/roll_slam', 'alienevo_aliens:arburian_pelarota', 250, (builder) => {
        let ball_slam = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'boost_slam', builder.getPartialTicks());
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "boost_slam")) {
            if (ball_slam > 0.0) {
                builder.get('chest')
                    .rotateX(30)
                    .animate('easeInOutQuart', ball_slam);
            } else {
            }
        }
    });
});

PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/arburianblock', 'alienevo_aliens:arburian_pelarota', 15, (builder) => {
        let block_anim = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'block_abil', builder.getPartialTicks());
        if (block_anim > 0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-90)
                .setYRotDegrees(- 58)
                .setZRotDegrees(15)
                .setX(builder.getModel().rightArm.x - 1)
                .setY(builder.getModel().rightArm.y + 3)
                .animate('InOutCubic', block_anim);
            builder.get('left_arm')
                .setXRotDegrees(-90)
                .setYRotDegrees(- -58)
                .setZRotDegrees(-15)
                .setX(builder.getModel().leftArm.x + 1)
                .setY(builder.getModel().leftArm.y + 3)
                .animate('InOutCubic', block_anim);
        }
        if (block_anim > 0.0 && builder.isFirstPerson()) {
            builder.get('right_arm').setXRotDegrees(-65).setYRotDegrees(15).setZRotDegrees(-90).setX(-10).setY(-4).setZ(-2).animate('InOutCubic', block_anim);
            builder.get('left_arm').setXRotDegrees(-65).setYRotDegrees(-15).setZRotDegrees(90).setX(10).setY(-4).setZ(-2).animate('InOutCubic', block_anim);
        } else {
        }
    });
});

//body rotate
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/rumble_body_r_1', 'alienevo_aliens:arburian_pelarota', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "rumble")) {
            let rumble_body_r_1 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'rumble', builder.getPartialTicks(), 0.17 * 20, 0.42 * 20);
            if (rumble_body_r_1 > 0 && !builder.isFirstPerson()) {
                builder.get('body')
                    .setXRotDegrees(- -7.5)
                    .animate('InOutSine', rumble_body_r_1);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/rumble_body_r_2', 'alienevo_aliens:arburian_pelarota', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "rumble")) {
            let rumble_body_r_2 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'rumble', builder.getPartialTicks(), 0.42 * 20, 0.63 * 20);
            if (rumble_body_r_2 > 0 && !builder.isFirstPerson()) {
                builder.get('body')
                    .setXRotDegrees(- 22.5)
                    .animate('InExpo', rumble_body_r_2);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/rumble_body_r_3', 'alienevo_aliens:arburian_pelarota', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "rumble")) {
            let rumble_body_r_3 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'rumble', builder.getPartialTicks(), 0.63 * 20, 0.88 * 20);
            if (rumble_body_r_3 > 0 && !builder.isFirstPerson()) {
                builder.get('body')
                    .setXRotDegrees(- 90)
                    .animate('OutBack', rumble_body_r_3);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/rumble_body_r_4', 'alienevo_aliens:arburian_pelarota', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "rumble")) {
            let rumble_body_r_4 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'rumble', builder.getPartialTicks(), 1.13 * 20, 1.88 * 20);
            if (rumble_body_r_4 > 0 && !builder.isFirstPerson()) {
                builder.get('body')
                    .setXRotDegrees(0)
                    .animate('InOutSine', rumble_body_r_4);
            }
        }
    });
});

// body translate
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/rumble_body_t_1', 'alienevo_aliens:arburian_pelarota', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "rumble")) {
            let rumble_body_t_1 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'rumble', builder.getPartialTicks(), 0.17 * 20, 0.42 * 20);
            if (rumble_body_t_1 > 0 && !builder.isFirstPerson()) {
                builder.get('body')
                    .setY(11)
                    .animate('InSine', rumble_body_t_1);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/rumble_body_t_2', 'alienevo_aliens:arburian_pelarota', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "rumble")) {
            let rumble_body_t_2 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'rumble', builder.getPartialTicks(), 0.42 * 20, 0.63 * 20);
            if (rumble_body_t_2 > 0 && !builder.isFirstPerson()) {
                builder.get('body')
                    .setY(16)
                    .animate('OutCubic', rumble_body_t_2);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/rumble_body_t_3', 'alienevo_aliens:arburian_pelarota', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "rumble")) {
            let rumble_body_t_3 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'rumble', builder.getPartialTicks(), 0.63 * 20, 0.88 * 20);
            if (rumble_body_t_3 > 0 && !builder.isFirstPerson()) {
                builder.get('body')
                    .setY(6)
                    .animate('InOutBack', rumble_body_t_3);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/rumble_body_t_4', 'alienevo_aliens:arburian_pelarota', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "rumble")) {
            let rumble_body_t_4 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'rumble', builder.getPartialTicks(), 1.13 * 20, 1.88 * 20);
            if (rumble_body_t_4 > 0 && !builder.isFirstPerson()) {
                builder.get('body')
                    .setY(0)
                    .animate('linear', rumble_body_t_4);
            }
        }
    });
});

//chest
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/rumble_chest_1', 'alienevo_aliens:arburian_pelarota', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "rumble")) {
            let rumble_chest_1 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'rumble', builder.getPartialTicks(), 0, 0.17 * 20);
            if (rumble_chest_1 > 0 && !builder.isFirstPerson()) {
                builder.get('chest')
                    .setXRotDegrees(42.5)
                    .setY(- -5)
                    .setZ(- 9)
                    .animate('InOutSine', rumble_chest_1);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/rumble_chest_2', 'alienevo_aliens:arburian_pelarota', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "rumble")) {
            let rumble_chest_2 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'rumble', builder.getPartialTicks(), 0.17 * 20, 0.42 * 20);
            if (rumble_chest_2 > 0 && !builder.isFirstPerson()) {
                builder.get('chest')
                    .setXRotDegrees(-12.5)
                    .setY(- +1)
                    .setZ(4)
                    .animate('InOutSine', rumble_chest_2);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/rumble_chest_3', 'alienevo_aliens:arburian_pelarota', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "rumble")) {
            let rumble_chest_3 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'rumble', builder.getPartialTicks(), 0.42 * 20, 0.88 * 20);
            if (rumble_chest_3 > 0 && !builder.isFirstPerson()) {
                builder.get('chest')
                    .setXRotDegrees(0)
                    .setZ(- 1)
                    .animate('OutBack', rumble_chest_3);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/rumble_chest_4', 'alienevo_aliens:arburian_pelarota', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "rumble")) {
            let rumble_chest_4 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'rumble', builder.getPartialTicks(), 1.13 * 20, 1.46 * 20);
            if (rumble_chest_4 > 0 && !builder.isFirstPerson()) {
                builder.get('chest')
                    .setXRotDegrees(22.5)
                    .setY(- 0.5)
                    .setZ(- 5.5)
                    .animate('OutSine', rumble_chest_4);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/rumble_chest_5', 'alienevo_aliens:arburian_pelarota', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "rumble")) {
            let rumble_chest_5 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'rumble', builder.getPartialTicks(), 1.46 * 20, 1.88 * 20);
            if (rumble_chest_5 > 0 && !builder.isFirstPerson()) {
                builder.get('chest')
                    .setXRotDegrees(0)
                    .setY(0)
                    .setZ(0)
                    .animate('InSine', rumble_chest_5);
            }
        }
    });
});

//arms translate
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/rumble_arms_t_1', 'alienevo_aliens:arburian_pelarota', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "rumble")) {
            let rumble_arms_t_1 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'rumble', builder.getPartialTicks(), 0, 0.17 * 20);
            if (rumble_arms_t_1 > 0 && !builder.isFirstPerson()) {
                builder.get('left_arm')
                    .setX(5 + 1)
                    .setY(2 - -7)
                    .setZ(0 - 4)
                    .animate('InOutSine', rumble_arms_t_1);
                builder.get('right_arm')
                    .setX(-5 - 1)
                    .setY(2 - -7)
                    .setZ(0 - 4)
                    .animate('InOutSine', rumble_arms_t_1);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/rumble_arms_t_2', 'alienevo_aliens:arburian_pelarota', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "rumble")) {
            let rumble_arms_t_2 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'rumble', builder.getPartialTicks(), 0.17 * 20, 0.42 * 20);
            if (rumble_arms_t_2 > 0 && !builder.isFirstPerson()) {
                builder.get('left_arm')
                    .setX(5 + 1)
                    .setY(2 - 0)
                    .setZ(0 + 2)
                    .animate('InOutQuad', rumble_arms_t_2);
                builder.get('right_arm')
                    .setX(-5 - 1)
                    .setY(2 - 0)
                    .setZ(0 + 2)
                    .animate('InOutQuad', rumble_arms_t_2);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/rumble_arms_t_3', 'alienevo_aliens:arburian_pelarota', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "rumble")) {
            let rumble_arms_t_3 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'rumble', builder.getPartialTicks(), 0.42 * 20, 0.71 * 20);
            if (rumble_arms_t_3 > 0 && !builder.isFirstPerson()) {
                builder.get('left_arm')
                    .setX(5 + 2)
                    .setY(2 - 0)
                    .setZ(0 + 1)
                    .animate('InOutSine', rumble_arms_t_3);
                builder.get('right_arm')
                    .setX(-5 - 2)
                    .setY(2 - 0)
                    .setZ(0 + 1)
                    .animate('InOutSine', rumble_arms_t_3);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/rumble_arms_t_4', 'alienevo_aliens:arburian_pelarota', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "rumble")) {
            let rumble_arms_t_4 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'rumble', builder.getPartialTicks(), 1.13 * 20, 1.54 * 20);
            if (rumble_arms_t_4 > 0 && !builder.isFirstPerson()) {
                builder.get('left_arm')
                    .setX(5 + 0)
                    .setY(2 - 0)
                    .setZ(0 + -3)
                    .animate('InOutQuad', rumble_arms_t_4);
                builder.get('right_arm')
                    .setX(-5 - 0)
                    .setY(2 - 0)
                    .setZ(0 + -3)
                    .animate('InOutQuad', rumble_arms_t_4);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/rumble_arms_t_5', 'alienevo_aliens:arburian_pelarota', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "rumble")) {
            let rumble_arms_t_5 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'rumble', builder.getPartialTicks(), 1.54 * 20, 1.88 * 20);
            if (rumble_arms_t_5 > 0 && !builder.isFirstPerson()) {
                builder.get('left_arm')
                    .setX(5)
                    .setY(2)
                    .setZ(0)
                    .animate('linear', rumble_arms_t_5);
                builder.get('right_arm')
                    .setX(-5)
                    .setY(2)
                    .setZ(0)
                    .animate('linear', rumble_arms_t_5);
            }
        }
    });
});

//arms rotate
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/rumble_arms_r_1', 'alienevo_aliens:arburian_pelarota', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "rumble")) {
            let rumble_arms_r_1 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'rumble', builder.getPartialTicks(), 0, 0.17 * 20);
            if (rumble_arms_r_1 > 0 && !builder.isFirstPerson()) {
                builder.get('left_arm')
                    .setXRotDegrees(-20).setYRotDegrees(40).setZRotDegrees(18)
                    .animate('InOutSine', rumble_arms_r_1);
                builder.get('right_arm')
                    .setXRotDegrees(-20).setYRotDegrees(-40).setZRotDegrees(-18)
                    .animate('InOutSine', rumble_arms_r_1);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/rumble_arms_r_2', 'alienevo_aliens:arburian_pelarota', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "rumble")) {
            let rumble_arms_r_2 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'rumble', builder.getPartialTicks(), 0.17 * 20, 0.50 * 20);
            if (rumble_arms_r_2 > 0 && !builder.isFirstPerson()) {
                builder.get('left_arm')
                    .setXRotDegrees(-7).setYRotDegrees(-41).setZRotDegrees(-88)
                    .animate('InOutQuad', rumble_arms_r_2);
                builder.get('right_arm')
                    .setXRotDegrees(-7).setYRotDegrees(41).setZRotDegrees(88)
                    .animate('InOutQuad', rumble_arms_r_2);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/rumble_arms_r_3', 'alienevo_aliens:arburian_pelarota', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "rumble")) {
            let rumble_arms_r_3 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'rumble', builder.getPartialTicks(), 0.50 * 20, 0.71 * 20);
            if (rumble_arms_r_3 > 0 && !builder.isFirstPerson()) {
                builder.get('left_arm')
                    .setXRotDegrees(-90).setYRotDegrees(-100).setZRotDegrees(0)
                    .animate('InOutSine', rumble_arms_r_3);
                builder.get('right_arm')
                    .setXRotDegrees(-90).setYRotDegrees(100).setZRotDegrees(0)
                    .animate('InOutSine', rumble_arms_r_3);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/rumble_arms_r_4', 'alienevo_aliens:arburian_pelarota', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "rumble")) {
            let rumble_arms_r_4 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'rumble', builder.getPartialTicks(), 0.71 * 20, 0.88 * 20);
            if (rumble_arms_r_4 > 0 && !builder.isFirstPerson()) {
                builder.get('left_arm')
                    .setXRotDegrees(-90).setYRotDegrees(-65).setZRotDegrees(0)
                    .animate('OutBack', rumble_arms_r_4);
                builder.get('right_arm')
                    .setXRotDegrees(-90).setYRotDegrees(65).setZRotDegrees(0)
                    .animate('OutBack', rumble_arms_r_4);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/rumble_arms_r_5', 'alienevo_aliens:arburian_pelarota', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "rumble")) {
            let rumble_arms_r_5 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'rumble', builder.getPartialTicks(), 1.13 * 20, 1.54 * 20);
            if (rumble_arms_r_5 > 0 && !builder.isFirstPerson()) {
                builder.get('left_arm')
                    .setXRotDegrees(-52.5).setYRotDegrees(0).setZRotDegrees(0)
                    .animate('InQuad', rumble_arms_r_5);
                builder.get('right_arm')
                    .setXRotDegrees(-52.5).setYRotDegrees(0).setZRotDegrees(0)
                    .animate('InQuad', rumble_arms_r_5);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/rumble_arms_r_6', 'alienevo_aliens:arburian_pelarota', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "rumble")) {
            let rumble_arms_r_6 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'rumble', builder.getPartialTicks(), 1.54 * 20, 1.88 * 20);
            if (rumble_arms_r_6 > 0 && !builder.isFirstPerson()) {
                builder.get('left_arm')
                    .setXRotDegrees(0).setYRotDegrees(0).setZRotDegrees(0)
                    .animate('InOutSine', rumble_arms_r_6);
                builder.get('right_arm')
                    .setXRotDegrees(0).setYRotDegrees(0).setZRotDegrees(0)
                    .animate('InOutSine', rumble_arms_r_6);
            }
        }
    });
});

//legs
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/rumble_legs_1', 'alienevo_aliens:arburian_pelarota', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "rumble")) {
            let rumble_legs_1 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'rumble', builder.getPartialTicks(), 0, 0.17 * 20);
            if (rumble_legs_1 > 0 && !builder.isFirstPerson()) {
                builder.get('left_leg')
                    .setXRotDegrees(-7.5).setZRotDegrees(-5)
                    .setX(2 + 0)
                    .setY(12 - 0)
                    .setZ(0 + 5)
                    .animate('InOutSine', rumble_legs_1);
                builder.get('right_leg')
                    .setXRotDegrees(-7.5).setZRotDegrees(5)
                    .setX(-2 - 0)
                    .setY(12 - 0)
                    .setZ(0 + 5)
                    .animate('InOutSine', rumble_legs_1);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/rumble_legs_2', 'alienevo_aliens:arburian_pelarota', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "rumble")) {
            let rumble_legs_2 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'rumble', builder.getPartialTicks(), 0.17 * 20, 0.71 * 20);
            if (rumble_legs_2 > 0 && !builder.isFirstPerson()) {
                builder.get('left_leg')
                    .setXRotDegrees(40).setZRotDegrees(0)
                    .setX(2 + 0)
                    .setY(12 - 1)
                    .setZ(0 - 1)
                    .animate('OutQuad', rumble_legs_2);
                builder.get('right_leg')
                    .setXRotDegrees(40).setZRotDegrees(0)
                    .setX(-2 - 0)
                    .setY(12 - 1)
                    .setZ(0 - 1)
                    .animate('OutQuad', rumble_legs_2);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/rumble_legs_3', 'alienevo_aliens:arburian_pelarota', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "rumble")) {
            let rumble_legs_3 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'rumble', builder.getPartialTicks(), 0.71 * 20, 0.88 * 20);
            if (rumble_legs_3 > 0 && !builder.isFirstPerson()) {
                builder.get('left_leg')
                    .setXRotDegrees(-17.5)
                    .setX(2 + 0)
                    .setY(12 - 0)
                    .setZ(0 - 1)
                    .animate('InOutBack', rumble_legs_3);
                builder.get('right_leg')
                    .setXRotDegrees(-17.5)
                    .setX(-2 - 0)
                    .setY(12 - 0)
                    .setZ(0 - 1)
                    .animate('InOutBack', rumble_legs_3);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/rumble_legs_4', 'alienevo_aliens:arburian_pelarota', 210, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:arburian_pelarota", "rumble")) {
            let rumble_legs_4 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:arburian_pelarota', 'rumble', builder.getPartialTicks(), 1.13 * 20, 1.88 * 20);
            if (rumble_legs_4 > 0 && !builder.isFirstPerson()) {
                builder.get('left_leg')
                    .setXRotDegrees(0)
                    .setX(2 + 0)
                    .setY(12 - 0)
                    .setZ(0 - 0)
                    .animate('linear', rumble_legs_4);
                builder.get('right_leg')
                    .setXRotDegrees(0)
                    .setX(-2 - 0)
                    .setY(12 - 0)
                    .setZ(0 - 0)
                    .animate('linear', rumble_legs_4);
            }
        }
    });
});
