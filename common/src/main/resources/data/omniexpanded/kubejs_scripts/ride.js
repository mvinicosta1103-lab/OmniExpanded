ItemEvents.entityInteracted(event => {
    let entity = event.entity;
    let target = event.target;

    if (!entity.isLiving() || !target.isLiving()) {
        return;
    }

    let name = target.name.getString();
    let ridden_tag = target.tags.contains('alienevo.vulpimancer.ridden');

    if (abilityUtil.hasPower(target, "alienevo_aliens:vulpimancer") &&
        !ridden_tag) {
        let ride = entity.getLevel().createEntity('minecraft:item_display');
        ride.tags.add('alienevo.vulp.ride');
        ride.setCustomName(name);
        entity.startRiding(ride);
        ride.setPosition(target.x, target.y, target.z)
        ride.startRiding(target);
        ride.spawn();
        target.tags.add('alienevo.vulpimancer.ridden');
    }
});

EntityEvents.spawned('minecraft:item_display', event => {
    let entity = event.entity;
    let id = entity.name.getString();
    let vulptag = entity.tags.contains('alienevo.vulp.ride');
    
    function teleportToOwner() {
        if (!entity.isAlive()) return;
        
        event.server.runCommandSilent(`execute as @a[name=${id}] unless entity @s[palladium.power=alienevo_aliens:vulpimancer] run kill @e[type=minecraft:item_display,sort=nearest,limit=1,tag=alienevo.vulp.ride,name=${id}]`);
        
        if (entity.passengers.isEmpty()) {
            event.server.runCommandSilent(`execute as @a[name=${id}] run tag @s remove alienevo.vulpimancer.ridden`);
            entity.kill()
        }
        event.server.schedule(1, teleportToOwner);
    }
    
    if (vulptag) {
        event.server.schedule(1, teleportToOwner);
    }
});