StartupEvents.registry('palladium:abilities', (event) => {
  event.create('alienevo:glow_color_module')
    .icon(palladium.createItemIcon('minecraft:nether_star'))
    .tick((entity, entry, holder, enabled) => {
      if (enabled) {
        try {
          let username = entity.getGameProfile().getName();

          let mainHandItem = entity.getMainHandItem();

          if (mainHandItem.isEmpty()) {
            let currentColor = palladium.getProperty(entity, 'AlienEvo.Color');

            if (currentColor && currentColor !== '' && currentColor !== 'default') {
              let prevColorModule = `alienevo:color_module_${currentColor}`;

              let prevColorItem = Item.of(prevColorModule);

              if (prevColorItem && !prevColorItem.isEmpty()) {
                entity.setMainHandItem(prevColorItem);
              }

              palladium.setProperty(entity, 'AlienEvo.Color', 'default');

              entity.server.runCommandSilent(`execute as ${username} at @s run playsound minecraft:block.beacon.deactivate player @s ~ ~ ~ 0.5 1.5 0.5`);
            }

            return;
          }

          if (!mainHandItem || mainHandItem.isEmpty()) {
            return;
          }

          let itemId = mainHandItem.getId().toString();

          if (!itemId.startsWith('alienevo:color_module_')) {
            return;
          }

          let newColorName = itemId.replace('alienevo:color_module_', '');

          let currentColor = palladium.getProperty(entity, 'AlienEvo.Color');

          if (currentColor === newColorName) {
            return;
          }

          palladium.setProperty(entity, 'AlienEvo.Color', newColorName);

          entity.server.runCommandSilent(`execute as ${username} at @s run playsound alienevo:color_module_insert player @s ~ ~ ~ 1 1 1`);

          if (currentColor && currentColor !== '') {
            let prevColorModule = `alienevo:color_module_${currentColor}`;

            let prevColorItem = Item.of(prevColorModule);

            mainHandItem.shrink(1);

            if (prevColorItem && !prevColorItem.isEmpty()) {
              entity.setMainHandItem(prevColorItem);
            }
          } else {
            mainHandItem.shrink(1);
          }
        } catch (e) {
        }
      }
    });
});
StartupEvents.registry('palladium:abilities', (event) => {
  event.create('alienevo:primary_color_module')
    .icon(palladium.createItemIcon('minecraft:red_dye'))
    .tick((entity, entry, holder, enabled) => {
      if (enabled) {
        try {
          let username = entity.getGameProfile().getName();

          let mainHandItem = entity.getMainHandItem();

          if (mainHandItem.isEmpty()) {
            let currentColor = palladium.getProperty(entity, 'AlienEvo.PrimaryColor');

            if (currentColor && currentColor !== '' && currentColor !== 'default') {
              let prevColorModule = `alienevo:color_module_${currentColor}`;

              let prevColorItem = Item.of(prevColorModule);

              if (prevColorItem && !prevColorItem.isEmpty()) {
                entity.setMainHandItem(prevColorItem);
              }

              palladium.setProperty(entity, 'AlienEvo.PrimaryColor', 'default');

              entity.server.runCommandSilent(`execute as ${username} at @s run playsound minecraft:block.beacon.deactivate player @s ~ ~ ~ 0.5 1.5 0.5`);
            }

            return;
          }

          if (!mainHandItem || mainHandItem.isEmpty()) {
            return;
          }

          let itemId = mainHandItem.getId().toString();

          if (!itemId.startsWith('alienevo:color_module_')) {
            return;
          }

          let newColorName = itemId.replace('alienevo:color_module_', '');

          let currentColor = palladium.getProperty(entity, 'AlienEvo.PrimaryColor');

          if (currentColor === newColorName) {
            return;
          }

          palladium.setProperty(entity, 'AlienEvo.PrimaryColor', newColorName);

          entity.server.runCommandSilent(`execute as ${username} at @s run playsound alienevo:color_module_insert player @s ~ ~ ~ 1 1 1`);

          if (currentColor && currentColor !== '') {
            let prevColorModule = `alienevo:color_module_${currentColor}`;

            let prevColorItem = Item.of(prevColorModule);

            mainHandItem.shrink(1);

            if (prevColorItem && !prevColorItem.isEmpty()) {
              entity.setMainHandItem(prevColorItem);
            }
          } else {
            mainHandItem.shrink(1);
          }
        } catch (e) {
        }
      }
    });
});
StartupEvents.registry('palladium:abilities', (event) => {
  event.create('alienevo:secondary_color_module')
    .icon(palladium.createItemIcon('minecraft:blue_dye'))
    .tick((entity, entry, holder, enabled) => {
      if (enabled) {
        try {
          let username = entity.getGameProfile().getName();

          let mainHandItem = entity.getMainHandItem();

          if (mainHandItem.isEmpty()) {
            let currentColor = palladium.getProperty(entity, 'AlienEvo.SecondaryColor');

            if (currentColor && currentColor !== '' && currentColor !== 'default') {
              let prevColorModule = `alienevo:color_module_${currentColor}`;

              let prevColorItem = Item.of(prevColorModule);

              if (prevColorItem && !prevColorItem.isEmpty()) {
                entity.setMainHandItem(prevColorItem);
              }

              palladium.setProperty(entity, 'AlienEvo.SecondaryColor', 'default');

              entity.server.runCommandSilent(`execute as ${username} at @s run playsound minecraft:block.beacon.deactivate player @s ~ ~ ~ 0.5 1.5 0.5`);
            }

            return;
          }

          if (!mainHandItem || mainHandItem.isEmpty()) {
            return;
          }

          let itemId = mainHandItem.getId().toString();

          if (!itemId.startsWith('alienevo:color_module_')) {
            return;
          }

          let newColorName = itemId.replace('alienevo:color_module_', '');

          let currentColor = palladium.getProperty(entity, 'AlienEvo.SecondaryColor');

          if (currentColor === newColorName) {
            return;
          }

          palladium.setProperty(entity, 'AlienEvo.SecondaryColor', newColorName);

          entity.server.runCommandSilent(`execute as ${username} at @s run playsound alienevo:color_module_insert player @s ~ ~ ~ 1 1 1`);

          if (currentColor && currentColor !== '') {
            let prevColorModule = `alienevo:color_module_${currentColor}`;

            let prevColorItem = Item.of(prevColorModule);

            mainHandItem.shrink(1);

            if (prevColorItem && !prevColorItem.isEmpty()) {
              entity.setMainHandItem(prevColorItem);
            }
          } else {
            mainHandItem.shrink(1);
          }
        } catch (e) {
        }
      }
    });
});