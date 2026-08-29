StartupEvents.registry('palladium:condition_serializer', (event) => {
  event.create('alienevo:is_crafted')
    .addProperty("craft_type", "string", "default", "Persistent data used")
    .test((entity, props) => {
      let craft_type = props.get("craft_type")
      return entity.persistentData[craft_type] == 1
    })
});

StartupEvents.registry('palladium:abilities', (event) => {
	event.create('alienevo:craft_blueprint')
		.addProperty('craft_type', 'string', 'default', 'Check for what is being crafted')
		.icon(palladium.createItemIcon('palladium:vibranium_circuit'))
		.firstTick((entity, entry, holder, enabled) => {
			if (enabled) {
				if (entity.isPlayer()) {
					let craft_type = entry.getPropertyByName('craft_type');
					let requirements = {};

					if (craft_type == "galvan_armor") {
						requirements = {
							'alienevo:galvan_metal': 1,
							'alienevo:upgrade_chip': 1,
							'minecraft:iron_ingot': 12
						}
					}
					if (craft_type == "galvan_limbs") {
						requirements = {
							'alienevo:galvan_metal': 4,
							'minecraft:iron_ingot': 24
						}
					}
					if (craft_type == "galvan_suit") {
						requirements = {
							'alienevo:machined_metal': 6,
							'alienevo:machined_panel': 2,
							'alienevo:galvan_metal': 4,
							'alienevo:upgrade_chip': 2
						}
					}
					// item check
					for (let [item, amount] of Object.entries(requirements)) {
						if (entity.inventory.count(Item.of(item)) < amount) {
							entity.addTag('craftFail');
							entity.server.scheduleInTicks(4, () => {
								entity.removeTag('craftFail');
							});
							entity.persistentData.putInt(`crafted_${craft_type}`, 0);
							entity.runCommandSilent(`playsound minecraft:block.note_block.bass player @s ~ ~ ~ 4.0 1`);

							let missingIngredientsText = Text.translate("craft.alienevo_aliens.5.fail").getString();
							let galvanArmorText = Text.translate("ability.alienevo_aliens.5.galvan_armor").getString();
							let galvanArmorRecipe = Text.translate("ingredients.alienevo_aliens.5.galvan_armor").getString();
							let limbExtensionText = Text.translate("ability.alienevo_aliens.5.limbs").getString();
							let limbExtensionRecipe = Text.translate("ingredients.alienevo_aliens.5.limbs").getString();
							let machineSuitText = Text.translate("ability.alienevo_aliens.5.suit").getString();
							let machineSuitRecipe = Text.translate("ingredients.alienevo_aliens.5.suit").getString();

							if (craft_type == "galvan_armor") {
								entity.tell(`§c${missingIngredientsText} ${galvanArmorText}.\n${galvanArmorRecipe}`);
							}
							if (craft_type == "galvan_limbs") {
								entity.tell(`§c${missingIngredientsText} ${limbExtensionText}.\n${limbExtensionRecipe}`);
							}
							if (craft_type == "galvan_suit") {
								entity.tell(`§c${missingIngredientsText} ${machineSuitText}.\n${machineSuitRecipe}`);
							}
							return;
						}
					}
					// remove items
					for (let [item, amount] of Object.entries(requirements)) {
						let remaining = amount;
						for (let slot of entity.inventory.allItems) {
							if (slot.id === item && remaining > 0) {
								let removeCount = Math.min(slot.count, remaining);
								slot.shrink(removeCount);
								remaining -= removeCount;
							}
						}
					}
					entity.server.runCommandSilent(`scoreboard players set ${entity.getGameProfile().getName()} ${craft_type} 1`);
					entity.persistentData.putInt(`crafted_${craft_type}`, 1);
				}
			}
		});
});