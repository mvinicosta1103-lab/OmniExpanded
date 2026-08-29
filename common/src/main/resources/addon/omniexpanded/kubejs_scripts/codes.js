StartupEvents.registry('palladium:abilities', (event) => {
    event.create('alienevo:cycle_position')
        .icon(palladium.createItemIcon('minecraft:arrow'))
        .addProperty('code', 'string', 'code_system', '')
        .tick((entity, entry, holder, enabled) => {
            if (enabled && entity) {
                cyclePosition(entity);
            }
        });

    event.create('alienevo:increase_digit')
        .icon(palladium.createItemIcon('minecraft:stone_button'))
        .addProperty('code', 'string', 'code_system', '')
        .tick((entity, entry, holder, enabled) => {
            if (enabled && entity) {
                changeDigit(entity, 1);
            }
        });

    event.create('alienevo:decrease_digit')
        .icon(palladium.createItemIcon('minecraft:stone_button'))
        .addProperty('code', 'string', 'code_system', '')
        .tick((entity, entry, holder, enabled) => {
            if (enabled && entity) {
                changeDigit(entity, -1);
            }
        });

    event.create('alienevo:display_code')
        .icon(palladium.createItemIcon('minecraft:oak_sign'))
        .addProperty('code', 'string', 'code_system', '')
        .firstTick((entity, entry, holder) => {
            if (entity && entity.isPlayer()) {
                if (!entity.persistentData.masterTargetCode &&
                    !entity.persistentData.selfDestructTargetCode &&
                    !entity.tags.contains("AlienEvo.MasterControl")) {
                    generateRandomCodes(entity);
                }
                else if (entity.tags.contains("AlienEvo.MasterControl") &&
                    !entity.persistentData.selfDestructTargetCode) {
                    generateSelfDestructCode(entity);
                }
            }
        })
        .tick((entity, entry, holder, enabled) => {
            if (enabled && entity && entity.isPlayer()) {
                let code = entity.persistentData.code || "000000";
                let position = parseInt(entity.persistentData.position || "0");
                let masterCode = entity.persistentData.masterTargetCode;
                let selfDestructCode = entity.persistentData.selfDestructTargetCode;

                // Check if player already has master control and entered the code again
                if (entity.tags.contains("AlienEvo.MasterControl") && masterCode && code === masterCode) {
                    // Check if player has the required ability unlocked to remove master control
                    if (!palladium.abilities.isUnlocked(entity, new ResourceLocation("alienevo:prototype_omnitrix"), "zero_out_unlock")) {
                        // Reset the code and position since they don't have the ability unlocked
                        entity.persistentData.code = "000000";
                        entity.persistentData.position = "0";
                        palladium.setProperty(entity, 'code', "000000");
                        entity.server.runCommandSilent(`scoreboard players set ${entity.username} code_position 0`);
                        return;
                    }
                    entity.addTag('AlienEvo.ZeroOutAnim');
                    entity.persistentData.code = "000000";
                    entity.persistentData.position = "0";
                    palladium.setProperty(entity, 'code', "000000");
                    entity.server.runCommandSilent(`scoreboard players set ${entity.username} code_position 0`);

                    // Remove master control tag
                    entity.removeTag('AlienEvo.MasterControl');
                    return;
                }
                // Check if player doesn't have master control and entered the correct code
                else if (!entity.tags.contains("AlienEvo.MasterControl") && masterCode && code === masterCode) {
                    entity.server.runCommandSilent(`scoreboard players set ${entity.username} AlienEvo.Timer 0`);
                    entity.level.playSound(
                        null,
                        entity.x,
                        entity.y,
                        entity.z,
                        `alienevo:prototype_master_control`,
                        entity.getSoundSource(),
                        1.0,
                        1.0
                    );
                    entity.addTag('AlienEvo.MasterControlAnim');
                    entity.persistentData.code = "000000";
                    entity.persistentData.position = "0";
                    palladium.setProperty(entity, 'code', "000000");
                    entity.server.runCommandSilent(`scoreboard players set ${entity.username} code_position 0`);
                    entity.addTag('AlienEvo.MasterControl');
                    entity.server.runCommandSilent(`advancement grant ${entity.username} only alienevo:code_mastercontrol`);
                    return;
                }

                if (code === selfDestructCode) {
                    superpowerUtil.addSuperpower(entity, new ResourceLocation(`selfdestruct:prototype_omnitrix_sdm`));
                    entity.persistentData.code = "000000";
                    entity.persistentData.position = "0";
                    palladium.setProperty(entity, 'code', "000000");
                    entity.server.runCommandSilent(`scoreboard players set ${entity.username} code_position 0`);
                    entity.server.runCommandSilent(`advancement grant ${entity.username} only alienevo:code_selfdestruct`);
                    return;
                }

                let display = "";
                for (let i = 0; i < code.length; i++) {
                    if (i === position) {
                        display += `§e${code[i]}§r`;
                    } else {
                        display += code[i];
                    }
                    display += " ";
                }

                entity.server.runCommandSilent(`/title ${entity.username} times 0 0 0`);
                entity.server.runCommandSilent(`/title ${entity.username} actionbar {"text":"${display.trim()}"}`);
            }
        })
        .lastTick((entity, entry, holder) => {
            if (entity && entity.isPlayer()) {
                entity.server.runCommandSilent(`/title ${entity.username} actionbar {"text":" "}`);
            }
        });

    event.create('alienevo:reveal_code')
        .icon(palladium.createItemIcon('minecraft:redstone_torch'))
        .addProperty('code', 'string', 'code_system', '')
        .tick((entity, entry, holder, enabled) => {
            if (enabled && entity && entity.isPlayer()) {
                let masterCode = entity.persistentData.masterTargetCode;
                let selfDestructCode = entity.persistentData.selfDestructTargetCode;

                if (masterCode || selfDestructCode) {
                    let display = '';
                    if (masterCode) display += `§aMC: ${masterCode.split('').join(' ')}§r  `;
                    if (selfDestructCode) display += `§cSD: ${selfDestructCode.split('').join(' ')}§r`;

                    entity.server.runCommandSilent(`/title ${entity.username} times 0 0 0`);
                    entity.server.runCommandSilent(`/title ${entity.username} actionbar {"text":"${display}"}`);
                } else {
                }
            }
        })
        .lastTick((entity, entry, holder) => {
            if (entity && entity.isPlayer()) {
                entity.server.runCommandSilent(`/title ${entity.username} actionbar {"text":" "}`);
            }
        });

    function generateRandomCodes(entity) {
        let masterCode = "";
        let selfDestructCode = "";

        if (!entity.tags.contains("AlienEvo.MasterControl")) {
            for (let i = 0; i < 6; i++) {
                masterCode += Math.floor(Math.random() * 9) + 1;
            }
            entity.persistentData.masterTargetCode = masterCode;
        }

        generateSelfDestructCode(entity);

        entity.persistentData.code = "000000";
        entity.persistentData.position = "0";

        entity.server.runCommandSilent(`scoreboard objectives add code_position dummy`);
        entity.server.runCommandSilent(`scoreboard players set ${entity.username} code_position 0`);

        palladium.setProperty(entity, 'code', "000000");

    }

    function generateSelfDestructCode(entity) {
        let selfDestructCode = "";
        let masterCode = entity.persistentData.masterTargetCode || "";

        do {
            selfDestructCode = "";
            for (let i = 0; i < 6; i++) {
                selfDestructCode += Math.floor(Math.random() * 9) + 1;
            }
        } while (masterCode && selfDestructCode === masterCode);

        entity.persistentData.selfDestructTargetCode = selfDestructCode;
    }

    function cyclePosition(entity) {
        let position = parseInt(entity.persistentData.position || "0");
        position = (position + 1) % 6;
        entity.persistentData.position = position.toString();

        if (entity.isPlayer()) {
            entity.server.runCommandSilent(`scoreboard players set ${entity.username} code_position ${position}`);
        }
    }

    function changeDigit(entity, direction) {
        let code = entity.persistentData.code || "000000";
        let position = parseInt(entity.persistentData.position || "0");

        let digits = code.split('');

        let currentDigit = parseInt(digits[position]);
        currentDigit += direction;
        if (currentDigit > 9) currentDigit = 0;
        if (currentDigit < 0) currentDigit = 9;

        digits[position] = currentDigit.toString();

        code = digits.join('');
        entity.persistentData.code = code;
        palladium.setProperty(entity, 'code', code);
    }
});