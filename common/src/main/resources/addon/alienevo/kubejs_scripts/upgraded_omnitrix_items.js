StartupEvents.registry('item', event => {
    event.create('alienevo:upgraded_omnitrix')
        .displayName('Upgraded Omnitrix')
        .maxStackSize(1)
        .fireResistant()
        .texture('layer0', 'alienevo:item/upgraded_omnitrix');
});

StartupEvents.modifyCreativeTab('kubejs:tab', event => {
    event.add('alienevo:upgraded_omnitrix');
});

// The base AlienEvo abilities (transform, recharge, detransform, failsafe, etc.)
// look up a real SoundEvent object in the registry (not just a sounds.json entry)
// for whatever tier is currently equipped. sounds.json alone only tells the
// resource pack which .ogg to play once a SoundEvent with that id already
// exists in the registry - it does not create the registry entry itself.
// Since "upgraded" is a new tier added by this addon, none of its "upgraded_*"
// ids were ever registered as SoundEvents, so any ability that tries to play
// one (e.g. the recharge tick calling alienevo:upgraded_recharge) throws
// "No such element with id ... in registry minecraft:sound_event!" and
// crashes the game. Registering them here fixes that for every ability that
// uses this tier, not just recharge.
StartupEvents.registry('sound_event', event => {
    const upgradedSounds = [
        'upgraded_1_transform',
        'upgraded_activate',
        'upgraded_core_place',
        'upgraded_cycle_1',
        'upgraded_cycle_2',
        'upgraded_cycle_3',
        'upgraded_cycle_4',
        'upgraded_cycle_color',
        'upgraded_decouple',
        'upgraded_detransform',
        'upgraded_failsafe',
        'upgraded_hourglass',
        'upgraded_hourglass_close',
        'upgraded_idle',
        'upgraded_master_control',
        'upgraded_master_transform',
        'upgraded_prime_loop',
        'upgraded_recharge',
        'upgraded_remove_core',
        'upgraded_sdm',
        'upgraded_sdm_blink',
        'upgraded_switch3',
        'upgraded_timeout',
        'upgraded_transform'
    ];

    upgradedSounds.forEach(id => event.create('alienevo:' + id));

    // The base AlienEvo mod's own omnitrix_timer.js calls
    // alienevo:default_detransform as a fallback sound, but the base mod
    // never actually registers a SoundEvent with that id - it only exists
    // for prototype/recal/upgraded tiers. That mismatch crashes the game
    // ("No such element with id alienevo:default_detransform in registry
    // minecraft:sound_event!") whenever the timer's fallback path runs.
    // Registering it here (same fix as the upgraded_* sounds above) closes
    // that gap without touching the closed-source AlienEvo jar.
    event.create('alienevo:default_detransform');
});