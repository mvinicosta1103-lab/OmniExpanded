function maxAllAliens(playerName) {
  let server = Utils.server;
  let scoreboard = server.scoreboard;
  let aliensMaxed = 0;

  server.runCommandSilent(`scoreboard objectives add AlienEvo.PrototypeSkillP dummy`);

  let maxAlienId = -1;
  Object.keys(global).forEach(key => {
    if (key.startsWith('alienevo_alien_')) {
      let id = parseInt(key.split('_').pop());
      if (!isNaN(id) && id > maxAlienId) {
        maxAlienId = id;
      }
    }
  });

  for (let i = 0; i <= maxAlienId; i++) {
    let key = `alienevo_alien_${i}`;
    if (global[key] && global[key][0]) {
      let alienFullName = global[key][0];
      let alienNamespace = 'alienevo_aliens';
      let alienPath = alienFullName;

      if (alienFullName.includes(':')) {
        let parts = alienFullName.split(':');
        alienNamespace = parts[0];
        alienPath = parts[1];
      }

      let simpleName = alienPath.charAt(0).toUpperCase() + alienPath.slice(1);

      server.runCommandSilent(`scoreboard objectives add ${simpleName}.Level dummy`);
      server.runCommandSilent(`scoreboard objectives add ${simpleName}.XP dummy`);
      server.runCommandSilent(`scoreboard objectives add ${simpleName}.SkillPoint dummy`);

      let levelObj = scoreboard.getObjective(`${simpleName}.Level`);
      let xpObj = scoreboard.getObjective(`${simpleName}.XP`);
      let skillPointsObj = scoreboard.getObjective(`${simpleName}.SkillPoint`);
      let prototypeObj = scoreboard.getObjective(`AlienEvo.PrototypeSkillP`);

      if (levelObj && xpObj && skillPointsObj && prototypeObj) {
        scoreboard.getOrCreatePlayerScore(playerName, levelObj).setScore(10);
        scoreboard.getOrCreatePlayerScore(playerName, xpObj).setScore(0);

        let currentSkillPoints = scoreboard.getOrCreatePlayerScore(playerName, skillPointsObj).getScore();
        scoreboard.getOrCreatePlayerScore(playerName, skillPointsObj).setScore(currentSkillPoints + 10);

        let currentProtoPoints = scoreboard.getOrCreatePlayerScore(playerName, prototypeObj).getScore();
        scoreboard.getOrCreatePlayerScore(playerName, prototypeObj).setScore(currentProtoPoints + 1);

        aliensMaxed++;
      }
    }
  }

  let player = server.getPlayerList().getPlayerByName(playerName);
  if (player) {
    let maxedMessage = Component.translate("command.maxaliens.alienevo.success", `${aliensMaxed}`).getString();
    player.tell(`§a${maxedMessage}`);
  }

  return aliensMaxed;
}

ServerEvents.commandRegistry(event => {
  let { commands: Commands, arguments: Arguments } = event;

  event.register(
    Commands.literal("maxaliens")
      .requires(src => src.hasPermission(2))
      .then(Commands.argument('player', Arguments.PLAYER.create(event))
        .executes(ctx => {
          let target = Arguments.PLAYER.getResult(ctx, 'player');
          let username = target.getGameProfile().getName();

          let aliensMaxed = maxAllAliens(username);

          return 1;
        })
      )
  );
});

function giveAlienControl(playerName) {
  let server = Utils.server;
  let scoreboard = server.scoreboard;

  server.runCommandSilent(`tag ${playerName} add AlienEvo.MasterControl`);
  server.runCommandSilent(`scoreboard objectives add AlienEvo.Timer dummy`);

  let timerObj = scoreboard.getObjective(`AlienEvo.Timer`);
  if (timerObj) {
    scoreboard.getOrCreatePlayerScore(playerName, timerObj).setScore(0);
  }

  let player = server.getPlayerList().getPlayerByName(playerName);
  if (player) {
    let masterControlSuccess = Component.translate("command.mastercontrol.alienevo.unlock").getString();
    player.tell(`§e${masterControlSuccess}`);
  }

  return 1;
}

ServerEvents.commandRegistry(event => {
  let { commands: Commands, arguments: Arguments } = event;

  event.register(
    Commands.literal("mastercontrol")
      .requires(src => src.hasPermission(2))
      .then(Commands.argument('player', Arguments.PLAYER.create(event))
        .executes(ctx => {
          let target = Arguments.PLAYER.getResult(ctx, 'player');
          let entity = target; 

          // set palladium property
          palladium.setProperty(entity, 'watch_state', "default");

          let username = target.getGameProfile().getName();
          return giveAlienControl(username);
        })
      )
  );
});



ServerEvents.loaded(event => {
  let maxAlienId = -1;
  Object.keys(global).forEach(key => {
    if (key.startsWith('alienevo_alien_')) {
      let id = parseInt(key.split('_').pop());
      if (!isNaN(id) && id > maxAlienId) {
        maxAlienId = id;
      }
    }
  });

  for (let i = 0; i <= maxAlienId; i++) {
    let key = `alienevo_alien_${i}`;
    if (global[key] && global[key][0]) {
      let alienFullName = global[key][0];
      let alienNamespace = 'alienevo_aliens';
      let alienPath = alienFullName;

      if (alienFullName.includes(':')) {
        let parts = alienFullName.split(':');
        alienNamespace = parts[0];
        alienPath = parts[1];
      }

      let simpleName = alienPath.charAt(0).toUpperCase() + alienPath.slice(1);
      let defaultNameKey = `alienevo_default_name_${i}`;

      if (!global[defaultNameKey]) {
        let defaultName = simpleName;

        global[defaultNameKey] = defaultName;

      }
    }
  }

  global.getAlienDisplayName = (player, alienNumber) => {
    if (player && player.persistentData.contains(`alienevo_${alienNumber}`)) {
      return player.persistentData.getString(`alienevo_${alienNumber}`);
    }

    let defaultNameKey = `alienevo_default_name_${alienNumber}`;
    if (global[defaultNameKey]) {
      return global[defaultNameKey];
    }

    let key = `alienevo_alien_${alienNumber}`;
    if (global[key] && global[key][0]) {
      let alienFullName = global[key][0];
      let alienPath = alienFullName;

      if (alienFullName.includes(':')) {
        alienPath = alienFullName.split(':')[1];
      }

      return alienPath.charAt(0).toUpperCase() + alienPath.slice(1);
    }

    return `Alien #${alienNumber}`;
  };
});