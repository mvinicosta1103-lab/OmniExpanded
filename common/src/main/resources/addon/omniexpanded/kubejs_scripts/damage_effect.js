StartupEvents.registry("mob_effect", (event) => {
  event
    .create("alienevo:scared")
    .harmful()
    .color(Color.BLACK)
    .effectTick((entity, level) => {
      if (entity.age % 20 == 0) entity.attack(1);
    });
    
  event.create("alienevo:goo")
    .harmful()
    .color(Color.GREEN)
    .effectTick((entity, level) => {
      if (!entity.level.clientSide) {
        if (entity.age % 20 == 0) {
          entity.potionEffects.add("minecraft:weakness", 40, 3, false, false);
          entity.potionEffects.add("minecraft:nausea", 120, 0, false, false);
          entity.potionEffects.add("minecraft:slowness", 40, 6, false, false);
        }
        
        if (entity.level.time % 5 == 0) {
          entity.level.spawnParticles('alienevo:slime', false,
            entity.x, entity.y + 1, entity.z,
            0.2, 0.4, 0.2, 4, 0.05);
        }
        
        let $Vec3 = Java.loadClass('net.minecraft.world.phys.Vec3');
        
        let detectionDistance = 0.2; // detect walls
        let expandedBB = entity.getBoundingBox().inflate(detectionDistance, 0.1, detectionDistance);
        
        let hasCollisions = false;
        try {
          let iterator = entity.level.getBlockCollisions(entity, expandedBB);
          if (iterator && iterator.iterator && typeof iterator.iterator === 'function') {
            let it = iterator.iterator();
            hasCollisions = it && typeof it.hasNext === 'function' && it.hasNext();
          }
        } catch (e) {
          hasCollisions = false;
        }
        
        let nearWall = hasCollisions || entity.horizontalCollision;
        let wasStuck = entity.tags.contains("alienevo:goo_stuck");
        
        if (nearWall) {
          try {
            let zeroVec = new $Vec3(0, 0, 0);
            entity.setDeltaMovement(zeroVec);
            
            if (!wasStuck) {
              entity.tags.add("alienevo:goo_stuck");
            }
          } catch (e) {
          }
        } else {
          try {
            if (wasStuck) {
              try {
                entity.tags.remove("alienevo:goo_stuck");
              } catch (e) {
              }
            }
          } catch (e) {
          }
        }
      }
    });
});

StartupEvents.registry("mob_effect", (event) => {
  event
    .create("alienevo:flatten")
    .harmful()
    .color(Color.GRAY)
    .effectTick((entity, level) => {
      palladium.superpowers.addSuperpower(entity, "alienevo:flatten");
    });
});