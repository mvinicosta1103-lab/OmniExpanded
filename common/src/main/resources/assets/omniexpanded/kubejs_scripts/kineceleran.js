PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('skate', 'alienevo_aliens:kineceleran', 200, (builder) => {
        const Pi = 3.14159265358979323846
        let skate = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo_aliens:kineceleran', 'skate', builder.getPartialTicks()
        );
        if (skate > 0.0) {
            builder.get('body')
                .rotateX(-0.2)
                .animate('easeOutQuad', skate);
            builder.get('left_leg')
                .setXRotDegrees(0)
                .rotateX(1.15 * Math.sin(Math.max(-0.4, Math.min(0.6 * Math.tanh(4 * Math.asin(builder.getModel().leftLeg.xRot / Pi)), 4))))
                .animate('easeOutQuad', skate);
            builder.get('right_leg')
                .setXRotDegrees(0)
                .rotateX(1.15 * Math.sin(Math.max(-0.4, Math.min(0.6 * Math.tanh(4 * Math.asin(builder.getModel().rightLeg.xRot / Pi)), 4))))
                .animate('easeOutQuad', skate);
            if (builder.getPlayer().isCrouching()) {
            }
        }
    }
    );
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/kick_dash', 'alienevo_aliens:kineceleran', 15, (builder) => {
        let kick_anim = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:kineceleran', 'kick_dash_anim', builder.getPartialTicks());
        if (kick_anim > 0 && !builder.isFirstPerson()) {
            builder.get('body')
                .setXRotDegrees(-57.5 * -1)
                .animate('easeOutSine', kick_anim);
            builder.get('head')
                .setXRotDegrees(57.5)
                .setYRotDegrees(0)
                .setZRotDegrees(0)
                .animate('easeOutSine', kick_anim);
            builder.get('chest')
                .setXRotDegrees(7)
                .setYRotDegrees(-17)
                .setZRotDegrees(1)
                .animate('easeOutSine', kick_anim);
            builder.get('left_arm')
                .setXRotDegrees(59)
                .setYRotDegrees(-24)
                .setZRotDegrees(-43)
                .animate('easeOutSine', kick_anim);
            builder.get('right_arm')
                .setXRotDegrees(-11)
                .setYRotDegrees(-73)
                .setZRotDegrees(5)
                .animate('easeOutSine', kick_anim);
            builder.get('left_leg')
                .setX(0)
                .setY(11)
                .setZ(1)
                .setXRotDegrees(19)
                .setYRotDegrees(-38)
                .setZRotDegrees(-8)
                .animate('easeOutSine', kick_anim);
            builder.get('right_leg')
                .setX(-2 - 2.5)
                .setZ(1 + -3.4)
                .setXRotDegrees(21)
                .setYRotDegrees(-75)
                .setZRotDegrees(-26)
                .animate('easeOutSine', kick_anim);
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/wall_run', 'alienevo_aliens:kineceleran', 15, (builder) => {
        let wall_run = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:kineceleran', 'on_wall_anim', builder.getPartialTicks());
        if (wall_run > 0 && !builder.isFirstPerson()) {
            builder.get('body')
                .setY(5)
                .setZ(-1)
                .setXRotDegrees(40)
                .setYRotDegrees(0)
                .setZRotDegrees(0)
                .animate('InOutCubic', wall_run);
            builder.get('head')
                .setXRotDegrees(0)
                .animate('InOutCubic', wall_run);
        }
        if (wall_run > 0.0 && builder.isFirstPerson()) {
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/wall_run_1', 'alienevo_aliens:kineceleran', 15, (builder) => {
        let wall_run_1 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:kineceleran', 'wall_run_1', builder.getPartialTicks());
        if (wall_run_1 > 0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(85)
                .animate('easeInOutSine', wall_run_1);
            builder.get('left_arm')
                .setXRotDegrees(-85)
                .animate('easeInOutSine', wall_run_1);
            builder.get('right_leg')
                .setXRotDegrees(-95)
                .animate('easeInOutSine', wall_run_1);
            builder.get('left_leg')
                .setXRotDegrees(95)
                .animate('easeInOutSine', wall_run_1);
        }
        if (wall_run_1 > 0.0 && builder.isFirstPerson()) {
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/wall_run_2', 'alienevo_aliens:kineceleran', 15, (builder) => {
        let wall_run_2 = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:kineceleran', 'wall_run_2', builder.getPartialTicks());
        if (wall_run_2 > 0 && !builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-85)
                .animate('easeInOutSine', wall_run_2);
            builder.get('left_arm')
                .setXRotDegrees(85)
                .animate('easeInOutSine', wall_run_2);
            builder.get('right_leg')
                .setXRotDegrees(95)
                .animate('easeInOutSine', wall_run_2);
            builder.get('left_leg')
                .setXRotDegrees(-95)
                .animate('easeInOutSine', wall_run_2);
        }
        if (wall_run_2 > 0.0 && builder.isFirstPerson()) {
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/wall_rund', 'alienevo_aliens:kineceleran', 15, (builder) => {
        let wall_run_down = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:kineceleran', 'on_wall_down', builder.getPartialTicks());
        if (wall_run_down > 0 && !builder.isFirstPerson()) {
            builder.get('body')
                .setX(0)
                .setY(5)
                .setZ(-5)
                .setXRotDegrees(-80)
                .setYRotDegrees(180)
                .setZRotDegrees(0)
                .animate('InOutCubic', wall_run_down);
            builder.get('head')
                .setXRotDegrees(0)
                .animate('InOutCubic', wall_run_down);
        }
        if (wall_run_down > 0.0 && builder.isFirstPerson()) {
        }
    });
});
ClientEvents.tick(event => {
    if (abilityUtil.hasPower(event.player, "alienevo_aliens:kineceleran")) {
        let kickDashActive = abilityUtil.isEnabled(event.player, "alienevo_aliens:kineceleran", "kick_dash_anim");
        let motionDamageActive = abilityUtil.isEnabled(event.player, "alienevo_aliens:kineceleran", "invis");
        if (kickDashActive || motionDamageActive) {
            let mode = Client.options.getCameraType();
            if (mode !== 'third_person_back' && mode !== 'third_person_front') {
                event.player.persistentData.camera_reset = 1;
                Client.options.setCameraType('third_person_back');
            }
        }
        let end = event.player.persistentData.camera_reset;
        if (!kickDashActive && !motionDamageActive && end === 1) {
            event.player.persistentData.camera_reset = 0;
            Client.options.setCameraType('first_person');
        }
    }
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/barrage_1', 'alienevo_aliens:kineceleran', 15, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:kineceleran", "barrage_1")) {
            if (!builder.isFirstPerson()) {
                builder.get('left_arm')
                    .setXRot(0.52 + builder.getModel().head.xRot)
                    .setYRot(0.09 + builder.getModel().head.yRot)
                    .setZRot(-0 + builder.getModel().head.zRot)
                    .moveZ(1);
                builder.get('right_arm')
                    .setXRot(-1.22 + builder.getModel().head.xRot)
                    .setYRot(-0.44 + builder.getModel().head.yRot)
                    .setZRot(0.35 + builder.getModel().head.zRot)
                    .moveZ(-1);
            }
            if (builder.isFirstPerson()) {
                builder.get('right_arm')
                    .setYRotDegrees(-32.5)
                    .setZ(4);
                builder.get('left_arm')
                    .setY(-2);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/barrage_2', 'alienevo_aliens:kineceleran', 15, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:kineceleran", "barrage_2")) {
            if (!builder.isFirstPerson()) {
                builder.get('left_arm')
                    .setXRot(-1.22 + builder.getModel().head.xRot)
                    .setYRot(0.44 + builder.getModel().head.yRot)
                    .setZRot(-0.35 + builder.getModel().head.zRot)
                    .moveZ(-1);
                builder.get('right_arm')
                    .setXRot(0.52 + builder.getModel().head.xRot)
                    .setYRot(-0.09 + builder.getModel().head.yRot)
                    .setZRot(0 + builder.getModel().head.zRot)
                    .moveZ(1);
            }
            if (builder.isFirstPerson()) {
                builder.get('right_arm')
                    .setY(-2);
                builder.get('left_arm')
                    .setYRotDegrees(32.5)
                    .setZ(4);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/barrage_3', 'alienevo_aliens:kineceleran', 15, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:kineceleran", "barrage_3")) {
            if (!builder.isFirstPerson()) {
                builder.get('left_arm')
                    .setXRot(0.52 + builder.getModel().head.xRot)
                    .setYRot(0.09 + builder.getModel().head.yRot)
                    .setZRot(-0 + builder.getModel().head.zRot)
                    .moveZ(1);
                builder.get('right_arm')
                    .setXRot(-1.22 + builder.getModel().head.xRot)
                    .setYRot(-0.44 + builder.getModel().head.yRot)
                    .setZRot(0.35 + builder.getModel().head.zRot)
                    .moveZ(-1);
            }
            if (builder.isFirstPerson()) {
                builder.get('right_arm')
                    .setYRotDegrees(-32.5)
                    .setZ(4);
                builder.get('left_arm')
                    .setY(-2);
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/barrage_4', 'alienevo_aliens:kineceleran', 15, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:kineceleran", "barrage_4")) {
            if (!builder.isFirstPerson()) {
                builder.get('left_arm')
                    .setXRot(-1.22 + builder.getModel().head.xRot)
                    .setYRot(0.44 + builder.getModel().head.yRot)
                    .setZRot(-0.35 + builder.getModel().head.zRot)
                    .moveZ(-1);
                builder.get('right_arm')
                    .setXRot(0.52 + builder.getModel().head.xRot)
                    .setYRot(-0.09 + builder.getModel().head.yRot)
                    .setZRot(0 + builder.getModel().head.zRot)
                    .moveZ(1);
            }
            if (builder.isFirstPerson()) {
                builder.get('right_arm')
                    .setY(-2);
                builder.get('left_arm')
                    .setYRotDegrees(32.5)
                    .setZ(4);
            }
        }
    });
});
ClientEvents.tick(event => {
    let player = event.player;
    if (!player) return;
    if (abilityUtil.hasPower(player, "alienevo_aliens:kineceleran")) {
        if (abilityUtil.isEnabled(player, "alienevo_aliens:kineceleran", "kineceleran_loop")) {
            if (!player.persistentData.bobbing_saved) {
                player.persistentData.original_bobbing = Client.options.bobView().get();
                player.persistentData.bobbing_saved = true;
                Client.options.bobView().set(false);
            }
        }
    }
});
ClientEvents.tick(event => {
    let player = event.player;
    if (!player) return;
    if (player.persistentData.bobbing_saved &&
        (!abilityUtil.hasPower(player, "alienevo_aliens:kineceleran") ||
            !abilityUtil.isEnabled(player, "alienevo_aliens:kineceleran", "kineceleran_loop"))) {
        let originalBobbing = player.persistentData.original_bobbing;
        if (originalBobbing) {
            Client.options.bobView().set(true);
        }
        player.persistentData.bobbing_saved = false;
        player.persistentData.original_bobbing = false;
    }
});