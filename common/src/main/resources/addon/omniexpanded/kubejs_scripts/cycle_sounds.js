// Helper function for random number generation
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

StartupEvents.registry('palladium:abilities', (event) => {
    event.create('alienevo:omnitrix_cycle_sounds')
        .icon(palladium.createItemIcon('minecraft:note_block'))
        .addProperty("use_multiple_sounds", "boolean", true, "Whether to randomize between multiple cycling sounds")
        .addProperty("cycle_sound", "string", "prototype_cycle_1", "The primary sound to play when cycling")
        .addProperty("alt_sound_1", "string", "prototype_cycle_2", "First alternative cycling sound")
        .addProperty("alt_sound_2", "string", "prototype_cycle_3", "Second alternative cycling sound")
        .addProperty("alt_sound_3", "string", "prototype_cycle_4", "Third alternative cycling sound")
        .addProperty("sound_volume", "float", 1.0, "Volume for cycling sounds (0.0 to 1.0)")
        .addProperty("sound_pitch", "float", 1.0, "Pitch for cycling sounds (0.5 to 2.0)")
        .tick((entity, abilityEntry, abilityHolder, isEnabled) => {
            if (isEnabled && entity) {
                playCycleSound(entity, abilityEntry);
            }
        });

    function playCycleSound(entity, abilityEntry) {
        const useMultipleSounds = abilityEntry.getPropertyByName('use_multiple_sounds');
        const soundVolume = abilityEntry.getPropertyByName('sound_volume');
        const soundPitch = abilityEntry.getPropertyByName('sound_pitch');
        
        let soundToPlay;
        
        if (useMultipleSounds) {
            const primarySound = abilityEntry.getPropertyByName('cycle_sound');
            const altSound1 = abilityEntry.getPropertyByName('alt_sound_1');
            const altSound2 = abilityEntry.getPropertyByName('alt_sound_2');
            const altSound3 = abilityEntry.getPropertyByName('alt_sound_3');
            
            const soundChoice = getRandomInt(1, 4);
            
            switch (soundChoice) {
                case 1:
                    soundToPlay = primarySound;
                    break;
                case 2:
                    soundToPlay = altSound1;
                    break;
                case 3:
                    soundToPlay = altSound2;
                    break;
                case 4:
                    soundToPlay = altSound3;
                    break;
                default:
                    soundToPlay = primarySound;
            }
        } else {
            soundToPlay = abilityEntry.getPropertyByName('cycle_sound');
        }
        
        entity.level.playSound(
            null,
            entity.x,
            entity.y,
            entity.z,
            `alienevo:${soundToPlay}`,
            entity.getSoundSource(),
            soundVolume,
            soundPitch
        );
    }
});