NetworkEvents.dataReceived('AlienEvo.isJumping', (event) => {
    let entity = event.entity;
    palladium.scoreboard.setScore(entity, 'AlienEvo.Jump', 1)
});

NetworkEvents.dataReceived('AlienEvo.notJumping', (event) => {
    let entity = event.entity;
    palladium.scoreboard.setScore(entity, 'AlienEvo.Jump', 0)
});

NetworkEvents.dataReceived('saveBeamColorData', event => {
    let player = event.player;
    let data = event.data;
    let colorValue = data.value;
    
    palladium.setProperty(player, 'galvanic_mechamorph_beam_color', colorValue);
});

NetworkEvents.dataReceived('saveEnergyColorData', event => {
    let player = event.player;
    let data = event.data;
    let energyColor = data.value;
    
    let currentAlienNumber = palladium.getProperty(player, 'omnitrix_cycle');
    let alienInfo = global['alienevo_alien_' + currentAlienNumber];
    if (alienInfo && alienInfo[0]) {
        let alienFullName = alienInfo[0];
        let alienName = alienFullName.includes(':') ? alienFullName.split(':')[1] : alienFullName;
        palladium.setProperty(player, `${alienName}_energy_color`, energyColor);
    }
});

NetworkEvents.dataReceived('savePaletteData', (event) => {
    let player = event.entity;
    let propertiesToSave = event.data;

    for (let propertyName in propertiesToSave) {
        palladium.setProperty(player, propertyName, propertiesToSave[propertyName]);
    }

});

NetworkEvents.dataReceived('alienevo_nickname', (event) => {
    let player = event.entity;
    let inputText = event.data.nickname;

    let currentAlienNumber = palladium.getProperty(player, 'omnitrix_cycle');
    player.persistentData.putString(`alienevo_${currentAlienNumber}`, inputText);
    palladium.setProperty(player, 'current_alien_nickname', inputText);

    player.addTag("alienevo.nickname");
    player.getServer().scheduleInTicks(2, () => {
        player.removeTag("alienevo.nickname");
    });

});


