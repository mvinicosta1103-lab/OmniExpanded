const OMNITRIX_RARITY = 300;

function processGalvanPod(blockEntity) {
    if (!blockEntity || !blockEntity.inventory) return;

    const centerSlot = 13;
    const centerItem = blockEntity.inventory.getStackInSlot(centerSlot);

    if (!centerItem || centerItem.item.id !== 'minecraft:barrier') return;

    if (centerItem.count > 1) {
        centerItem.count--;
        blockEntity.inventory.setStackInSlot(centerSlot, centerItem);
    } else {
        blockEntity.inventory.setStackInSlot(centerSlot, Item.empty);
    }

    const hasOmnitrix = Math.random() < (1 / OMNITRIX_RARITY);

    const itemGroups = {
        shards: {
            maxTotal: 6,
            weight: 10,
            items: [
                { item: 'alienevo:upgrade_shards', weight: 4, maxStack: 3 },
                { item: 'alienevo:upgrade_shards_black', weight: 2, maxStack: 3 },
                { item: 'alienevo:upgrade_shards_green', weight: 2, maxStack: 3 },
                { item: 'alienevo:upgrade_shards_brown', weight: 2, maxStack: 3 },
                { item: 'alienevo:upgrade_shards_cyan', weight: 2, maxStack: 3 },
                { item: 'alienevo:upgrade_shards_magenta', weight: 2, maxStack: 3 },
                { item: 'alienevo:upgrade_shards_light_gray', weight: 2, maxStack: 3 },
                { item: 'alienevo:upgrade_shards_gray', weight: 2, maxStack: 3 },
                { item: 'alienevo:upgrade_shards_pink', weight: 2, maxStack: 3 },
                { item: 'alienevo:upgrade_shards_purple', weight: 2, maxStack: 3 },
                { item: 'alienevo:upgrade_shards_light_blue', weight: 2, maxStack: 3 },
                { item: 'alienevo:upgrade_shards_blue', weight: 2, maxStack: 3 },
                { item: 'alienevo:upgrade_shards_red', weight: 2, maxStack: 3 },
                { item: 'alienevo:upgrade_shards_orange', weight: 2, maxStack: 3 },
                { item: 'alienevo:upgrade_shards_white', weight: 2, maxStack: 3 },
                { item: 'alienevo:upgrade_shards_yellow', weight: 2, maxStack: 3 }
            ]
        },
        crystals: {
            maxTotal: 2,
            weight: 4,
            items: [
                { item: 'alienevo:upgrade_crystal', weight: 0.5, maxStack: 1 },
                { item: 'alienevo:upgrade_crystal_black', weight: 0.25, maxStack: 1 },
                { item: 'alienevo:upgrade_crystal_green', weight: 0.25, maxStack: 1 },
                { item: 'alienevo:upgrade_crystal_brown', weight: 0.25, maxStack: 1 },
                { item: 'alienevo:upgrade_crystal_cyan', weight: 0.25, maxStack: 1 },
                { item: 'alienevo:upgrade_crystal_magenta', weight: 0.25, maxStack: 1 },
                { item: 'alienevo:upgrade_crystal_light_gray', weight: 0.25, maxStack: 1 },
                { item: 'alienevo:upgrade_crystal_gray', weight: 0.25, maxStack: 1 },
                { item: 'alienevo:upgrade_crystal_pink', weight: 0.25, maxStack: 1 },
                { item: 'alienevo:upgrade_crystal_purple', weight: 0.25, maxStack: 1 },
                { item: 'alienevo:upgrade_crystal_light_blue', weight: 0.25, maxStack: 1 },
                { item: 'alienevo:upgrade_crystal_blue', weight: 0.25, maxStack: 1 },
                { item: 'alienevo:upgrade_crystal_red', weight: 0.25, maxStack: 1 },
                { item: 'alienevo:upgrade_crystal_orange', weight: 0.25, maxStack: 1 },
                { item: 'alienevo:upgrade_crystal_white', weight: 0.25, maxStack: 1 },
                { item: 'alienevo:upgrade_crystal_yellow', weight: 0.25, maxStack: 1 }
            ]
        },
        materials: {
            maxTotal: 8,
            weight: 15,
            items: [
                { item: 'minecraft:iron_ingot', weight: 6, maxStack: 2 },
                { item: 'palladium:lead_ingot', weight: 5, maxStack: 2 },
                { item: 'palladium:raw_titanium', weight: 3, maxStack: 1 },
                { item: 'alienevo:galvan_scrap', weight: 16, maxStack: 4 },
                { item: 'alienevo:galvan_metal', weight: 5, maxStack: 2 },
                { item: 'alienevo:smithing_template_galvan', weight: 3, maxStack: 1 }
            ]
        }
    };

    const groupCounts = {};
    for (let groupName in itemGroups) {
        groupCounts[groupName] = 0;
    }

    function pickRandomGroup() {
        let totalWeight = 0;
        for (const groupName in itemGroups) {
            totalWeight += itemGroups[groupName].weight;
        }

        const random = Math.random() * totalWeight;

        let accumulatedWeight = 0;
        for (const groupName in itemGroups) {
            accumulatedWeight += itemGroups[groupName].weight;
            if (random <= accumulatedWeight) {
                return [groupName, itemGroups[groupName]];
            }
        }

        const firstGroup = Object.keys(itemGroups)[0];
        return [firstGroup, itemGroups[firstGroup]];
    }

    function pickRandomItem(groupName, group) {
        let totalWeight = 0;
        for (const itemConfig of group.items) {
            totalWeight += itemConfig.weight;
        }

        const random = Math.random() * totalWeight;

        let accumulatedWeight = 0;
        for (const itemConfig of group.items) {
            accumulatedWeight += itemConfig.weight;
            if (random <= accumulatedWeight) {
                const remainingItems = group.maxTotal - groupCounts[groupName];
                const possibleStack = Math.min(itemConfig.maxStack, remainingItems);
                if (possibleStack <= 0) return null;

                const stackSize = Math.floor(Math.random() * possibleStack) + 1;
                groupCounts[groupName] += stackSize;

                return {
                    item: itemConfig.item,
                    stackSize: stackSize
                };
            }
        }

        return null;
    }

    const slotsToFill = Math.floor(Math.random() * 6) + 5;
    const usedSlots = new Set();

    let omnitrixSlot = -1;
    if (hasOmnitrix) {
        omnitrixSlot = Math.floor(Math.random() * 27);
        usedSlots.add(omnitrixSlot);
    }

    while (usedSlots.size < slotsToFill) {
        let slot = Math.floor(Math.random() * 27);
        usedSlots.add(slot);
    }

    usedSlots.forEach(slot => {
        if (hasOmnitrix && slot === omnitrixSlot) {
            blockEntity.inventory.setStackInSlot(slot, Item.of('alienevo:prototype_omnitrix', 1));
        } else {
            const [groupName, group] = pickRandomGroup();
            const selectedItem = pickRandomItem(groupName, group);

            if (selectedItem) {
                blockEntity.inventory.setStackInSlot(slot, Item.of(selectedItem.item, selectedItem.stackSize));
            }
        }
    });
}

BlockEvents.rightClicked('alienevo:galvan_pod', event => {
    processGalvanPod(event.block.entity);
});

BlockEvents.broken('alienevo:galvan_pod', event => {
    processGalvanPod(event.block.entity);
});