global.KB = (entity, target, strength) => {
    const dx = target.x - entity.x;
    const dz = target.z - entity.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    if (distance > 0) {
        const multiplier = strength / distance;
        target.addMotion(
            dx * multiplier,
            0.4 * strength,
            dz * multiplier
        );
    }
};

StartupEvents.registry('palladium:abilities', (event) => {
    event.create('alienevo:sonic_clap')
        .icon(palladium.createItemIcon('palladium:vibranium_circuit'))
        .addProperty('radius', 'float', 10, 'Radius in which surrounding entities will be damaged')
        .addProperty('damage', 'float', 3.0, 'Damage the ability will deal')
        .addProperty('fire_seconds', 'float', 0.0, 'How many seconds the entity should be on fire')
        .addProperty('tag_ex', 'string', 'exclusion_tag', 'Tag that exlcudes entities if desired')
        .addProperty('damage_type', 'string', 'minecraft:player_attack', 'Type of damage.')
        .addProperty('knockback', 'float', 0.0, 'Knockback strength (0 for no knockback)')
        .tick((entity, entry, holder, enabled) => {
            if (enabled) {
                const damage_type = entry.getPropertyByName('damage_type');
                const tag_ex = entry.getPropertyByName('tag_ex');
                const firetick = entry.getPropertyByName('fire_seconds');
                const damage = entry.getPropertyByName('damage');
                const radius = entry.getPropertyByName('radius') * 2.0;
                const knockbackStrength = entry.getPropertyByName('knockback');
                const targets = entity.serverLevel().getEntities(entity, AABB.ofSize(entity.position(), radius, radius, radius)).toArray();
                const grassRadius = Math.floor(radius / 2);
                entity.server.runCommandSilent(`execute at ${entity.uuid} run fill ~-${grassRadius} ~-2 ~-${grassRadius} ~${grassRadius} ~2 ~${grassRadius} minecraft:air destroy minecraft:grass`);
                entity.server.runCommandSilent(`execute at ${entity.uuid} run fill ~-${grassRadius} ~-2 ~-${grassRadius} ~${grassRadius} ~2 ~${grassRadius} minecraft:air destroy minecraft:tall_grass`);
                entity.server.runCommandSilent(`execute at ${entity.uuid} run fill ~-${grassRadius} ~-2 ~-${grassRadius} ~${grassRadius} ~2 ~${grassRadius} minecraft:air destroy minecraft:fern`);
                
                for (let j = 0; j < targets.length; j++) {
                    if (targets[j] !== entity && 
                        !containsTag(targets[j].getTags().toArray(), tag_ex) &&
                        targets[j].type !== "minecraft:item" &&
                        targets[j].type !== "minecraft:item_frame" &&
                        targets[j].type !== "minecraft:glow_item_frame" &&
                        targets[j].type !== "minecraft:armor_stand" &&
                        targets[j].type !== "palladium:suit_stand" &&
                        targets[j].type !== "palladium:custom_projectile") {

                        entity.server.runCommandSilent("execute as " + targets[j].uuid + " at @s run damage @s " + damage + " " + damage_type + " by " + entity.uuid);

                        targets[j].setSecondsOnFire(firetick);

                        if (knockbackStrength > 0) {
                            global.KB(entity, targets[j], knockbackStrength);
                        }
                    }
                }
            }
        });
});

function containsTag(tags, tag) {
    for (let i = 0; i < tags.length; i++) {
        if(tags[i].equals(tag)) {
            return true;
        }
    }
    return false;
}