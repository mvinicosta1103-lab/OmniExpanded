// Made by Gorlomi da Goat. Any use of this script in other addons will lead to a copyright strike.

EntityEvents.hurt((event) => {
    if (event.source == 'DamageSource (fall)' && event.entity.isPlayer() && abilityUtil.isEnabled(event.entity, 'alienevo_aliens:pyronite', 'pyronite_loop')) {
        if (event.entity.fallDistance < 30) {
            event.cancel(); 
        }
    }
});

EntityEvents.hurt((event) => {
    if (event.source == 'DamageSource (fall)' && event.entity.isPlayer() && abilityUtil.isEnabled(event.entity, 'alienevo_aliens:vulpimancer', 'vulpimancer_loop')) {
        if (event.entity.fallDistance < 20) {
            event.cancel(); 
        }
    }
});

EntityEvents.hurt((event) => {
    if (event.source == 'DamageSource (fall)' && event.entity.isPlayer() && abilityUtil.isEnabled(event.entity, 'alienevo_aliens:kineceleran', 'kineceleran_loop')) {
        if (event.entity.fallDistance < 15) {
            event.cancel(); 
        }
    }
});

EntityEvents.hurt((event) => {
    if (event.source == 'DamageSource (fall)' && event.entity.isPlayer() && abilityUtil.isEnabled(event.entity, 'alienevo_aliens:piscciss_volann', 'piscciss_volann_loop')) {
        if (event.entity.fallDistance < 20) {
            event.cancel(); 
        }
    }
});

