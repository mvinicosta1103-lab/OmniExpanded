const InventoryScreen = Java.loadClass('net.minecraft.client.gui.screens.inventory.InventoryScreen');
const Quaternionf = Java.loadClass('org.joml.Quaternionf');

PalladiumEvents.registerGuiOverlays((event) => {
    event.register(
        'ALIENEVO/TEST',
        (minecraftClient, gui, poseStack, partialTick, screenWidth, screenHeight) => {
            const player = minecraftClient.player;
            if (abilityUtil.hasPower(player, "alienevo:quick_change")) {
                if (abilityUtil.isEnabled(player, "alienevo:quick_change", "quick_change")) {
                    const wheelState = palladium.getProperty(player, 'quick_change_wheel');
                    if (wheelState === "enabled") {
                        let xPos = screenWidth / 2;
                        let yPos = (screenHeight / 2) + 40;
                        let yaw = -(player.yBodyRot + 20) * JavaMath.PI / 180;
                        poseStack.pose().pushPose();
                        poseStack.pose().translate(0, 0, 100);

                        InventoryScreen.renderEntityInInventory(
                            poseStack, 
                            xPos,
                            yPos,
                            40,
                            new Quaternionf(Math.cos(0.5 * yaw), 0, -Math.sin(0.5 * yaw), 0),
                            null,
                            player
                        );
                        
                        poseStack.pose().popPose();
                    }
                }
            }
        });
});