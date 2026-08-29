

StartupEvents.registry('palladium:abilities', (event) => {
	event.create('alienevo:stat_ability')
		.icon(palladium.createItemIcon('palladium:vibranium_circuit'))
		.addProperty("score_value", "string", "Score.Board", "Scoreboard Name")
		.addProperty("Division_Amount", "string", "1", "The amount the scoreboard value will be divided by")
		.addProperty("Attribute_Type", "string", "palladium:levitation_speed", "The attribute that will be used")
		.addProperty("UUID", "string", "cc154bdc-21f8-11ee-be56-0242ac120002", "The UUID used for the attribute")
		.addProperty("Attribute_Mod", "string", "addition", "addition , multiply_total , multiply_base")

		.lastTick((entity, entry, holder, enabled) => {
			if (enabled) {
				const division = entry.getPropertyByName('Division_Amount');
				const attribute = entry.getPropertyByName('Attribute_Type');
				const uuid = entry.getPropertyByName('UUID');
				const attribute_mod = entry.getPropertyByName('Attribute_Mod');
				let username = entity.getGameProfile().getName();
				let username_true = username.toLowerCase();
				let scoreboard = Utils.server.scoreboard;
				let scoreboard_obj = scoreboard.getObjective(entry.getPropertyByName("score_value"));
				if (scoreboard_obj != null) {
					let score = scoreboard.getOrCreatePlayerScore(username, scoreboard_obj);
					let value = score.getScore();
					entity.removeAttribute(attribute, UUID)
				}
			}
		})

		.tick((entity, entry, holder, enabled) => {
			if (enabled) {
				if (entity.isPlayer()) {
					const division = entry.getPropertyByName('Division_Amount');
					const attribute = entry.getPropertyByName('Attribute_Type');
					const uuid = entry.getPropertyByName('UUID');
					const attribute_mod = entry.getPropertyByName('Attribute_Mod');
					let username = entity.getGameProfile().getName();
					let username_true = username.toLowerCase();
					let scoreboard = Utils.server.scoreboard;
					let scoreboard_obj = scoreboard.getObjective(entry.getPropertyByName("score_value"));
					if (scoreboard_obj != null) {
						let score = scoreboard.getOrCreatePlayerScore(username, scoreboard_obj);
						let value = score.getScore();

						entity.modifyAttribute(attribute, UUID, (value / division), attribute_mod)
					}
				}
			}
		});
});