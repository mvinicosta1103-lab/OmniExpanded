const Component = Java.loadClass("net.minecraft.network.chat.Component");

global.alienevo_alien_0 = ['alienevo:null']
global.alienevo_alien_1 = ['alienevo_aliens:pyronite'] // heatblast
global.alienevo_alien_2 = ['alienevo_aliens:vulpimancer'] // wildmutt
global.alienevo_alien_3 = ['alienevo_aliens:petrosapien'] // diamondhead
global.alienevo_alien_4 = ['alienevo_aliens:kineceleran'] // xlr8
global.alienevo_alien_5 = ['alienevo_aliens:galvan'] // greymatter
global.alienevo_alien_6 = ['alienevo_aliens:tetramand'] // fourarms
global.alienevo_alien_7 = ['alienevo_aliens:lepidopterran',] // stinkfly
global.alienevo_alien_8 = ['alienevo_aliens:piscciss_volann'] // ripjaws
global.alienevo_alien_9 = ['alienevo_aliens:galvanic_mechamorph'] // upgrade
global.alienevo_alien_10 = ['alienevo_aliens:ectonurite'] // ghostfreak
global.alienevo_alien_11 = ['alienevo_aliens:arburian_pelarota'] // cannonbolt
global.alienevo_alien_31 = ['alienevo_aliens:methanosian'] // swampfire
global.alienevo_alien_32 = ['alienevo_aliens:sonorosian'] // echo echo
global.alienevo_alien_33 = ['alienevo_aliens:vaxasaurian'] // humungousaur
global.alienevo_alien_34 = ['alienevo_aliens:aerophibian'] // jetray
global.alienevo_alien_35 = ['alienevo_aliens:necrofriggian'] // big-chill
global.alienevo_alien_36 = ['alienevo_aliens:crystalsapien'] // chromastone
global.alienevo_alien_80 = ['alienevo_aliens:nucleonix'] // atomix
global.alienevo_alien_100 = ['alienevo_aliens:dragonoid'] // dragonoid

global.alienevo_regen_0 = [0];   // null
global.alienevo_regen_1 = [0];   // Heatblast
global.alienevo_regen_2 = [0];   // Wildmutt
global.alienevo_regen_3 = [5];   // Diamondhead
global.alienevo_regen_4 = [0];   // XLR8
global.alienevo_regen_5 = [0];   // Grey Matter
global.alienevo_regen_6 = [0];   // Four Arms
global.alienevo_regen_7 = [0];   // Stinkfly
global.alienevo_regen_8 = [3];   // Ripjaws
global.alienevo_regen_9 = [8];   // Upgrade
global.alienevo_regen_10 = [6];  // Ghostfreak
global.alienevo_regen_11 = [0];  // Cannonbolt
global.alienevo_regen_31 = [7];  // Swampfire
global.alienevo_regen_32 = [0];  // Echo Echo
global.alienevo_regen_33 = [0];  // Humungousaur
global.alienevo_regen_34 = [0];  // Jetray
global.alienevo_regen_35 = [0];  // Big Chill
global.alienevo_regen_36 = [0];  // Chromastone
global.alienevo_regen_80 = [8];  // Atomix
global.alienevo_regen_100 = [0]; // Dragonoid

global.alienevo_scale_0 = [55];   // null
global.alienevo_scale_1 = [57];   // Heatblast
global.alienevo_scale_2 = [52];   // Wildmutt
global.alienevo_scale_3 = [62];   // Diamondhead
global.alienevo_scale_4 = [65];   // XLR8
global.alienevo_scale_5 = [50];   // Grey Matter
global.alienevo_scale_6 = [75];   // Four Arms
global.alienevo_scale_7 = [37];   // Stinkfly
global.alienevo_scale_8 = [60];   // Ripjaws
global.alienevo_scale_9 = [65];   // Upgrade
global.alienevo_scale_10 = [68];  // Ghostfreak
global.alienevo_scale_11 = [45];  // Cannonbolt
global.alienevo_scale_31 = [55];  // Swampfire
global.alienevo_scale_32 = [55];  // Echo Echo
global.alienevo_scale_33 = [55];  // Humungousaur
global.alienevo_scale_34 = [55];  // Jetray
global.alienevo_scale_35 = [55];  // Big Chill
global.alienevo_scale_36 = [55];  // Chromastone
global.alienevo_scale_80 = [55];  // Atomix
global.alienevo_scale_100 = [55]; // Dragonoid

global.alienevo_textcolor_0 = [0xffffff];   // null
global.alienevo_textcolor_1 = [0xffb65a];   // Heatblast
global.alienevo_textcolor_2 = [0xf3a739];   // Wildmutt
global.alienevo_textcolor_3 = [0x9ae4ba];   // Diamondhead
global.alienevo_textcolor_4 = [0x90f5e8];   // XLR8
global.alienevo_textcolor_5 = [0xe1fb84];   // Grey Matter
global.alienevo_textcolor_6 = [0xe14337];   // Four Arms
global.alienevo_textcolor_7 = [0xcee441];   // Stinkfly
global.alienevo_textcolor_8 = [0xadcdaa];   // Ripjaws
global.alienevo_textcolor_9 = [0xb3ff40];   // Upgrade
global.alienevo_textcolor_10 = [0xe5bbe9];  // Ghostfreak
global.alienevo_textcolor_11 = [0xeda43a];  // Cannonbolt
global.alienevo_textcolor_31 = [0xffffff];  // Swampfire
global.alienevo_textcolor_32 = [0xffffff];  // Echo Echo
global.alienevo_textcolor_33 = [0xffffff];  // Humungousaur
global.alienevo_textcolor_34 = [0xffffff];  // Jetray
global.alienevo_textcolor_35 = [0xffffff];  // Big Chill
global.alienevo_textcolor_36 = [0xffffff];  // Chromastone
global.alienevo_textcolor_80 = [0xffffff];  // Atomix
global.alienevo_textcolor_100 = [0xffffff]; // Dragonoid

global.alienevo_descriptions = {};

global.getAlienDescription = function(id) {
    if (!(id in global.alienevo_descriptions)) {
        global.alienevo_descriptions[id] = Component.translatable(`alienevo.alien_desc.${id}`);
    }
    return global.alienevo_descriptions[id];
};

global.alienevo_background_0 = ['alienevo:textures/gui/power_screen/power_screen.png'];
global.alienevo_background_1 = ['minecraft:textures/block/magma.png'];
global.alienevo_background_2 = ['minecraft:textures/block/dirt.png'];
global.alienevo_background_3 = ['alienevo:textures/block/diamond_block.png'];
global.alienevo_background_4 = ['minecraft:textures/block/stripped_warped_stem.png'];
global.alienevo_background_5 = ['alienevo:textures/block/machined_metal.png'];
global.alienevo_background_6 = ['minecraft:textures/block/mud_bricks.png'];
global.alienevo_background_7 = ['minecraft:textures/block/slime_block.png'];
global.alienevo_background_8 = ['minecraft:textures/block/water_still.png'];
global.alienevo_background_9 = ['minecraft:textures/block/deepslate_tiles.png'];
global.alienevo_background_10 = ['minecraft:textures/block/crying_obsidian.png'];
global.alienevo_background_11 = ['minecraft:textures/block/dripstone_block.png'];
global.alienevo_background_31 = [''];
global.alienevo_background_32 = [''];
global.alienevo_background_33 = [''];
global.alienevo_background_34 = [''];
global.alienevo_background_35 = [''];
global.alienevo_background_36 = [''];
global.alienevo_background_80 = [''];
global.alienevo_background_100 = [''];

global.alienevo_randomization_0 = [false];   // null
global.alienevo_randomization_1 = [false];   // Heatblast
global.alienevo_randomization_2 = [false];   // Wildmutt
global.alienevo_randomization_3 = [false];   // Diamondhead
global.alienevo_randomization_4 = [false];   // XLR8
global.alienevo_randomization_5 = [false];   // Grey Matter
global.alienevo_randomization_6 = [false];   // Four Arms
global.alienevo_randomization_7 = [false];   // Stinkfly
global.alienevo_randomization_8 = [false];   // Ripjaws
global.alienevo_randomization_9 = [false];   // Upgrade
global.alienevo_randomization_10 = [false];  // Ghostfreak
global.alienevo_randomization_11 = [true];   // Cannonbolt
global.alienevo_randomization_31 = [false];  // Swampfire
global.alienevo_randomization_32 = [false];  // Echo Echo
global.alienevo_randomization_33 = [false];  // Humungousaur
global.alienevo_randomization_34 = [false];  // Jetray
global.alienevo_randomization_35 = [false];  // Big Chill
global.alienevo_randomization_36 = [false];  // Chromastone
global.alienevo_randomization_80 = [false];  // Atomix
global.alienevo_randomization_100 = [false]; // Dragonoid

// Watch
global.watch_palette_prototype = ["b3ff40", "a7f72e", "8ed721", "77b81a", "639d11"];
global.watch_palette_recal = ["b3ff40", "a7f72e", "8ed721", "77b81a", "639d11"];
global.watch_palette_10k = ["b3ff40", "a7f72e", "8ed721", "77b81a", "639d11"];

global.watch_palette_prototype_uniform_primary = ["3a3333", "2c2828", "232020", "171515", "000000"];
global.watch_palette_prototype_uniform_secondary = ["ffffff", "edf4f4", "d6dfe1", "bdc7cf", "97a2b0"];
global.watch_palette_recal_uniform_primary = ["3a3333", "2c2828", "232020", "171515", "000000"];
global.watch_palette_recal_uniform_secondary = ["ffffff", "edf4f4", "d6dfe1", "bdc7cf", "97a2b0"];
global.watch_palette_10k_uniform_primary = ["3a3333", "2c2828", "232020", "171515", "000000"];
global.watch_palette_10k_uniform_secondary = ["ffffff", "edf4f4", "d6dfe1", "bdc7cf", "97a2b0"];

// Heatblast
global.alienevo_1_10k_uniforms = [true, false, false];
global.alienevo_1_default_uniforms = [true, false, false];
global.alienevo_1_prototype_uniforms = [true, false, false];
global.alienevo_1_10k_skincolor_palette_1 = ["b33637", "902a32", "70222e", "581c29", "431420"];
global.alienevo_1_10k_skincolor_palette_2 = ["fffde2", "fff8b7", "ffeb8f", "ffcc6b", "ff9941"];
global.alienevo_1_10k_skincolor_palette_1_ext = ["6b2f39", "552432", "401a2a", "2e1021", "250c19"];
global.alienevo_1_10k_skincolor_palette_2_ext = ["917564", "81674c", "6e5832", "644528", "542d19"];
global.alienevo_1_default_skincolor_palette_1 = ["be2e30", "8a1b28", "4f1320", "290911", "000000"];
global.alienevo_1_default_skincolor_palette_2 = ["fffef7", "fffedc", "fff8b1", "ffef73", "ffcc58"];
global.alienevo_1_default_skincolor_palette_1_ext = ["7c2f38", "602230", "431928", "2d0f1d", "1e0a14"];
global.alienevo_1_default_skincolor_palette_2_ext = ["8b766f", "7d675a", "6c5743", "5f4537", "4c2e27"];
global.alienevo_1_prototype_skincolor_palette_1 = ["b33637", "902a32", "70222e", "581c29", "431420"];
global.alienevo_1_prototype_skincolor_palette_2 = ["fffde2", "fff8b7", "ffeb8f", "ffcc6b", "ff9941"];
global.alienevo_1_prototype_skincolor_palette_1_ext = ["6b2f39", "552432", "401a2a", "2e1021", "250c19"];
global.alienevo_1_prototype_skincolor_palette_2_ext = ["917564", "81674c", "6e5832", "644528", "542d19"];

// Wildmutt
global.alienevo_2_10k_uniforms = [true, false, false];
global.alienevo_2_default_uniforms = [true, false, false];
global.alienevo_2_prototype_uniforms = [true, true, true];
global.alienevo_2_10k_skincolor_palette_1 = ["f3a739", "ef982c", "e58624", "df7820", "d06315"];
global.alienevo_2_10k_skincolor_palette_2 = ["3a3333", "2c2828", "232020", "171515", "000000"];
global.alienevo_2_10k_skincolor_palette_3 = ["696762", "444340"];
global.alienevo_2_10k_skincolor_palette_4 = ["926030", "825228", "70431f"];
global.alienevo_2_default_skincolor_palette_1 = ["f3a739", "ef982c", "e58624", "df7820", "d06315"];
global.alienevo_2_default_skincolor_palette_2 = ["696762", "444340"];
global.alienevo_2_prototype_skincolor_palette_1 = ["f3a739", "ef982c", "e58624", "df7820", "d06315"];
global.alienevo_2_prototype_skincolor_palette_2 = ["3a3333", "2c2828", "232020", "171515", "000000"];
global.alienevo_2_prototype_skincolor_palette_3 = ["696762", "444340"];

// Diamondhead
global.alienevo_3_10k_uniforms = [true, true, true];
global.alienevo_3_default_uniforms = [true, false, false];
global.alienevo_3_prototype_uniforms = [true, true, true];
global.alienevo_3_10k_skincolor_palette_1 = ["eefff5", "cefeea", "a9edc6", "86d698", "6dbe78", "58a964", "267239"];
global.alienevo_3_default_skincolor_palette_1 = ["eefff5", "cefef4", "a9eddd", "86d6c2", "6dbea1", "58a980", "267543"];
global.alienevo_3_default_skincolor_palette_2 = ["47466c", "383254", "2e2643", "221a31", "1a1224", "140d1b","09040a"];
global.alienevo_3_prototype_skincolor_palette_1 = ["eefff5", "cefeea", "a9edc6", "86d698", "6dbe78", "58a964", "267239"];
global.alienevo_3_10k_glowcolor_1 = ["ffec48", "ffce48"];
global.alienevo_3_default_glowcolor_1 = ["b3ff40", "8ed721"];
global.alienevo_3_prototype_glowcolor_1 = ["ffec48", "ffce48"];

// XLR8
global.alienevo_4_10k_uniforms = [true, true, true];
global.alienevo_4_default_uniforms = [true, false, false];
global.alienevo_4_prototype_uniforms = [true, true, true];
global.alienevo_4_10k_skincolor_palette_1 = ["90f5e8", "7ceae2", "63cbd1", "58b4c3", "458fa7"];
global.alienevo_4_10k_skincolor_palette_2 = ["3a3333", "2c2828", "232020", "171515", "000000"];
global.alienevo_4_default_skincolor_palette_1 = ["698890", "55717e", "485f6e", "3a4d5e", "2f3d53"];
global.alienevo_4_default_skincolor_palette_2 = ["3a3333", "2c2828", "232020", "171515", "000000"];
global.alienevo_4_default_skincolor_palette_3 = ["3a3333", "2c2828", "232020", "171515", "000000"];
global.alienevo_4_default_skincolor_palette_4 = ["707f6d", "5d6958", "4d5649", "3c4338", "2f352b"];
global.alienevo_4_prototype_skincolor_palette_1 = ["90f5e8", "7ceae2", "63cbd1", "58b4c3", "458fa7"];
global.alienevo_4_prototype_skincolor_palette_2 = ["3a3333", "2c2828", "232020", "171515", "000000"];
global.alienevo_4_10k_glowcolor_1 = ["b3ff40", "8ed721"];
global.alienevo_4_10k_glowcolor_2 = ["90f5e8", "7ceae2", "63cbd1"];
global.alienevo_4_default_glowcolor_1 = ["b3ff40", "8ed721"];
global.alienevo_4_default_glowcolor_2 = ["b3ff40", "a7f72e", "8ed721"];
global.alienevo_4_prototype_glowcolor_1 = ["b3ff40", "8ed721"];
global.alienevo_4_prototype_glowcolor_2 = ["90f5e8", "7ceae2", "63cbd1"];

// Greymatter
global.alienevo_5_10k_uniforms = [true, true, true];
global.alienevo_5_default_uniforms = [true, false, false];
global.alienevo_5_prototype_uniforms = [true, true, true];
global.alienevo_5_10k_skincolor_palette_1 = ["c3ccc9", "aebab7", "9aaaa8", "839695", "6c7f82"];
global.alienevo_5_10k_skincolor_palette_2 = ["3a3333", "2c2828", "232020", "171515", "000000"];
global.alienevo_5_default_skincolor_palette_1 = ["c3ccc9", "aebab7", "9aaaa8", "839695", "6c7f82"];
global.alienevo_5_default_skincolor_palette_2 = ["3a3333", "2c2828", "232020", "171515", "000000"];
global.alienevo_5_default_skincolor_palette_3 = ["3a3333", "2c2828", "232020", "171515", "000000"];
global.alienevo_5_default_skincolor_palette_4 = ["56b60c", "40a009", "288204", "196902", "0d5100"];
global.alienevo_5_default_skincolor_palette_5 = ["7d8fa4", "697991", "56607e", "485070"];
global.alienevo_5_prototype_skincolor_palette_1 = ["c3ccc9", "aebab7", "9aaaa8", "839695", "6c7f82"];
global.alienevo_5_prototype_skincolor_palette_2 = ["3a3333", "2c2828", "232020", "171515", "000000"];
global.alienevo_5_gadget_3_color_palette_1 = ["8fae8c", "809d7c", "6c8666", "637759", "505f46"];
global.alienevo_5_gadget_3_color_palette_2 = ["837446", "71663c", "615a34", "514d2b", "413f23"];
global.alienevo_5_10k_glowcolor_2 = ["b3ff40", "a7f72e", "8ed721", "77b81a"];
global.alienevo_5_default_glowcolor_2 = ["b3ff40", "a7f72e", "8ed721", "77b81a"];
global.alienevo_5_prototype_glowcolor_2 = ["b3ff40", "a7f72e", "8ed721", "77b81a"];
global.alienevo_5_10k_glowcolor_1 = ["f8ff98", "d2ec72"];
global.alienevo_5_default_glowcolor_1 = ["b3ff40", "8ed721"];
global.alienevo_5_prototype_glowcolor_1 = ["f8ff98", "d2ec72"];

// Four Arms
global.alienevo_6_10k_uniforms = [true, true, true];
global.alienevo_6_default_uniforms = [true, false, false];
global.alienevo_6_prototype_uniforms = [true, true, true];
global.alienevo_6_10k_skincolor_palette_1 = ["c80f12", "af071c", "920920", "7c0525", "6e0721"];
global.alienevo_6_10k_skincolor_palette_2 = ["3a3333", "2c2828", "232020", "171515", "000000"];
global.alienevo_6_default_skincolor_palette_1 = ["c80f12", "af071c", "920920", "7c0525", "6e0721"];
global.alienevo_6_default_skincolor_palette_2 = ["3a3333", "2c2828", "232020", "171515", "000000"];
global.alienevo_6_default_skincolor_palette_3 = ["ffc679", "ffb658", "fca039", "f18730", "e56a26"];
global.alienevo_6_default_skincolor_palette_4 = ["3a3333", "2c2828", "232020", "171515", "000000"];
global.alienevo_6_prototype_skincolor_palette_1 = ["c80f12", "af071c", "920920", "7c0525", "6e0721"];
global.alienevo_6_prototype_skincolor_palette_2 = ["3a3333", "2c2828", "232020", "171515", "000000"];
global.alienevo_6_10k_glowcolor_1 = ["ffc833", "f1891f"];
global.alienevo_6_default_glowcolor_1 = ["b3ff40", "8ed721"];
global.alienevo_6_prototype_glowcolor_1 = ["ffc833", "f1891f"];

// Stinkfly
global.alienevo_7_10k_uniforms = [true, true, true];
global.alienevo_7_default_uniforms = [true, false, false];
global.alienevo_7_prototype_uniforms = [true, true, true];
global.alienevo_7_10k_skincolor_palette_1 = ["9fad3f", "7f9b3b", "728132", "516328", "444f1f"];
global.alienevo_7_10k_skincolor_palette_2 = ["3a3333", "2c2828", "232020", "171515", "000000"];
global.alienevo_7_10k_skincolor_palette_3 = ["f2eec2", "e7e29a", "ded670", "ccc665", "b7b259"];
global.alienevo_7_default_skincolor_palette_1 = ["9fad3f", "7f9b3b", "728132", "516328", "444f1f"];
global.alienevo_7_default_skincolor_palette_2 = ["3a3333", "2c2828", "232020", "171515", "000000"];
global.alienevo_7_default_skincolor_palette_3 = ["f2eec2", "e7e29a", "ded670", "ccc665", "b7b259"];
global.alienevo_7_default_skincolor_palette_4 = ["c1b944", "aeae41", "a69f3c", "928d36", "7f762b"];
global.alienevo_7_prototype_skincolor_palette_1 = ["9fad3f", "7f9b3b", "728132", "516328", "444f1f"];
global.alienevo_7_prototype_skincolor_palette_2 = ["3a3333", "2c2828", "232020", "171515", "000000"];
global.alienevo_7_prototype_skincolor_palette_3 = ["f2eec2", "e7e29a", "ded670", "ccc665", "b7b259"];
global.alienevo_7_10k_glowcolor_1 = ["ffc833", "ffb52e", "f1891f"];
global.alienevo_7_default_glowcolor_1 = ["b3ff40", "a7f72e", "8ed721"];
global.alienevo_7_prototype_glowcolor_1 = ["ffc833"];

// Ripjaws
global.alienevo_8_10k_uniforms = [true, true, false];
global.alienevo_8_default_uniforms = [true, false, false];
global.alienevo_8_prototype_uniforms = [true, true, false];
global.alienevo_8_10k_skincolor_palette_1 = ["f5f4f6", "e8e6e2", "d9dcce", "bcc7b1", "90b08d"];
global.alienevo_8_10k_skincolor_palette_2 = ["c5cb79", "97aa61", "789358", "517636", "2b6522"];
global.alienevo_8_10k_skincolor_palette_3 = ["f5e9bf", "efe1af", "eadaa1", "d3b67a"];
global.alienevo_8_default_skincolor_palette_1 = ["e8ebeb", "d6dedb", "c3d5d1", "a7c0be", "82a7ae"];
global.alienevo_8_default_skincolor_palette_2 = ["c5cb79", "97aa61", "789358", "517636", "2b6522"];
global.alienevo_8_default_skincolor_palette_3 = ["232020", "171515", "000000"];
global.alienevo_8_default_skincolor_palette_4 = ["ffffff", "eff6f6", "dde7e9", "c9d3dc", "a6b2c1"];
global.alienevo_8_prototype_skincolor_palette_1 = ["f5f4f6", "e8e6e2", "d9dcce", "bcc7b1", "90b08d"];
global.alienevo_8_prototype_skincolor_palette_2 = ["c5cb79", "97aa61", "789358", "517636", "2b6522"];
global.alienevo_8_prototype_skincolor_palette_3 = ["f5e9bf", "efe1af", "eadaa1", "d3b67a"];
global.alienevo_8_10k_glowcolor_1 = ["fae0ff", "ecbcfb"];
global.alienevo_8_10k_glowcolor_2 = ["f9ffcd", "d2f089", "9dd463"];
global.alienevo_8_default_glowcolor_1 = ["b3ff40", "8ed721"];
global.alienevo_8_default_glowcolor_2 = ["f9ffcd", "d2f089", "9dd463"];
global.alienevo_8_prototype_glowcolor_1 = ["fae0ff", "ecbcfb"];
global.alienevo_8_prototype_glowcolor_2 = ["f9ffcd", "d2f089", "9dd463"];

// Upgrade
global.alienevo_9_10k_uniforms = [true, false, false];
global.alienevo_9_default_uniforms = [true, false, false];
global.alienevo_9_prototype_uniforms = [true, false, false];
global.alienevo_9_10k_skincolor_palette_1 = ["3a3333", "2c2828", "232020", "171515", "000000"];
global.alienevo_9_10k_skincolor_palette_2 = ["ffffff", "edf4f4", "d6dfe1", "bdc7cf", "97a2b0"];
global.alienevo_9_default_skincolor_palette_1 = ["3a3333", "2c2828", "232020", "171515", "000000"];
global.alienevo_9_default_skincolor_palette_2 = ["56b60c", "40a009", "288204", "196902", "0d5100"];
global.alienevo_9_prototype_skincolor_palette_1 = ["3a3333", "2c2828", "232020", "171515", "000000"];
global.alienevo_9_prototype_skincolor_palette_2 = ["ffffff", "edf4f4", "d6dfe1", "bdc7cf", "97a2b0"];
global.alienevo_9_10k_glowcolor_1 = ["b3ff40", "a7f72e", "8ed721", "64a306", "365b00"];
global.alienevo_9_default_glowcolor_1 = ["b3ff40", "a7f72e", "8ed721", "64a306", "365b00"];
global.alienevo_9_prototype_glowcolor_1 = ["b3ff40", "a7f72e", "8ed721", "64a306", "365b00"];

// Ghostfreak
global.alienevo_10_10k_uniforms = [true, false, false];
global.alienevo_10_default_uniforms = [true, false, false];
global.alienevo_10_prototype_uniforms = [true, false, false];
global.alienevo_10_10k_skincolor_palette_1 = ["dad7dd", "c6c1c9", "b5abb6", "a797a9", "9f87a6"];
global.alienevo_10_10k_skincolor_palette_1_inv = ["585552", "3d3737", "2e2a27", "24211e", "211b18"];
global.alienevo_10_10k_skincolor_palette_2 = ["3a3333", "2c2828", "232020", "171515", "000000"];
global.alienevo_10_10k_skincolor_palette_2_inv = ["ffffff", "edf3f3", "d4dee1", "bcc8ce", "98a1b0"];
global.alienevo_10_10k_skincolor_palette_3 = ["495065", "3e4453", "252c3d", "1b2230"];
global.alienevo_10_default_skincolor_palette_1 = ["d5d8dd", "c0c3c9", "acadb9", "999bad", "878eaa"];
global.alienevo_10_default_skincolor_palette_1_inv = ["585552", "3d3737", "2e2a27", "24211e", "211b18"];
global.alienevo_10_default_skincolor_palette_2 = ["3a3333", "2c2828", "232020", "171515", "000000"]; 
global.alienevo_10_default_skincolor_palette_2_inv = ["ffffff", "edf3f3", "d4dee1", "bcc8ce", "98a1b0"];
global.alienevo_10_prototype_skincolor_palette_1 = ["dad7dd", "c6c1c9", "b5abb6", "a797a9", "9f87a6"];
global.alienevo_10_prototype_skincolor_palette_1_inv = ["585552", "3d3737", "2e2a27", "24211e", "211b18"];
global.alienevo_10_prototype_skincolor_palette_2 = ["3a3333", "2c2828", "232020", "171515", "000000"];
global.alienevo_10_prototype_skincolor_palette_2_inv = ["ffffff", "edf3f3", "d4dee1", "bcc8ce", "98a1b0"];
global.alienevo_10_10k_glowcolor_1 = ["eb99e4", "ca7de8"];
global.alienevo_10_default_glowcolor_1 = ["b3ff40", "8ed721"];
global.alienevo_10_prototype_glowcolor_1 = ["eb99e4", "ca7de8"];

// Cannonbolt
global.alienevo_11_10k_uniforms = [true, false, false];
global.alienevo_11_default_uniforms = [true, false, false];
global.alienevo_11_prototype_uniforms = [true, false, false];
global.alienevo_11_10k_skincolor_palette_1 = ["ffd95c", "f8c144", "eba424", "df8c13", "ce7006"];
global.alienevo_11_10k_skincolor_palette_2 = ["3a3333", "2c2828", "232020", "171515", "000000"];
global.alienevo_11_10k_skincolor_palette_3 = ["fdfcf9", "f5f2e4", "eee4d1", "e4d0b7", "dcbea2"];
global.alienevo_11_default_skincolor_palette_1 = ["ffd95c", "f8c144", "eba424", "df8c13", "ce7006"];
global.alienevo_11_default_skincolor_palette_2 = ["3a3333", "2c2828", "232020", "171515", "000000"];
global.alienevo_11_default_skincolor_palette_3 = ["fdfcf9", "f5f2e4", "eee4d1", "e4d0b7", "dcbea2"];
global.alienevo_11_prototype_skincolor_palette_1 = ["ffd95c", "f8c144", "eba424", "df8c13", "ce7006"];
global.alienevo_11_prototype_skincolor_palette_2 = ["3a3333", "2c2828", "232020", "171515", "000000"];
global.alienevo_11_prototype_skincolor_palette_3 = ["fdfcf9", "f5f2e4", "eee4d1", "e4d0b7", "dcbea2"];
global.alienevo_11_10k_glowcolor_1 = ["f8c144", "df8c13"];
global.alienevo_11_default_glowcolor_1 = ["b3ff40", "8ed721"];
global.alienevo_11_prototype_glowcolor_1 = ["f8c144", "df8c13"];