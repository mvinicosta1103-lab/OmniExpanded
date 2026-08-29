let Attributes = Java.loadClass('net.minecraft.world.entity.ai.attributes.Attributes');

ServerEvents.tick(event => {
    if (event.server.tickCount % 20 !== 0) return;
    
    let players = event.server.getPlayerList().getPlayers();
    
    for (let player of players) {
        try {
            let attackDamage = player.getAttribute(Attributes.ATTACK_DAMAGE);
            if (attackDamage) {
                let attackValue = Math.round(attackDamage.getValue());
                palladium.setProperty(player, 'current_attack', attackValue);
            }
            
            let maxHealth = player.getAttribute(Attributes.MAX_HEALTH);
            if (maxHealth) {
                let healthValue = Math.round(maxHealth.getValue());
                palladium.setProperty(player, 'current_hp', healthValue);
            }
            
            let armor = player.getAttribute(Attributes.ARMOR);
            if (armor) {
                let armorValue = Math.round(armor.getValue());
                palladium.setProperty(player, 'current_defense', armorValue);
            }
            
            let armorToughness = player.getAttribute(Attributes.ARMOR_TOUGHNESS);
            if (armorToughness) {
                let toughnessValue = Math.round(armorToughness.getValue());
                palladium.setProperty(player, 'current_toughness', toughnessValue);
            }
            
            let movementSpeed = player.getAttribute(Attributes.MOVEMENT_SPEED);
            if (movementSpeed) {
                let rawSpeed = movementSpeed.getValue();
                let speedValue = Math.round(rawSpeed * 100);
                palladium.setProperty(player, 'current_speed', speedValue);
            }
            
            let knockbackRes = player.getAttribute(Attributes.KNOCKBACK_RESISTANCE);
            if (knockbackRes) {
                let kbValue = Math.round(knockbackRes.getValue() * 100);
                palladium.setProperty(player, 'current_kb_res', kbValue);
            }
            
        } catch (error) {
        }
    }
});

ServerEvents.tick(event => {
    if (event.server.tickCount % 20 !== 0) return;
    
    event.server.getPlayers().forEach(player => {
        try {
            let currentAlienNumber = palladium.getProperty(player, 'omnitrix_cycle');
            
            if (currentAlienNumber && currentAlienNumber > 0) {
                let nickname = player.persistentData.getString(`alienevo_${currentAlienNumber}`);
                
                if (nickname && nickname !== '') {
                    palladium.setProperty(player, 'current_alien_nickname', nickname);
                } else {
                    palladium.setProperty(player, 'current_alien_nickname', '');
                }
            } else {
                palladium.setProperty(player, 'current_alien_nickname', '');
            }
        } catch (error) {
        }
    });
});