StartupEvents.registry('palladium:abilities', (event) => {
  event.create('alienevo:screenshake_loop')
    .icon(palladium.createItemIcon('minecraft:piston'))
    .addProperty("vertical_intensity", "float", 0.3, "Vertical Shake Intensity (degrees)")
    .addProperty("horizontal_intensity", "float", 1.0, "Horizontal Shake Intensity (degrees)")
    .addProperty("frequency", "float", 1.0, "Speed multiplier (1.0 = normal, 2.0 = faster)")
    .tick((entity, entry, holder, enabled) => {
      if (enabled && entity.isPlayer()) {
        let vertIntensity = entry.getPropertyByName("vertical_intensity");
        let horizIntensity = entry.getPropertyByName("horizontal_intensity");
        let frequency = entry.getPropertyByName("frequency");
        
        // Calculate the current phase of the screen shake
        let phase = Math.floor((entity.level.time * frequency) % 4);
        
        // Get the current player rotation
        let currentYaw = entity.getYaw();
        let currentPitch = entity.getPitch();
        
        // Apply the screen shake based on the current phase
        switch (phase) {
          case 0:
            entity.setYaw(currentYaw + horizIntensity);
            entity.setPitch(currentPitch + vertIntensity);
            break;
          case 1:
            entity.setYaw(currentYaw - horizIntensity);
            entity.setPitch(currentPitch - vertIntensity);
            break;
          case 2:
            entity.setYaw(currentYaw - horizIntensity);
            entity.setPitch(currentPitch + vertIntensity);
            break;
          case 3:
            entity.setYaw(currentYaw + horizIntensity);
            entity.setPitch(currentPitch - vertIntensity);
            break;
        }
      }
    });
});