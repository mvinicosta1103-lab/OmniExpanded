ServerEvents.recipes(event => {
    // All iron -> galvan tool upgrades
    event.smithing(
        'alienevo:galvan_pickaxe', // output
        'alienevo:smithing_template_galvan', // template
        'minecraft:iron_pickaxe', // base item
        'alienevo:galvan_metal' // upgrade material
    );
    
    event.smithing(
        'alienevo:galvan_axe',
        'alienevo:smithing_template_galvan',
        'minecraft:iron_axe',
        'alienevo:galvan_metal'
    );
    
    event.smithing(
        'alienevo:galvan_shovel',
        'alienevo:smithing_template_galvan',
        'minecraft:iron_shovel',
        'alienevo:galvan_metal'
    );
    
    event.smithing(
        'alienevo:galvan_sword',
        'alienevo:smithing_template_galvan',
        'minecraft:iron_sword',
        'alienevo:galvan_metal'
    );
    
    event.smithing(
        'alienevo:galvan_hoe',
        'alienevo:smithing_template_galvan',
        'minecraft:iron_hoe',
        'alienevo:galvan_metal'
    );
})