StartupEvents.registry('block', event => {

    event.create('alienevo:ice')
        .soundType('glass')
        .noDrops()
        .noItem()
        .model("alienevo:block/ice_height2")
        .box(0, 0, 0, 16, 2, 16)
        .randomTick(tick => {
            if (Math.random() < 0.99) {
                tick.block.set('minecraft:air');
            }
        });
});
StartupEvents.registry('block', event => {

    event.create('alienevo:ice4')
        .soundType('glass')
        .box(0, 0, 0, 16, 4, 16)
        .noDrops()
        .noItem()
        .model("alienevo:block/ice_height4")
        .randomTick(tick => {
            if (Math.random() < 0.99) {
                tick.block.set('minecraft:air');
            }
        });
});
StartupEvents.registry('block', event => {

    event.create('alienevo:ice6')
        .soundType('glass')
        .box(0, 0, 0, 16, 6, 16)
        .noDrops()
        .noItem()
        .model("alienevo:block/ice_height6")
        .randomTick(tick => {
            if (Math.random() < 0.99) {
                tick.block.set('minecraft:air');
            }
        });
});
StartupEvents.registry('block', event => {

    event.create('alienevo:ice8')
        .soundType('glass')
        .noDrops()
        .noItem()
        .model("alienevo:block/ice_height8")
        .box(0, 0, 0, 16, 8, 16)
        .randomTick(tick => {
            if (Math.random() < 0.99) {
                tick.block.set('minecraft:air');
            }
        });
});
StartupEvents.registry('block', event => {

    event.create('alienevo:ice10')
        .soundType('glass')
        .noDrops()
        .noItem()
        .model("alienevo:block/ice_height10")
        .box(0, 0, 0, 16, 10, 16)
        .randomTick(tick => {
            if (Math.random() < 0.99) {
                tick.block.set('minecraft:air');
            }
        });
});
StartupEvents.registry('block', event => {

    event.create('alienevo:ice12')
        .soundType('glass')
        .noDrops()
        .noItem()
        .box(0, 0, 0, 16, 12, 16)
        .model("alienevo:block/ice_height12")
        .randomTick(tick => {
            if (Math.random() < 0.99) {
                tick.block.set('minecraft:air');
            }
        });
});
StartupEvents.registry('block', event => {

    event.create('alienevo:ice14')
        .soundType('glass')
        .noDrops()
        .noItem()
        .box(0, 0, 0, 16, 14, 16)
        .model("alienevo:block/ice_height14")
        .randomTick(tick => {
            if (Math.random() < 0.99) {
                tick.block.set('minecraft:air');
            }
        });
});
StartupEvents.registry('block', event => {

    event.create('alienevo:ice_block')
        .soundType('glass')
        .noDrops()
        .noItem()
        .textureAll('minecraft:block/blue_ice')
        .randomTick(tick => {
            if (Math.random() < 0.99) {
                tick.block.set('minecraft:air');
            }
        });
});
