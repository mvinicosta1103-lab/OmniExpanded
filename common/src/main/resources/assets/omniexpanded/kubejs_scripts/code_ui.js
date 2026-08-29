let colorfulHeartsLoaded = false;
try {
    Java.loadClass("terrails.colorfulhearts.CColorfulHearts");
    colorfulHeartsLoaded = true;
} catch (e) {
}

function calculateYOffset(player, maxHealth) {
    if (!player.isCreative() && !player.isSpectator()) {
        if (maxHealth > 180) return 27;
        if (maxHealth > 160) return 24;
        if (maxHealth > 140) return 28;
        if (maxHealth > 120) return 30;
        if (maxHealth > 100) return 30;
        if (maxHealth > 80) return 28;
        if (maxHealth > 60) return 24;
        if (maxHealth > 40) return 18;
        if (maxHealth > 20) return 10;
    }
    return 0;
}

PalladiumEvents.registerGuiOverlays((event) => {
    event.register(
        'alienevo/code_hud',
        (minecraft, gui, poseStack, partialTick, screenWidth, screenHeight) => {
            if (abilityUtil.hasPower(minecraft.player, "alienevo:prototype_omnitrix")) {
                if (abilityUtil.isEnabled(minecraft.player, "alienevo:prototype_omnitrix", "display_codes")) {
                    
                    let maxHealth = minecraft.player.getMaxHealth();
                    let yOffset = colorfulHeartsLoaded ? 0 : calculateYOffset(minecraft.player, maxHealth);
                    
                    let x = (screenWidth / 2) - (64 / 2) + 0.1;
                    let y = screenHeight - 76 - yOffset;
                    
                    guiUtil.blit(
                        new ResourceLocation('alienevo:textures/gui/codes/code_select.png'),
                        poseStack,
                        x, y,
                        0, 0,
                        64, 75,
                        64, 75
                    );
                }
            }
        }
    );
});

PalladiumEvents.registerGuiOverlays((event) => {
    let lastCode = "000000";
    let currentPosition = 0;
    
    event.register(
        'alienevo/code_hover',
        (minecraft, gui, poseStack, partialTick, screenWidth, screenHeight) => {
            if (abilityUtil.hasPower(minecraft.player, "alienevo:prototype_omnitrix")) {
                if (abilityUtil.isEnabled(minecraft.player, "alienevo:prototype_omnitrix", "display_codes")) {
                    
                    let maxHealth = minecraft.player.getMaxHealth();
                    let yOffset = colorfulHeartsLoaded ? 0 : calculateYOffset(minecraft.player, maxHealth);
                    
                    let currentCode = minecraft.player.persistentData.code || "000000";
                    
                    if (currentCode !== lastCode) {
                        currentPosition = (currentPosition + 1) % 6;
                        lastCode = currentCode;
                    }
                    
                    let baseX = (screenWidth / 2) - (64 / 2) + 0.1;
                    let baseY = screenHeight - 76 - yOffset;
                    
                    let xOffset = currentPosition * 11;
                    
                    
                    let score = palladium.scoreboard.getScore(minecraft.player, "code_position", 0);
                    
                    guiUtil.blit(
                        new ResourceLocation(`alienevo:textures/gui/codes/code_selection_${score}.png`),
                        poseStack,
                        baseX + xOffset, baseY,
                        0, 0,
                        64, 75,
                        64, 75
                    );
                }
            }
        }
    );
});