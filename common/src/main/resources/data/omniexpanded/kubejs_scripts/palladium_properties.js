function generateAlienColorProperties(event) {
    let processedBases = new Set();

    for (let key in global) {
        let match = key.match(/^alienevo_(\d+)_(.+)_skincolor_palette_(\d+)(.*)$/);

        if (match) {
            let alienId = match[1];
            let variationName = match[2];
            let paletteId = match[3];
            let suffix = match[4]; // This will capture any suffix (like "_ext", "_variant", "_special", etc.)
            let colorArray = global[key];

            if (colorArray && Array.isArray(colorArray)) {
                let alienInfo = global[`alienevo_alien_${alienId}`];
                if (alienInfo && alienInfo[0]) {
                    let alienFullName = alienInfo[0];
                    let alienName = alienFullName.includes(':') ?
                        alienFullName.split(':')[1] : alienFullName;

                    colorArray.forEach((color, colorIndex) => {
                        // Include any suffix in the property name
                        let propertyName = `${alienName}_${variationName}_skincolor_palette_${paletteId}${suffix}_color_${colorIndex + 1}`;
                        event.registerProperty(propertyName, 'string', color);
                    });

                    let basePropertyName = `${alienName}_${variationName}_skincolor_palette_${paletteId}${suffix}_base`;
                    if (!processedBases.has(basePropertyName)) {
                        event.registerProperty(basePropertyName, 'string', "0,0,0");
                        processedBases.add(basePropertyName);
                    }
                }
            }
        }

        let glowMatch = key.match(/^alienevo_(\d+)_(.+)_glowcolor_(\d+)(.*)$/);
        if (glowMatch) {
            let alienId = glowMatch[1];
            let variationName = glowMatch[2];
            let glowId = glowMatch[3];
            let suffix = glowMatch[4]; // Capture any suffix
            let glowArray = global[key];

            if (glowArray && Array.isArray(glowArray)) {
                let alienInfo = global[`alienevo_alien_${alienId}`];
                if (alienInfo && alienInfo[0]) {
                    let alienFullName = alienInfo[0];
                    let alienName = alienFullName.includes(':') ?
                        alienFullName.split(':')[1] : alienFullName;

                    glowArray.forEach((color, colorIndex) => {
                        // Include any suffix in the property name
                        let propertyName = `${alienName}_${variationName}_glowcolor_${glowId}${suffix}_color_${colorIndex + 1}`;
                        event.registerProperty(propertyName, 'string', color);
                    });

                    let basePropertyName = `${alienName}_${variationName}_glowcolor_${glowId}${suffix}_base`;
                    if (!processedBases.has(basePropertyName)) {
                        event.registerProperty(basePropertyName, 'string', "0,0,0");
                        processedBases.add(basePropertyName);
                    }
                }
            }
        }
    }
}


PalladiumEvents.registerProperties((event) => {
    // Only register properties for players and armor stands
    if (event.getEntityType() === "minecraft:player" || event.getEntityType() === "minecraft:armor_stand"  || event.getEntityType() === "palladium:custom_projectile") {
        event.registerProperty('omnitrix_cycle', 'integer', 1);
        event.registerProperty('omnitrix_next_alien', 'integer', 1);
        event.registerProperty('omnitrix_next_next_alien', 'integer', 1);
        event.registerProperty('omnitrix_prev_alien', 'integer', 1);
        event.registerProperty('omnitrix_prev_prev_alien', 'integer', 1);
        event.registerProperty('cycle_quick_change', 'integer', 1);
        event.registerProperty('watch', 'string', "prototype");
        event.registerProperty('watch_state', 'string', "default");
        event.registerProperty('badge', 'string', "prototype");
        event.registerProperty('uniform', 'string', "default");
        event.registerProperty('AlienEvo.Color', 'string', "default");
        event.registerProperty('watch_namespace', 'string', "alienevo");
        event.registerProperty('AlienEvo.PrimaryColor', 'string', "default");
        event.registerProperty('AlienEvo.SecondaryColor', 'string', "default");
        event.registerProperty('use_timeout_bubble', 'boolean', false);
        event.registerProperty('quick_change_wheel', 'string', "disabled");
        event.registerProperty('sil_color', 'string', "000000");

        event.registerProperty('uniform_glow_color_base', 'string', "0,0,0");
        event.registerProperty('uniform_glow_color_1', 'string', "ffffff");
        event.registerProperty('uniform_glow_color_2', 'string', "eaeaea");
        event.registerProperty('uniform_glow_color_3', 'string', "cfcfdd");
        event.registerProperty('uniform_glow_color_4', 'string', "b9b7cd");
        event.registerProperty('uniform_glow_color_5', 'string', "9f9cb6");

        event.registerProperty('uniform_primary_color_base', 'string', "0,0,0");
        event.registerProperty('uniform_primary_color_1', 'string', "3a3333");
        event.registerProperty('uniform_primary_color_2', 'string', "2c2828");
        event.registerProperty('uniform_primary_color_3', 'string', "232020");
        event.registerProperty('uniform_primary_color_4', 'string', "171515");
        event.registerProperty('uniform_primary_color_5', 'string', "000000");

        event.registerProperty('uniform_secondary_color_base', 'string', "0,0,0");
        event.registerProperty('uniform_secondary_color_1', 'string', "ffffff");
        event.registerProperty('uniform_secondary_color_2', 'string', "edf4f4");
        event.registerProperty('uniform_secondary_color_3', 'string', "d6dfe1");
        event.registerProperty('uniform_secondary_color_4', 'string', "bdc7cf");
        event.registerProperty('uniform_secondary_color_5', 'string', "97a2b0");

        event.registerProperty('suit_primary_color_base', 'string', "0,0,0");
        event.registerProperty('suit_primary_color_1', 'string', "8fae8c");
        event.registerProperty('suit_primary_color_2', 'string', "809d7c");
        event.registerProperty('suit_primary_color_3', 'string', "6c8666");
        event.registerProperty('suit_primary_color_4', 'string', "637759");
        event.registerProperty('suit_primary_color_5', 'string', "505f46");

        event.registerProperty('suit_secondary_color_base', 'string', "0,0,0");
        event.registerProperty('suit_secondary_color_1', 'string', "837446");
        event.registerProperty('suit_secondary_color_2', 'string', "71663c");
        event.registerProperty('suit_secondary_color_3', 'string', "615a34");
        event.registerProperty('suit_secondary_color_4', 'string', "514d2b");
        event.registerProperty('suit_secondary_color_5', 'string', "413f23");

        event.registerProperty('prototype_glow_color_base', 'string', "0,0,0");
        event.registerProperty('prototype_glow_color_1', 'string', "b3ff40");
        event.registerProperty('prototype_glow_color_2', 'string', "a7f72e");
        event.registerProperty('prototype_glow_color_3', 'string', "8ed721");
        event.registerProperty('prototype_glow_color_4', 'string', "77b81a");
        event.registerProperty('prototype_glow_color_5', 'string', "639d11");

        event.registerProperty('10k_glow_color_base', 'string', "0,0,0");
        event.registerProperty('10k_glow_color_1', 'string', "b3ff40");
        event.registerProperty('10k_glow_color_2', 'string', "a7f72e");
        event.registerProperty('10k_glow_color_3', 'string', "8ed721");
        event.registerProperty('10k_glow_color_4', 'string', "77b81a");
        event.registerProperty('10k_glow_color_5', 'string', "639d11");

        event.registerProperty('recal_glow_color_base', 'string', "0,0,0");
        event.registerProperty('recal_glow_color_1', 'string', "b3ff40");
        event.registerProperty('recal_glow_color_2', 'string', "a7f72e");
        event.registerProperty('recal_glow_color_3', 'string', "8ed721");
        event.registerProperty('recal_glow_color_4', 'string', "77b81a");
        event.registerProperty('recal_glow_color_5', 'string', "639d11");

        event.registerProperty('kineceleran_energy_color', 'string', "7ceae2");
        event.registerProperty('galvanic_mechamorph_beam_color', 'string', "b3ff40");
        event.registerProperty('arburian_pelarota_energy_color', 'string', "f8c144");

        event.registerProperty('alien_species', 'string', "pyronite");

        for (let slot = 1; slot <= 10; slot++) {
            event.registerProperty(`alien_evo_slot_${slot}`, 'integer', 0);
        }

        event.registerProperty('current_attack', 'integer', 1);
        event.registerProperty('current_hp', 'integer', 20);
        event.registerProperty('current_defense', 'integer', 0);
        event.registerProperty('current_toughness', 'integer', 0);
        event.registerProperty('current_speed', 'integer', 100);
        event.registerProperty('current_kb_res', 'integer', 0);
        event.registerProperty('current_alien_nickname', 'string', "default");
        event.registerProperty('ball_walk_dist', 'integer', 0);
        event.registerProperty('ball_walk_dist_old', 'integer', 0);


        generateAlienColorProperties(event);
    }
});