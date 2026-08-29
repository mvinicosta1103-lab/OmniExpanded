PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/petrolimbs', "alienevo_aliens:petrosapien", 15, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:petrosapien", "petrosapien_loop")) {
            if (!builder.isFirstPerson()) {
                if (builder.getPlayer().isCrouching()) {
                    builder.get('body')
                        .setY(2)
                    builder.get('chest')
                        .setXRotDegrees(15)
                    builder.get('left_leg')
                        .setY(builder.getModel().leftLeg.y + 2)
                    builder.get('right_leg')
                        .setY(builder.getModel().rightLeg.y + 2)
                }
            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('diamond/pillar', "alienevo_aliens:petrosapien", 200, (builder) => {
        let diamond_pillar = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo_aliens:petrosapien', 'diamond_pillar_anim', builder.getPartialTicks());
        builder.get('body')
            .moveY(-8)
            .animate('InOutCubic', diamond_pillar);
        builder.get('head')
            .setX(0)
            .setY(2.25)
            .setZ(-3)
            .rotateXDegrees(10)
            .animate('InOutCubic', diamond_pillar);
        builder.get('chest')
            .setX(0)
            .setY(2)
            .setZ(-3)
            .setXRotDegrees(20)
            .animate('InOutCubic', diamond_pillar);
        builder.get('right_arm')
            .setX(-5)
            .setY(5)
            .setZ(-3)
            .setXRotDegrees(-25)
            .setYRotDegrees(-23)
            .setZRotDegrees(19)
            .animate('InOutCubic', diamond_pillar);
        builder.get('left_arm')
            .setX(5)
            .setY(5)
            .setZ(-3)
            .setXRotDegrees(-25)
            .setYRotDegrees(23)
            .setZRotDegrees(-19)
            .animate('InOutCubic', diamond_pillar);
        builder.get('right_leg')
            .setX(-1.9)
            .setY(12)
            .setZ(-4)
            .setXRotDegrees(75)
            .animate('InOutCubic', diamond_pillar);
        builder.get('left_leg')
            .setX(1.9)
            .setY(7)
            .setZ(-3)
            .setXRotDegrees(10)
            .animate('InOutCubic', diamond_pillar);
        if (diamond_pillar > 0.0 && builder.isFirstPerson()) {
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
                .animate('InOutCubic', diamond_pillar);
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
                .animate('InOutCubic', diamond_pillar);
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('diamond/spikes', "alienevo_aliens:petrosapien", 200, (builder) => {
        let diamond_spikes = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo_aliens:petrosapien', 'diamond_spikes_anim', builder.getPartialTicks());
        builder.get('body')
            .moveY(-8)
            .animate('InOutCubic', diamond_spikes);
        builder.get('head')
            .setX(0)
            .setY(2.25)
            .setZ(-3)
            .rotateXDegrees(10)
            .animate('InOutCubic', diamond_spikes);
        builder.get('chest')
            .setX(0)
            .setY(2)
            .setZ(-3)
            .setXRotDegrees(20)
            .animate('InOutCubic', diamond_spikes);
        builder.get('right_arm')
            .setX(-5)
            .setY(5)
            .setZ(-3)
            .setXRotDegrees(0)
            .setYRotDegrees(-77.5)
            .setZRotDegrees(0)
            .animate('InOutCubic', diamond_spikes);
        builder.get('left_arm')
            .setXRotDegrees(54)
            .setYRotDegrees(-12)
            .setZRotDegrees(-16)
            .animate('InOutCubic', diamond_spikes);
        builder.get('right_leg')
            .setX(-1.9)
            .setY(12)
            .setZ(-4)
            .setXRotDegrees(75)
            .animate('InOutCubic', diamond_spikes);
        builder.get('left_leg')
            .setX(1.9)
            .setY(7)
            .setZ(-3)
            .setXRotDegrees(10)
            .animate('InOutCubic', diamond_spikes);
        if (diamond_spikes > 0.0 && builder.isFirstPerson()) {
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
                .animate('InOutCubic', diamond_spikes);
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
                .animate('InOutCubic', diamond_spikes);
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/shield', "alienevo_aliens:petrosapien", 200, (builder) => {
        let shield_anim = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:petrosapien', 'shield_activate', builder.getPartialTicks());
        if (shield_anim > 0 && !builder.isFirstPerson()) {
            builder.get('left_arm')
                .setXRotDegrees(-75)
                .setYRotDegrees(65)
                .setZRotDegrees(-10)
                .setX(5 + 1)
                .setZ(0)
                .animate('easeOutSine', shield_anim);
        }
        if (shield_anim > 0.0 && builder.isFirstPerson()) {
            builder.get('left_arm')
                .setXRotDegrees(-55)
                .setYRotDegrees(-20)
                .setZRotDegrees(120)
                .setX(20)
                .setY(-3)
                .setZ(-2)
                .animate('easeOutSine', shield_anim);
        } else {
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/diamond_sword', "alienevo_aliens:petrosapien", 200, (builder) => {
        let sword_anim = animationUtil.getAnimationTimerAbilityValue(builder.getPlayer(), 'alienevo_aliens:petrosapien', 'battle_mode', builder.getPartialTicks());
        if (sword_anim > 0.0 && builder.isFirstPerson()) {
            builder.get('right_arm')
                .setXRotDegrees(-10)
                .setYRotDegrees(35)
                .setZRotDegrees(-40)
                .setX(-3)
                .setY(1)
                .setZ(-4)
                .animate('easeOutSine', sword_anim);
        } else {
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo_aliens/petrolimbswing', "alienevo_aliens:petrosapien", 15, (builder) => {
        if (abilityUtil.isEnabled(builder.getPlayer(), "alienevo_aliens:petrosapien", "petrosapien_loop")) {
            if (!builder.isFirstPerson()) {
                const halfPi = 1.57079632679;
                builder.get('left_arm').rotateX(builder.getModel().leftArm.xRot * -0.4)
                builder.get('right_arm').rotateX(builder.getModel().rightArm.xRot * -0.4)
                builder.get('right_leg').rotateX(builder.getModel().rightLeg.xRot * -0.4)
                builder.get('left_leg').rotateX(builder.getModel().leftLeg.xRot * -0.4)

            }
        }
    });
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('diamond/circle', "alienevo_aliens:petrosapien", 200, (builder) => {
        let diamond_circle = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo_aliens:petrosapien', 'spikes_circle_anim', builder.getPartialTicks());
        builder.get('body')
            .moveY(-8)
            .animate('InOutCubic', diamond_circle);
        builder.get('head')
            .setX(0)
            .setY(2.25)
            .setZ(-3)
            .rotateXDegrees(10)
            .animate('InOutCubic', diamond_circle);
        builder.get('chest')
            .setX(0)
            .setY(2)
            .setZ(-3)
            .setXRotDegrees(20)
            .animate('InOutCubic', diamond_circle);
        builder.get('right_arm')
            .setX(-5)
            .setY(5)
            .setZ(-3)
            .setXRotDegrees(-25)
            .setYRotDegrees(-23)
            .setZRotDegrees(19)
            .animate('InOutCubic', diamond_circle);
        builder.get('left_arm')
            .setX(5)
            .setY(5)
            .setZ(-3)
            .setXRotDegrees(-25)
            .setYRotDegrees(23)
            .setZRotDegrees(-19)
            .animate('InOutCubic', diamond_circle);
        builder.get('right_leg')
            .setX(-1.9)
            .setY(12)
            .setZ(-4)
            .setXRotDegrees(75)
            .animate('InOutCubic', diamond_circle);
        builder.get('left_leg')
            .setX(1.9)
            .setY(7)
            .setZ(-3)
            .setXRotDegrees(10)
            .animate('InOutCubic', diamond_circle);
        if (diamond_circle > 0.0 && builder.isFirstPerson()) {
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
                .animate('InOutCubic', diamond_circle);
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
                .animate('InOutCubic', diamond_circle);
        }
    });
});