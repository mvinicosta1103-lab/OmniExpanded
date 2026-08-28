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
