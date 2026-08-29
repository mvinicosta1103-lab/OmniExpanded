let ClientboundSetEntityMotionPacket = Java.loadClass('net.minecraft.network.protocol.game.ClientboundSetEntityMotionPacket');

StartupEvents.registry('palladium:abilities', (event) => {

  event.create('alienevo:pyro_surf')

    .icon(palladium.createItemIcon('palladium:vibranium_circuit'))

    .tick((entity, entry, holder, enabled) => {
      if (enabled) {
        let move = entity.getLookAngle().scale(1.2);
        entity.setDeltaMovement(move);

        if (entity.isPlayer()) {
          entity.connection.send(new ClientboundSetEntityMotionPacket(entity));
        }
      }
    })
});