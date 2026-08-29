PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/astro_sprint', 'alienevo_aliens:astrobot', 200, (builder) => {
        let astro_sprint = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo_aliens:astrobot', 'astro_sprint', builder.getPartialTicks()
        );
        if (astro_sprint > 0.0) {
            if (!builder.isFirstPerson()) {
                builder.get('left_arm')
                    .setZRotDegrees(-45)
                    .animate('easeOutQuad', astro_sprint);
                builder.get('right_arm')
                    .setZRotDegrees(45)
                    .animate('easeOutQuad', astro_sprint);
            }
        }
    }
    );
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/astro_jump', 'alienevo_aliens:astrobot', 200, (builder) => {
        let astro_jump = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo_aliens:astrobot', 'astro_jump', builder.getPartialTicks()
        );
        if (astro_jump > 0.0) {
            if (!builder.isFirstPerson()) {
                builder.get('left_leg')
                    .setXRotDegrees(0)
                    .animate('easeInOutQuad', astro_jump);
                builder.get('right_leg')
                    .setXRotDegrees(0)
                    .animate('easeInOutQuad', astro_jump);
            }
        }
    }
    );
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/astro_punch', 'alienevo_aliens:astrobot', 200, (builder) => {
        let astro_punch = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo_aliens:astrobot', 'astro_punch', builder.getPartialTicks()
        );
        if (astro_punch > 0.0) {
            if (!builder.isFirstPerson()) {
                builder.get('left_arm')
                    .setXRotDegrees(0)
                    .setYRotDegrees(0)
                    .setZRotDegrees(0)
                    .animate('easeInOutQuad', astro_punch);
                builder.get('right_arm')
                    .setXRotDegrees(0)
                    .setYRotDegrees(0)
                    .setZRotDegrees(0)
                    .animate('easeInOutQuad', astro_punch);
            }
        }
    }
    );
});
PalladiumEvents.registerAnimations((event) => {
    event.registerForPower('alienevo/astro_punchair', 'alienevo_aliens:astrobot', 200, (builder) => {
        let astro_punchair = animationUtil.getAnimationTimerAbilityValue(
            builder.getPlayer(), 'alienevo_aliens:astrobot', 'astro_punchair', builder.getPartialTicks());
        if (astro_punchair > 0 && !builder.isFirstPerson()) {
            builder.get('body').rotateYDegrees(340).animate('easeOutBack', astro_punchair);
            builder.get('left_arm')
                .setXRotDegrees(0)
                .setYRotDegrees(0)
                .setZRotDegrees(0)
                .animate('easeOutBack', astro_punchair);
            builder.get('right_arm')
                .setXRotDegrees(0)
                .setYRotDegrees(0)
                .setZRotDegrees(0)
                .animate('easeOutBack', astro_punchair);
        }
        if (astro_punchair > 0.0 && builder.isFirstPerson()) {
        }
    });
});