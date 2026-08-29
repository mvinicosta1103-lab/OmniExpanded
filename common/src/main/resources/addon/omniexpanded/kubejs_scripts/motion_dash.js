let ClientboundSetEntityMotionPacket = Java.loadClass('net.minecraft.network.protocol.game.ClientboundSetEntityMotionPacket');

StartupEvents.registry('palladium:abilities', (event) => {
  event.create('alienevo:motion_dash')
    .icon(palladium.createItemIcon('palladium:vibranium_circuit'))
    .addProperty("motion", "float", 1, "Motion")
    .tick((entity, entry, holder, enabled) => {
      if (enabled) {
        let motion = entry.getPropertyByName("motion");
        let angle = entity.getLookAngle().scale(motion);
        entity.setDeltaMovement(angle);
        entity.motionY = -1;

        if (entity.isPlayer()) {
          entity.connection.send(new ClientboundSetEntityMotionPacket(entity));
        }
      }
    });
});