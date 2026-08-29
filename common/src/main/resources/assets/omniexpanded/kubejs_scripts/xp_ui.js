PalladiumEvents.registerGuiOverlays((event) => {
    event.register(
        'alienevo/experiencebar',
        (minecraft, gui, poseStack, partialTick, screenWidth, screenHeight) => {
            let player = minecraft.player;
            if (!player) return;

            let currentAlienNumber = palladium.getProperty(player, 'omnitrix_cycle');

            if (currentAlienNumber && currentAlienNumber > 0) {
                let alienInfo = global[`alienevo_alien_${currentAlienNumber}`];
                if (!alienInfo) return;

                let alienFullName = alienInfo[0];
                let alienNamespace = 'alienevo_aliens';
                let alienPath = alienFullName;

                if (alienFullName.includes(':')) {
                    const parts = alienFullName.split(':');
                    alienNamespace = parts[0];
                    alienPath = parts[1];
                }

                const powerName = `${alienNamespace}:${alienPath}`;

                const hiddenPowers = [
                    'alienevo_aliens:galvanic_rod',
                    'alienevo_aliens:galvan',
                ];

                if (hiddenPowers.includes(powerName)) {
                    return;
                }

                const hasPower = abilityUtil.hasPower(player, powerName);

                if (hasPower) {
                    poseStack.pose().pushPose();

                    poseStack.pose().translate(0, 0, 1);

                    let x = screenWidth - 44 - 4;
                    let y = screenHeight - 3 - 1;
                    let level_x = (screenWidth - 66);
                    let level_y = (screenHeight - 16);

                    if (minecraft.screen != null && minecraft.screen.getClass().getSimpleName().equals("ChatScreen")) {
                        y = 1;
                        level_y = 8;
                        level_x = (screenWidth - 66);
                    }


                    let simpleName = alienPath.charAt(0).toUpperCase() + alienPath.slice(1);

                    let alien_level = palladium.scoreboard.getScore(player, `${simpleName}.Level`, 0);
                    let currentXp = palladium.scoreboard.getScore(player, `${simpleName}.XP`, 0);
                    let skillPoints = palladium.scoreboard.getScore(player, `${simpleName}.SkillPoint`, 0);

                    let maxXp = alien_level > 0 ? 100 * alien_level : 100;

                    if (minecraft.screen != null && minecraft.screen.getClass().getSimpleName().equals("ChatScreen")) {
                        guiUtil.drawString(poseStack, Component.string(`${alien_level}`), level_x + 1, level_y, 0x000000);
                        guiUtil.drawString(poseStack, Component.string(`${alien_level}`), level_x, level_y + 1, 0x000000);
                        guiUtil.drawString(poseStack, Component.string(`${alien_level}`), level_x - 1, level_y, 0x000000);
                        guiUtil.drawString(poseStack, Component.string(`${alien_level}`), level_x, level_y - 1, 0x000000);
                        guiUtil.drawString(poseStack, Component.string(`${alien_level}`), level_x, level_y, 0xb3ff40);

                        //guiUtil.drawString(poseStack, Component.string(`Level: ${alien_level}`), level_x-38+1, level_y-3, 0x000000);  
                        //guiUtil.drawString(poseStack, Component.string(`Level: ${alien_level}`), level_x-38, level_y-3+1, 0x000000);  
                        //guiUtil.drawString(poseStack, Component.string(`Level: ${alien_level}`), level_x-38-1, level_y-3, 0x000000);  
                        //guiUtil.drawString(poseStack, Component.string(`Level: ${alien_level}`), level_x-38, level_y-3-1, 0x000000);  
                        //guiUtil.drawString(poseStack, Component.string(`Level: ${alien_level}`), level_x-38, level_y-3, 0xb3ff40);   

                        //guiUtil.drawString(poseStack, Component.string(`Skill Points: ${skillPoints}`), level_x-55+1, level_y+8, 0x000000);
                        //guiUtil.drawString(poseStack, Component.string(`Skill Points: ${skillPoints}`), level_x-55, level_y+8+1, 0x000000);
                        //guiUtil.drawString(poseStack, Component.string(`Skill Points: ${skillPoints}`), level_x-55-1, level_y+8, 0x000000);
                        //guiUtil.drawString(poseStack, Component.string(`Skill Points: ${skillPoints}`), level_x-55, level_y+8-1, 0x000000);
                        //guiUtil.drawString(poseStack, Component.string(`Skill Points: ${skillPoints}`), level_x-55, level_y+8, 0xb3ff40);
                    } else {
                        guiUtil.drawString(poseStack, Component.string(`${alien_level}`), level_x + 1, level_y, 0x000000);
                        guiUtil.drawString(poseStack, Component.string(`${alien_level}`), level_x, level_y + 1, 0x000000);
                        guiUtil.drawString(poseStack, Component.string(`${alien_level}`), level_x - 1, level_y, 0x000000);
                        guiUtil.drawString(poseStack, Component.string(`${alien_level}`), level_x, level_y - 1, 0x000000);
                        guiUtil.drawString(poseStack, Component.string(`${alien_level}`), level_x, level_y, 0xb3ff40);

                    }

                    guiUtil.blit(
                        new ResourceLocation('alienevo:textures/gui/xp/xp_bar_empty.png'),
                        poseStack,
                        x, y,
                        0, 0,
                        44, 3,
                        44, 3
                    );

                    let pixelsToShow = maxXp > 0 ?
                        Math.max(1, Math.min(42, Math.floor((currentXp / maxXp) * 42))) :
                        (currentXp > 0 ? 42 : 1);

                    guiUtil.blit(
                        new ResourceLocation('alienevo:textures/gui/xp/xp_bar_progress.png'),
                        poseStack,
                        x, y,
                        0, 0,
                        pixelsToShow, 3,
                        44, 3
                    );

                    poseStack.pose().popPose();
                }
            }
        }
    );
});
