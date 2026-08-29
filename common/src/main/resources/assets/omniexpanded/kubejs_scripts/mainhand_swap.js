let originalHandPreference = null;
let isSwapped = false;
let swapCooldownTimer = 0;
let swapCooldown = 5;

function hasHandSwapAbility(player) {
    return abilityUtil.hasPower(player, "alienevo_aliens:tetramand") ||
           abilityUtil.isEnabled(player, "alienevo_aliens:galvanic_mechamorph", "spike_hands");
}

ItemEvents.firstLeftClicked(event => {
    let { player } = event;
    if (!hasHandSwapAbility(player)) {
        return;
    }
    if (swapCooldownTimer > 0) {
        return;
    }
    if (!player.getMainHandItem().isEmpty() || !player.getOffhandItem().isEmpty()) {
        return;
    }
    if (originalHandPreference === null && !isSwapped) {
        originalHandPreference = player.getMainArm();
    }
    let currentMainHand = player.getMainArm();
    player.setMainArm(currentMainHand === 'right' ? 'left' : 'right');
    
    isSwapped = true;
    swapCooldownTimer = swapCooldown;
});

ClientEvents.tick(event => {
    let { player } = event;
    if (swapCooldownTimer > 0) {
        swapCooldownTimer--;
    }
    if (isSwapped && originalHandPreference !== null) {
        let shouldReset = false;
        if (!hasHandSwapAbility(player)) {
            shouldReset = true;
        }
        if (!player.getMainHandItem().isEmpty() || !player.getOffhandItem().isEmpty()) {
            shouldReset = true;
        }
        if (shouldReset) {
            player.setMainArm(originalHandPreference);
            isSwapped = false;
            originalHandPreference = null;
        }
    }
});