// ServerEvents.commandRegistry(event => {
//   const { commands: Commands, arguments: Arguments } = event;
//   const alienNameMap = {};
//   for (let i = 1; i <= 300; i++) {
//     if (global[`alienevo_alien_${i}`]) {
//       let fullName = global[`alienevo_alien_${i}`][0];
//       let displayName = fullName;

//       if (fullName.includes(':')) {
//         displayName = fullName.split(':')[1];
//       }

//       alienNameMap[displayName] = {
//         fullName: fullName,
//         id: i
//       };
//     }
//   }

//   const alienSuggestionProvider = (context, builder) => {
//     Object.keys(alienNameMap).forEach(displayName => {
//       builder.suggest(displayName);
//     });

//     return builder.buildFuture();
//   };

//   event.register(
//     Commands.literal("alienevonickname")
//       .requires(src => src.hasPermission(0))
//       .then(Commands.argument('alien', Arguments.STRING.create(event))
//         .suggests(alienSuggestionProvider)
//         .then(Commands.argument('custom_name', Arguments.GREEDY_STRING.create(event))
//           .executes(ctx => {
//             let target = ctx.source.getPlayer();
//             const inputAlienName = Arguments.STRING.getResult(ctx, "alien");
//             const customName = Arguments.STRING.getResult(ctx, "custom_name");
//             const alienInfo = alienNameMap[inputAlienName];
//             let alienNumber = -1;
//             let fullAlienName = "";

//             if (alienInfo) {
//               alienNumber = alienInfo.id;
//               fullAlienName = alienInfo.fullName;
//             } else {
//               for (const displayName in alienNameMap) {
//                 if (displayName.toLowerCase() === inputAlienName.toLowerCase()) {
//                   alienNumber = alienNameMap[displayName].id;
//                   fullAlienName = alienNameMap[displayName].fullName;
//                   break;
//                 }
//               }
//             }
//             if (alienNumber === -1) {
//               for (let i = 1; i <= 300; i++) {
//                 if (global[`alienevo_alien_${i}`]) {
//                   const storedName = global[`alienevo_alien_${i}`][0];
//                   if (storedName.toLowerCase() === inputAlienName.toLowerCase()) {
//                     alienNumber = i;
//                     fullAlienName = storedName;
//                     break;
//                   }
//                 }
//               }
//             }
//             if (alienNumber === -1) {
//               ctx.source.sendFailure(Text.of(`Unknown alien: ${inputAlienName}`));
//               return 0;
//             }

//             let previousNickname = target.persistentData.getString(`alienevo_${alienNumber}`);
//             if (!previousNickname) {
//               previousNickname = "None";
//             }
//             target.persistentData.putString(`alienevo_${alienNumber}`, customName);

//             let targetName = target.getGameProfile().getName();
//             let displayAlienName = fullAlienName;
//             if (displayAlienName.includes(':')) {
//               displayAlienName = displayAlienName.split(':')[1];
//             }

//             let formattedAlienName = "";
//             let capitalizeNext = true;

//             for (let i = 0; i < displayAlienName.length; i++) {
//               if (displayAlienName[i] === '_') {
//                 formattedAlienName += " ";
//                 capitalizeNext = true;
//                 continue;
//               }
//               if (capitalizeNext) {
//                 formattedAlienName += displayAlienName[i].toUpperCase();
//                 capitalizeNext = false;
//               } else {
//                 formattedAlienName += displayAlienName[i].toLowerCase();
//               }
//             }
//             if (formattedAlienName.length > 0 && formattedAlienName[0].toLowerCase() === formattedAlienName[0]) {
//               formattedAlienName = formattedAlienName[0].toUpperCase() + formattedAlienName.slice(1);
//             }

//             let previousNicknameTranslated = Component.translate(previousNickname).getString();
//             let successTextNicknameSet = Component.translate("command.nickname.alienevo.nickset").getString();
//             let successTextAlien = Component.translate("command.nickname.alienevo.alien").getString();
//             let successMessage = `§a§l${successTextNicknameSet} §r§b${previousNicknameTranslated} §7→ §e${customName}§7\n§7${successTextAlien} §f${formattedAlienName}`;
//             ctx.source.sendSuccess(Text.of(successMessage), true);

//             target.addTag("alienevo.nickname");

//             target.getServer().scheduleInTicks(2, () => {
//               target.removeTag("alienevo.nickname");
//             });

//             return 1;
//           })
//         )
//       )
//   );
// });


PlayerEvents.loggedIn(event => {
  let target = event.player;

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
      let alienKey = `alienevo_${i}`;

      if (!target.persistentData.contains(alienKey)) {
        let translationKey = `species.alienevo_aliens.${i}`;
        target.persistentData.putString(alienKey, translationKey);
      }
    }
  }
});
