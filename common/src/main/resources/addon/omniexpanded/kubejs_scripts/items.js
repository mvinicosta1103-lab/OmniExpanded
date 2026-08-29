StartupEvents.registry('item', event => {
    let builder = event.create("alienevo:smithing_template_galvan", "smithing_template")
    builder.appliesToText = Component.translatable("upgrade.alienevo.smithing_template_galvan.applies_to")
    builder.ingredientsText = Component.translatable("upgrade.alienevo.smithing_template_galvan.ingredients")
    builder.appliesToSlotDescription(Component.translatable("upgrade.alienevo.smithing_template_galvan.base_slot_description"))
    builder.ingredientsSlotDescription(Component.translatable("upgrade.alienevo.smithing_template_galvan.additions_slot_description"))
    builder.displayName(Component.translatable("upgrade.alienevo.galvan"))
    builder.tag("minecraft:smithing_templates")
});

StartupEvents.registry('item', event => {

    event.create('alienevo:prototype_omnitrix')
        .maxStackSize(1)
        .rarity('epic')
        .fireResistant()
        .texture('layer0', 'alienevo:item/prototype_omnitrix')
        .texture('layer1', 'alienevo:item/prototype_omnitrix_glow_1')
        .texture('layer2', 'alienevo:item/prototype_omnitrix_glow_2')
        .color((stack, i) => {
            if (i !== 1 && i !== 2) return -1;

            let fallback = i === 1 ? 0xb3ff40 : 0x8ed721;
            if (!stack.hasNBT()) return fallback;

            let key = i === 1 ? 'storedGlowColor1' : 'storedGlowColor3';
            let string = (stack.nbt.getString(key) + '').trim();
            let v = parseInt(string, 16);

            return string.length === 6 && !Number.isNaN(v) ? v : fallback;
        });

    event.create('alienevo:prototype_core')
        .displayName("Prototype Omnitrix Core")
        .maxStackSize(1)
        .rarity('epic')
        .fireResistant()
        .texture('layer0', 'alienevo:item/prototype_core')
        .texture('layer1', 'alienevo:item/prototype_core_glow_1')
        .texture('layer2', 'alienevo:item/prototype_core_glow_2')
        .texture('layer3', 'alienevo:item/prototype_core_glow_3')
        .color((stack, i) => {
            if (i !== 1 && i !== 2 && i !== 3) return -1;

            let fallback = i === 1 ? 0xb3ff40 : (i === 2 ? 0xa7f72e : 0x8ed721);
            if (!stack.hasNBT()) return fallback;

            let key = i === 1 ? 'storedGlowColor1' : (i === 2 ? 'storedGlowColor2' : 'storedGlowColor3');
            let s = (stack.nbt.getString(key) + '').trim();
            let v = parseInt(s, 16);

            return s.length === 6 && !Number.isNaN(v) ? v : fallback;
        });

    event.create('alienevo:prototype_omnitrix_phase1')
        .displayName("Evolving Omnitrix (Phase 1)")
        .maxStackSize(1)
        .rarity('epic')
        .fireResistant()
        .texture('layer0', 'alienevo:item/prototype_omnitrix_phase1')
        .texture('layer1', 'alienevo:item/prototype_omnitrix_glow_1')
        .texture('layer2', 'alienevo:item/prototype_omnitrix_glow_2')
        .color((stack, i) => {
            if (i !== 1 && i !== 2) return -1;

            let fallback = i === 1 ? 0xb3ff40 : 0x8ed721;
            if (!stack.hasNBT()) return fallback;

            let key = i === 1 ? 'storedGlowColor1' : 'storedGlowColor3';
            let string = (stack.nbt.getString(key) + '').trim();
            let v = parseInt(string, 16);

            return string.length === 6 && !Number.isNaN(v) ? v : fallback;
        });

    event.create('alienevo:prototype_omnitrix_phase2')
        .displayName("Evolving Omnitrix (Phase 2)")
        .maxStackSize(1)
        .rarity('epic')
        .fireResistant()
        .texture('layer0', 'alienevo:item/prototype_omnitrix_phase2')
        .texture('layer1', 'alienevo:item/prototype_omnitrix_glow_1')
        .texture('layer2', 'alienevo:item/prototype_omnitrix_glow_2')
        .color((stack, i) => {
            if (i !== 1 && i !== 2) return -1;

            let fallback = i === 1 ? 0xb3ff40 : 0x8ed721;
            if (!stack.hasNBT()) return fallback;

            let key = i === 1 ? 'storedGlowColor1' : 'storedGlowColor3';
            let string = (stack.nbt.getString(key) + '').trim();
            let v = parseInt(string, 16);

            return string.length === 6 && !Number.isNaN(v) ? v : fallback;
        });

    event.create('alienevo:prototype_omnitrix_10k')
        .displayName("Evolved Omnitrix")
        .maxStackSize(1)
        .rarity('epic')
        .fireResistant()
        .texture('layer0', 'alienevo:item/10k_omnitrix')
        .texture('layer1', 'alienevo:item/10k_omnitrix_glow_1')
        .texture('layer2', 'alienevo:item/10k_omnitrix_glow_2')
        .color((stack, i) => {
            if (i !== 1 && i !== 2) return -1;

            let fallback = i === 1 ? 0xb3ff40 : 0x8ed721;
            if (!stack.hasNBT()) return fallback;

            let key = i === 1 ? 'storedGlowColor1' : 'storedGlowColor3';
            let string = (stack.nbt.getString(key) + '').trim();
            let v = parseInt(string, 16);

            return string.length === 6 && !Number.isNaN(v) ? v : fallback;
        });

    // event.create('alienevo:recal_omnitrix')
    //     .displayName("Recalibrated Omnitrix")
    //     .maxStackSize(1)
    //     .rarity('epic')
    //     .fireResistant()
    //     .texture('layer0', 'alienevo:item/recal_omnitrix')
    //     .texture('layer1', 'alienevo:item/recal_omnitrix_glow_1')
    //     .texture('layer2', 'alienevo:item/recal_omnitrix_glow_2')
    //     .color((stack, i) => {
    //         if (i !== 1 && i !== 2) return -1;

    //         let fallback = i === 1 ? 0xb3ff40 : 0x8ed721;
    //         if (!stack.hasNBT()) return fallback;

    //         let key = i === 1 ? 'storedGlowColor1' : 'storedGlowColor3';
    //         let string = (stack.nbt.getString(key) + '').trim();
    //         let v = parseInt(string, 16);

    //         return string.length === 6 && !Number.isNaN(v) ? v : fallback;
    //     });

    // event.create('alienevo:recal_core')
    //     .displayName("Recalibrated Omnitrix Core")
    //     .maxStackSize(1)
    //     .rarity('epic')
    //     .fireResistant()
    //     .texture('layer0', 'alienevo:item/recal_omnitrix_core')
    //     // .texture('layer1', 'alienevo:item/recal_omnitrix_core_glow_1')
    //     // .texture('layer2', 'alienevo:item/recal_omnitrix_core_glow_2')
    //     .color((stack, i) => {
    //         if (i !== 1 && i !== 2) return -1;

    //         let fallback = i === 1 ? 0xb3ff40 : 0x8ed721;
    //         if (!stack.hasNBT()) return fallback;

    //         let key = i === 1 ? 'storedGlowColor1' : 'storedGlowColor3';
    //         let string = (stack.nbt.getString(key) + '').trim();
    //         let v = parseInt(string, 16);

    //         return string.length === 6 && !Number.isNaN(v) ? v : fallback;
    //     });
});

StartupEvents.modifyCreativeTab('kubejs:tab', event => {
    event.remove('alienevo:prototype_omnitrix');
    event.remove('alienevo:prototype_core');
    event.remove('alienevo:prototype_omnitrix_phase1');
    event.remove('alienevo:prototype_omnitrix_phase2');
    event.remove('alienevo:prototype_omnitrix_10k');
    // event.remove('alienevo:recal_omnitrix');
    event.remove('alienevo:smithing_template_galvan');
});

// /give @s alienevo:prototype_omnitrix{storedGlowColor1:"4b73d4",storedGlowColor3:"14499a"}

// /give @s alienevo:prototype_core_tinted{storedGlowColor1:"4b73d4",storedGlowColor2:"345ec3",storedGlowColor3:"14499a"}






