const $CompoundTag = Java.loadClass("net.minecraft.nbt.CompoundTag");

function dynamicColorHandler(state, level, pos, index) {
    if (!level || !pos) return 0xffffff;
    let blockEntity = level.getBlockEntity(pos);
    if (!blockEntity) return 0xffffff;

    // Swap color indices
    let mappedIndex = index;
    if (index === 0) {
        mappedIndex = 2;
    } else if (index === 2) {
        mappedIndex = 0;
    }

    let key = `Color${mappedIndex}`;
    if (blockEntity.data && blockEntity.data.contains(key)) {
        return blockEntity.data.getInt(key);
    }

    return 0xffffff;
}

StartupEvents.registry('block', event => {


    event.create('alienevo:galvan_pod', 'cardinal')
        .displayName('Galvan Pod')
        .soundType('netherite_block')
        .resistance(1200.0)
        .tagBlock('minecraft:mineable/pickaxe')
        .tagBlock('minecraft:needs_stone_tool')
        .requiresTool(true)
        .hardness(5)
        .model('alienevo:block/pod_block')
        .blockEntity(entityInfo => {
            entityInfo.inventory(9, 3)
            entityInfo.rightClickOpensInventory()
        })

    event.create('alienevo:machined_metal')
        .displayName('Machined Metal')
        .soundType('copper')
        .resistance(6.0)
        .tagBlock('minecraft:mineable/pickaxe')
        .tagBlock('minecraft:needs_stone_tool')
        .requiresTool(true)
        .fullBlock(true)
        .hardness(4)
        .textureAll('alienevo:block/machined_metal')

    event.create('alienevo:machined_panel')
        .displayName('Machined Panel')
        .soundType('metal')
        .resistance(6.0)
        .tagBlock('minecraft:mineable/pickaxe')
        .tagBlock('minecraft:needs_stone_tool')
        .requiresTool(true)
        .fullBlock(true)
        .hardness(4)
        .textureAll('alienevo:block/machined_panel')

    // permanent taydenite block
    event.create('alienevo:permanent_taydenite_block')
        .displayName('Taydenite')
        .soundType('amethyst')
        .resistance(255)
        .textureAll('alienevo:block/diamond_block')
        .texture(Direction.UP, 'alienevo:block/diamond_block_up')
        .texture(Direction.DOWN, 'alienevo:block/diamond_block_up')
        .hardness(12)
        .tagBlock('minecraft:mineable/pickaxe')
        .tagBlock('minecraft:needs_diamond_tool')
        .requiresTool(true)

    // permanent smooth taydenite block
    event.create('alienevo:permanent_smooth_taydenite_block')
        .displayName('Smooth Taydenite')
        .soundType('amethyst')
        .resistance(255)
        .textureAll('alienevo:block/diamond_block_2')
        .texture(Direction.UP, 'alienevo:block/diamond_block_up')
        .texture(Direction.DOWN, 'alienevo:block/diamond_block_up')
        .hardness(12)
        .tagBlock('minecraft:mineable/pickaxe')
        .tagBlock('minecraft:needs_diamond_tool')
        .requiresTool(true)

    event.create('alienevo:crystal_block')
        .displayName('Crystal Block')
        .soundType('amethyst')
        .noDrops()
        .resistance(255)
        .hardness(25)
        .noItem()
        .renderType('cutout')
        .model('alienevo:block/crystal')
        .color(0, dynamicColorHandler)
        .color(1, dynamicColorHandler)
        .color(2, dynamicColorHandler)
        .color(3, dynamicColorHandler)
        .color(4, dynamicColorHandler)
        .color(5, dynamicColorHandler)
        .blockEntity(blockEntity => {
            blockEntity.enableSync();
            const initialData = new $CompoundTag();
            blockEntity.initialData(initialData);
            blockEntity.serverTick(2500, 250, entity => {
                entity.level.destroyBlock(entity.blockPos, false)
            })
        })

    event.create('alienevo:smooth_crystal_block')
        .displayName('Crystal Block')
        .soundType('amethyst')
        .noDrops()
        .resistance(255)
        .hardness(25)
        .noItem()
        .renderType('cutout')
        .model('alienevo:block/crystal_smooth')
        .color(0, dynamicColorHandler)
        .color(1, dynamicColorHandler)
        .color(2, dynamicColorHandler)
        .color(3, dynamicColorHandler)
        .color(4, dynamicColorHandler)
        .color(5, dynamicColorHandler)
        .blockEntity(blockEntity => {
            blockEntity.enableSync();
            const initialData = new $CompoundTag();
            blockEntity.initialData(initialData);
            blockEntity.serverTick(2500, 250, entity => {
                entity.level.destroyBlock(entity.blockPos, false)
            })
        })
});

StartupEvents.modifyCreativeTab('kubejs:tab', event => {
  event.remove('alienevo:omnitrix_workbench');
  event.remove('alienevo:galvan_pod');
  event.remove('alienevo:machined_metal');
  event.remove('alienevo:machined_panel');
  event.remove('alienevo:permanent_taydenite_block');
  event.remove('alienevo:permanent_smooth_taydenite_block');
//   event.remove('afomni:ice');
//   event.remove('afomni:packed_ice');
//   event.remove('afomni:blue_ice');
});

// /setblock ~ ~ ~ alienevo:tintable_crystal{data:{Color0:16711935}}
// /setblock ~ ~ ~ alienevo:tintable_crystal{data:{Color0:16711935,Color1:255}}