let ClientboundSetEntityMotionPacket = Java.loadClass('net.minecraft.network.protocol.game.ClientboundSetEntityMotionPacket');

StartupEvents.registry('palladium:abilities', (event) => {
  event.create('alienevo:motion')
    .icon(palladium.createItemIcon('palladium:vibranium_circuit'))
    .addProperty("motion", "float", 1, "Motion")
    .tick((entity, entry, holder, enabled) => {
      if (enabled) {
        let motion = entry.getPropertyByName("motion");
        let angle = entity.getLookAngle().scale(motion);
        entity.setDeltaMovement(angle);
        if (entity.isPlayer()) {
          entity.connection.send(new ClientboundSetEntityMotionPacket(entity));
        }
      }
    });
});

StartupEvents.registry('palladium:abilities', (event) => {
  event.create('alienevo:y_motion')
    .icon(palladium.createItemIcon('palladium:vibranium_circuit'))
    .addProperty("motion", "float", 1, "Motion")
    .tick((entity, entry, holder, enabled) => {
      if (enabled) {
        let motionValue = entry.getPropertyByName("motion");
        entity.motionY = motionValue;
        
        if (entity.isPlayer()) {
          entity.connection.send(new ClientboundSetEntityMotionPacket(entity));
        }
      }
    });
});