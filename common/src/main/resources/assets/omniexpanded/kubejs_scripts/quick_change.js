let wasKeyDown = {};
let activeKey = null;
let keysCurrentlyPressed = 0;

ClientEvents.tick(event => {
    let player = Client.player;
    if (!player || Client.currentScreen) return;

    let timerValue = palladium.scoreboard.getScore(player, "AlienEvo.Timer");
    if (timerValue > 0) return;

    const quickChangeKeys = [
        "QUICKCHANGE01", "QUICKCHANGE02", "QUICKCHANGE03", "QUICKCHANGE04", "QUICKCHANGE05",
        "QUICKCHANGE06", "QUICKCHANGE07", "QUICKCHANGE08", "QUICKCHANGE09", "QUICKCHANGE10"
    ];

    let currentlyPressedCount = 0;
    quickChangeKeys.forEach(keyName => {
        let key = global[keyName];
        if (!key) return;

        let bind = key.key.getValue();
        if (bind !== -1 && Client.isKeyDown(bind)) {
            currentlyPressedCount++;
        }
    });

    if (currentlyPressedCount === 0) {
        activeKey = null;
    }

    if (currentlyPressedCount === 1 && (activeKey === null || keysCurrentlyPressed !== currentlyPressedCount)) {
        quickChangeKeys.forEach(keyName => {
            let key = global[keyName];
            if (!key) return;

            let bind = key.key.getValue();

            if (bind !== -1) {
                let down = Client.isKeyDown(bind);

                if (down && !wasKeyDown[keyName] && activeKey === null) {
                    player.sendData('quickchange_key_pressed', { keyName: keyName });
                    activeKey = keyName;
                }

                wasKeyDown[keyName] = down;
            }
        });
    } else {
        quickChangeKeys.forEach(keyName => {
            let key = global[keyName];
            if (!key) return;

            let bind = key.key.getValue();
            if (bind !== -1) {
                wasKeyDown[keyName] = Client.isKeyDown(bind);
            }
        });
    }

    keysCurrentlyPressed = currentlyPressedCount;
});

let wheelKeyWasDown = false;

ClientEvents.tick(event => {
   let player = Client.player;
   if (!player || Client.currentScreen) return;

   // Check if watch_state is "default", if not, don't allow wheel
   let watchState = palladium.getProperty(player, 'watch_state') || "default";
   if (watchState !== "default") return;

   let wheelKey = global["QUICKCHANGEWHEEL"];
   if (!wheelKey) return;

   let bind = wheelKey.key.getValue();
   if (bind === -1) return;

   let down = Client.isKeyDown(bind);

   if (down && !wheelKeyWasDown) {
       player.sendData('quickchange_wheel_pressed', {});
   }

   wheelKeyWasDown = down;
});