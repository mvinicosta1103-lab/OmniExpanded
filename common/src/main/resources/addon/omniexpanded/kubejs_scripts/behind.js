StartupEvents.registry('palladium:abilities', (event) => {
    event.create('alienevo:back_attack_reduction')
        .icon(palladium.createItemIcon('minecraft:shield'))
        .addProperty("damage_reduction", "float", 1, "Damage reduction factor (0-1)")
        .tick((function () {
            let lastHealth = -1;
            let isDead = false;
            return function (entity, entry, holder, enabled) {
                if (enabled && entity.isLiving()) {
                    let damageReduction = entry.getPropertyByName("damage_reduction");
                    let currentHealth = entity.getHealth();

                    if (currentHealth <= 0) {
                        if (!isDead) {
                            lastHealth = -1;
                            isDead = true;
                        }
                        return;
                    }

                    if (isDead && currentHealth > 0) {
                        lastHealth = currentHealth;
                        isDead = false;
                        return;
                    }

                    if (lastHealth === -1) {
                        lastHealth = currentHealth;
                        return;
                    }

                    if (currentHealth < lastHealth) {
                        let damageTaken = lastHealth - currentHealth;
                        let attacker = entity.getLastAttacker();

                        if (attacker) {
                            let attackInfo = isAttackFromBehind(entity, attacker);

                            if (attackInfo.isFromBehind) {
                                let newDamage = damageTaken * (1 - damageReduction);
                                let healAmount = damageTaken - newDamage;
                                entity.setHealth(currentHealth + healAmount);
                            }
                        }
                    }

                    lastHealth = entity.getHealth();
                }
            };
        })());
});

function isAttackFromBehind(target, attacker) {
    try {
        let targetX = target.getX();
        let targetZ = target.getZ();
        let attackerX = attacker.getX();
        let attackerZ = attacker.getZ();

        let yaw = target.getYaw();

        let facingDirection;
        if (yaw >= -45 && yaw < 45) facingDirection = "south";
        else if (yaw >= 45 && yaw < 135) facingDirection = "west";
        else if (yaw >= 135 || yaw < -135) facingDirection = "north";
        else facingDirection = "east";

        let isFromBehind = false;
        switch (facingDirection) {
            case "north": isFromBehind = attackerZ > targetZ; break;
            case "south": isFromBehind = attackerZ < targetZ; break;
            case "east": isFromBehind = attackerX < targetX; break;
            case "west": isFromBehind = attackerX > targetX; break;
        }

        return { isFromBehind: isFromBehind };
    } catch (error) {
        return { isFromBehind: false };
    }
}