StartupEvents.registry('palladium:abilities', (event) => {
    event.create('alienevo:store_armor')
        .icon(palladium.createItemIcon('palladium:vibranium_circuit'))
        .documentationDescription('Store your armor away for when you need it most.')
        .addProperty('namespace', 'string', 'alienevo', 'unique namespace for your storage location')
        .addProperty('identity', 'string', 'store', 'unique extra name for your storage location')
        .lastTick((entity, entry, holder, enabled) => {
            if (enabled && !entity.isDeadOrDying()) {
                let armorSlots = ['head', 'chest', 'legs', 'feet'];
                let hasArmor = false;

                armorSlots.forEach(slot => {
                    if (entity[slot + 'ArmorItem']) {
                        hasArmor = true;
                        entity.persistentData.put(slot + 'ArmorStore', entity[slot + 'ArmorItem']);
                        entity.server.runCommandSilent(`item replace entity ${entity.getGameProfile().getName()} armor.${slot} with air`);
                    }
                });

                if (hasArmor) {
                    entity.persistentData.putBoolean('hasStoredArmor', true);
                }
            }
        });

    event.create('alienevo:retrieve_armor')
        .icon(palladium.createItemIcon('minecraft:iron_chestplate'))
        .documentationDescription('Retrieve your stored armor.')
        .addProperty('namespace', 'string', 'alienevo', '')
        .addProperty('identity', 'string', 'store', '')
        .firstTick((entity, entry, holder, enabled) => {
            if (enabled && !entity.isDeadOrDying() && entity.persistentData.getBoolean('hasStoredArmor')) {
                let armorSlots = ['head', 'chest', 'legs', 'feet'];

                armorSlots.forEach(slot => {
                    if (entity.persistentData.contains(slot + 'ArmorStore')) {
                        let storedArmor = entity.persistentData.get(slot + 'ArmorStore');

                        let nbtString = '';
                        if (storedArmor.tag) {
                            nbtString = storedArmor.tag.toString();
                        }

                        let command = `item replace entity ${entity.getGameProfile().getName()} armor.${slot} with ${storedArmor.id}${nbtString}`;
                        entity.server.runCommandSilent(command);
                        entity.persistentData.remove(slot + 'ArmorStore');
                    }
                });

                entity.persistentData.remove('hasStoredArmor');
            }
        });
});