ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Arguments } = event;

    const OMNITRIX_PROPERTY_KEY = 'omnitrix_cycle';
    const CURRENT_PLAYLIST_KEY = 'current_playlist';
    const CURRENT_ALIEN_SLOT_KEY = 'current_alien_slot';
    const MAX_ALIEN_SLOTS = 10;

    const alienSuggestionProvider = (context, builder) => {
        const input = context.getInput().split(" ").pop().toLowerCase();
        let aliens = [];

        for (let i = 1; i <= 300; i++) {
            if (global[`alienevo_alien_${i}`]) {
                let alienName = global[`alienevo_alien_${i}`][0];
                aliens.push({
                    name: alienName,
                    id: i,
                    score: alienName.toLowerCase().startsWith(input) ? 0 : 1
                });
            }
        }

        aliens.sort((a, b) => {
            if (a.score !== b.score) return a.score - b.score;
            return a.name.localeCompare(b.name);
        });

        aliens.forEach(alien => {
            builder.suggest(alien.name);
        });

        return builder.buildFuture();
    };

    event.register(
        Commands.literal("alienevoplaylist")
            .requires(src => src.hasPermission(2))
            .then(Commands.argument('entity', Arguments.PLAYER.create(event))
                .then(Commands.argument('playlist', Arguments.INTEGER.create(event))
                    .then(Commands.argument('slot', Arguments.INTEGER.create(event))
                        .then(Commands.argument('alien', Arguments.RESOURCE_LOCATION.create(event))
                            .suggests(alienSuggestionProvider)
                            .executes(ctx => {
                                let target = Arguments.PLAYER.getResult(ctx, 'entity');
                                let server = ctx.source.getServer();
                                let player = ctx.source.player;
                                const playlist = Arguments.INTEGER.getResult(ctx, "playlist");
                                const slot = Arguments.INTEGER.getResult(ctx, "slot");
                                const alienResource = Arguments.RESOURCE_LOCATION.getResult(ctx, "alien");
                                const alienName = alienResource.toString();

                                const namespace = alienResource.getNamespace();
                                const path = alienResource.getPath();

                                if (playlist < 1 || playlist > 10 || slot < 1 || slot > 10) {
                                    ctx.source.sendFailure(Component.translate("command.playlist.alienevo.fail").getString());
                                    return 0;
                                }

                                let alienNumber = -1;
                                for (let i = 1; i <= 300; i++) {
                                    if (global[`alienevo_alien_${i}`] &&
                                        (global[`alienevo_alien_${i}`][0].toLowerCase() === alienName.toLowerCase() ||
                                            global[`alienevo_alien_${i}`][0].toLowerCase() === path.toLowerCase())) {
                                        alienNumber = i;
                                        break;
                                    }
                                }

                                if (alienNumber === -1) {
                                    let translateUnknownAlien = Component.translate("command.playlist.alienevo.unknown_alien").getString();
                                    ctx.source.sendFailure(Text.of(`${translateUnknownAlien} ${alienName}`));
                                    return 0;
                                }

                                let existingPlaylist = null;
                                let existingSlot = null;
                                outerLoop:
                                for (let p = 1; p <= 10; p++) {
                                    for (let s = 1; s <= 10; s++) {
                                        let alienInSlot = target.persistentData.getInt(`alienevo.alien_${p}_${s}`);
                                        if (alienInSlot === alienNumber) {
                                            existingPlaylist = p;
                                            existingSlot = s;
                                            break outerLoop;
                                        }
                                    }
                                }

                                if (existingSlot !== null) {
                                    target.persistentData.putInt(`alienevo.alien_${existingPlaylist}_${existingSlot}`, 0);
                                }

                                target.persistentData.putInt(`alienevo.alien_${playlist}_${slot}`, alienNumber);

                                const currentPlaylist = target.persistentData.getInt(CURRENT_PLAYLIST_KEY) || 1;

                                if (playlist !== currentPlaylist) {
                                    target.persistentData.putInt(CURRENT_PLAYLIST_KEY, playlist);
                                    target.persistentData.putInt(CURRENT_ALIEN_SLOT_KEY, slot);
                                    updateAllSlotProperties(target, playlist);
                                } else {
                                    palladium.setProperty(target, `alien_evo_slot_${slot}`, alienNumber);

                                    if (target.persistentData.getInt(CURRENT_ALIEN_SLOT_KEY) == slot) {
                                        palladium.setProperty(target, OMNITRIX_PROPERTY_KEY, alienNumber);
                                    }
                                }

                                let targetName = target.getGameProfile().getName();
                                let translateAlienSet = Component.translate("command.playlist.alienevo.alienset").getString();
                                let translateID = Component.translate("command.playlist.alienevo.id").getString();
                                let translatePlaylist = Component.translate("command.playlist.alienevo.playlist").getString();
                                let translateSlot = Component.translate("command.playlist.alienevo.slot").getString();
                                let translatePlayer = Component.translate("command.playlist.alienevo.player").getString();
                                let successMessage = `§a§l${translateAlienSet} §r§b${alienName} §7(${translateID} §f${alienNumber}§7)\n§7${translatePlaylist} §f${playlist}§7, ${translateSlot} §f${slot}\n§7${translatePlayer} §f${targetName}`;
                                ctx.source.sendSuccess(Text.of(successMessage), true);

                                return 1;
                            })
                        )
                    )
                )
            )
    );

    function updateAllSlotProperties(entity, playlist) {
        for (let slot = 1; slot <= MAX_ALIEN_SLOTS; slot++) {
            const alienType = entity.persistentData.getInt(`alienevo.alien_${playlist}_${slot}`) || 0;
            palladium.setProperty(entity, `alien_evo_slot_${slot}`, alienType);
        }

        const currentSlot = entity.persistentData.getInt(CURRENT_ALIEN_SLOT_KEY) || 1;
        const currentAlien = entity.persistentData.getInt(`alienevo.alien_${playlist}_${currentSlot}`) || 0;

        palladium.setProperty(entity, OMNITRIX_PROPERTY_KEY, currentAlien);
    }
});

ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Arguments } = event;

    const OMNITRIX_PROPERTY_KEY = 'omnitrix_cycle';
    const CURRENT_PLAYLIST_KEY = 'current_playlist';
    const CURRENT_ALIEN_SLOT_KEY = 'current_alien_slot';

    event.register(
        Commands.literal("alienevorandomize")
            .requires(src => src.hasPermission(2))
            .then(Commands.argument('entity', Arguments.PLAYER.create(event))
                .then(Commands.argument('playlist', Arguments.INTEGER.create(event))
                    .executes(ctx => {
                        let target = Arguments.PLAYER.getResult(ctx, 'entity');
                        const playlist = Arguments.INTEGER.getResult(ctx, "playlist");


                        if (playlist < 1 || playlist > 10) {
                            ctx.source.sendFailure(Component.translate("command.playlist.alienevo.fail").getString());
                            return 0;
                        }

                        let availableAliens = [];

                        let globalKeys = Object.keys(global);
                        for (let key of globalKeys) {
                            if (key.startsWith('alienevo_alien_')) {
                                let idStr = key.replace('alienevo_alien_', '');
                                let id = parseInt(idStr);

                                if (id > 0) {
                                    availableAliens.push(id);
                                }
                            }
                        }

                        if (availableAliens.length === 0) {
                            ctx.source.sendFailure(Component.translate("command.playlist.alienevo.no_aliens").getString());
                            return 0;
                        }

                        for (let i = availableAliens.length - 1; i > 0; i--) {
                            let j;
                            try {
                                j = Math.floor(Math.random() * (i + 1));
                            } catch (e) {
                                j = Math.floor(Math.random() * (i + 1));
                            }
                            [availableAliens[i], availableAliens[j]] = [availableAliens[j], availableAliens[i]];
                        }


                        let uniqueAliensUsed = [];

                        for (let slot = 1; slot <= 10; slot++) {
                            target.persistentData.putInt(`alienevo.alien_${playlist}_${slot}`, 0);
                        }

                        for (let slot = 1; slot <= 10; slot++) {
                            if (availableAliens.length === 0) {
                                break;
                            }

                            let alienNumber = availableAliens[0];

                            target.persistentData.putInt(`alienevo.alien_${playlist}_${slot}`, alienNumber);


                            let alienData = global[`alienevo_alien_${alienNumber}`];
                            let alienName = alienData ? alienData[0] : Component.translate("command.playlist.alienevo.unknown").getString();
                            uniqueAliensUsed.push(`${alienName} (${Component.translate("command.playlist.alienevo.id").getString()} ${alienNumber})`);

                            availableAliens.shift();

                            if (availableAliens.length === 0 && slot < 10) {
                                availableAliens = [];
                                for (let key of globalKeys) {
                                    if (key.startsWith('alienevo_alien_')) {
                                        let idStr = key.replace('alienevo_alien_', '');
                                        let id = parseInt(idStr);
                                        if (id > 0) {
                                            availableAliens.push(id);
                                        }
                                    }
                                }

                                for (let i = availableAliens.length - 1; i > 0; i--) {
                                    const j = Math.floor(Math.random() * (i + 1));
                                    [availableAliens[i], availableAliens[j]] = [availableAliens[j], availableAliens[i]];
                                }
                            }
                        }

                        target.persistentData.putInt(CURRENT_PLAYLIST_KEY, playlist);
                        target.persistentData.putInt(CURRENT_ALIEN_SLOT_KEY, 1);

                        let currentAlienNumber = target.persistentData.getInt(`alienevo.alien_${playlist}_1`);
                        if (currentAlienNumber > 0) {
                            palladium.setProperty(target, OMNITRIX_PROPERTY_KEY, currentAlienNumber);
                        }

                        let targetName = target.getGameProfile().getName();
                        let successMessage = Component.translate("command.playlist.alienevo.playlist_randomized", `${playlist}`, `${targetName}`).getString();

                        if (uniqueAliensUsed.length > 0) {
                            successMessage += `\n§7${Component.translate("command.playlist.alienevo.aliens_in_playlist").getString()} §f${uniqueAliensUsed.join("§7, §f")}`;
                        }

                        ctx.source.sendSuccess(Text.of(successMessage), true);
                        return 1;
                    })
                )
            )
    );
});

ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Arguments } = event;

    const OMNITRIX_PROPERTY_KEY = 'omnitrix_cycle';
    const CURRENT_PLAYLIST_KEY = 'current_playlist';
    const CURRENT_ALIEN_SLOT_KEY = 'current_alien_slot';
    const MAX_ALIEN_SLOTS = 10;

    const alienSuggestionProvider = (context, builder) => {
        const input = context.getInput().split(" ").pop().toLowerCase();
        let aliens = [];

        for (let i = 1; i <= 300; i++) {
            if (global[`alienevo_alien_${i}`]) {
                let alienName = global[`alienevo_alien_${i}`][0];
                aliens.push({
                    name: alienName,
                    id: i,
                    score: alienName.toLowerCase().startsWith(input) ? 0 : 1
                });
            }
        }

        aliens.sort((a, b) => {
            if (a.score !== b.score) return a.score - b.score;
            return a.name.localeCompare(b.name);
        });

        aliens.forEach(alien => {
            builder.suggest(alien.name);
        });

        return builder.buildFuture();
    };

    event.register(
        Commands.literal("alienautoadd")
            .requires(src => src.hasPermission(2))
            .then(Commands.argument('entity', Arguments.PLAYER.create(event))
                .then(Commands.argument('alien', Arguments.RESOURCE_LOCATION.create(event))
                    .suggests(alienSuggestionProvider)
                    .executes(ctx => {
                        let target = Arguments.PLAYER.getResult(ctx, 'entity');
                        const alienResource = Arguments.RESOURCE_LOCATION.getResult(ctx, "alien");
                        const alienName = alienResource.toString();
                        const path = alienResource.getPath();
                        let alienNumber = -1;
                        for (let i = 1; i <= 300; i++) {
                            if (global[`alienevo_alien_${i}`] &&
                                (global[`alienevo_alien_${i}`][0].toLowerCase() === alienName.toLowerCase() ||
                                    global[`alienevo_alien_${i}`][0].toLowerCase() === path.toLowerCase())) {
                                alienNumber = i;
                                break;
                            }
                        }

                        if (alienNumber === -1) {
                            let translateUnknownAlien = Component.translate("command.playlist.alienevo.unknown_alien").getString();
                            ctx.source.sendFailure(Text.of(`${translateUnknownAlien} ${alienName}`));
                            return 0;
                        }

                        let existingPlaylist = null;
                        let existingSlot = null;
                        outerLoop:
                        for (let p = 1; p <= 10; p++) {
                            for (let s = 1; s <= 10; s++) {
                                let alienInSlot = target.persistentData.getInt(`alienevo.alien_${p}_${s}`);
                                if (alienInSlot === alienNumber) {
                                    existingPlaylist = p;
                                    existingSlot = s;
                                    break outerLoop;
                                }
                            }
                        }

                        if (existingSlot !== null) {
                            target.persistentData.putInt(`alienevo.alien_${existingPlaylist}_${existingSlot}`, 0);
                        }
                        let bestPlaylist = -1;
                        let bestSlot = -1;
                        let emptySlotFound = false;

                        for (let p = 1; p <= 10; p++) {
                            for (let s = 1; s <= MAX_ALIEN_SLOTS; s++) {
                                let alienInSlot = target.persistentData.getInt(`alienevo.alien_${p}_${s}`);
                                if (alienInSlot === 0) {
                                    bestPlaylist = p;
                                    bestSlot = s;
                                    emptySlotFound = true;
                                    break;
                                }
                            }
                            if (emptySlotFound) break;
                        }

                        if (!emptySlotFound) {
                            bestPlaylist = 1;
                            bestSlot = 1;
                            ctx.source.sendSuccess(Text.of(Component.translate("command.autoadd.alienevo.fail").getString()), true);
                        }

                        target.persistentData.putInt(`alienevo.alien_${bestPlaylist}_${bestSlot}`, alienNumber);
                        const currentPlaylist = target.persistentData.getInt(CURRENT_PLAYLIST_KEY) || 1;

                        if (bestPlaylist !== currentPlaylist) {
                            target.persistentData.putInt(CURRENT_PLAYLIST_KEY, bestPlaylist);
                            target.persistentData.putInt(CURRENT_ALIEN_SLOT_KEY, bestSlot);
                            updateAllSlotProperties(target, bestPlaylist);
                        } else {
                            palladium.setProperty(target, `alien_evo_slot_${bestSlot}`, alienNumber);

                            if (target.persistentData.getInt(CURRENT_ALIEN_SLOT_KEY) == bestSlot) {
                                palladium.setProperty(target, OMNITRIX_PROPERTY_KEY, alienNumber);
                            }
                        }

                        let targetName = target.getGameProfile().getName();
                        let translateAlienAdded = Component.translate("command.autoadd.alienevo.alien_added").getString();
                        let translateID = Component.translate("command.playlist.alienevo.id").getString();
                        let translateAssigned = Component.translate("command.autoadd.alienevo.assigned").getString();
                        let translateSlot = Component.translate("command.playlist.alienevo.slot").getString();
                        let translatePlayer = Component.translate("command.playlist.alienevo.player").getString();
                        let successMessage = `§a§l${translateAlienAdded} §r§b${alienName} §7(${translateID} §f${alienNumber}§7)\n§7${translateAssigned} §f${bestPlaylist}§7, ${translateSlot} §f${bestSlot}\n§7${translatePlayer} §f${targetName}`;
                        ctx.source.sendSuccess(Text.of(successMessage), true);

                        return 1;
                    })
                )
            )
    );

    function updateAllSlotProperties(entity, playlist) {
        for (let slot = 1; slot <= MAX_ALIEN_SLOTS; slot++) {
            const alienType = entity.persistentData.getInt(`alienevo.alien_${playlist}_${slot}`) || 0;
            palladium.setProperty(entity, `alien_evo_slot_${slot}`, alienType);
        }

        const currentSlot = entity.persistentData.getInt(CURRENT_ALIEN_SLOT_KEY) || 1;
        const currentAlien = entity.persistentData.getInt(`alienevo.alien_${playlist}_${currentSlot}`) || 0;
        palladium.setProperty(entity, OMNITRIX_PROPERTY_KEY, currentAlien);
    }
});

ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Arguments } = event;

    const OMNITRIX_PROPERTY_KEY = 'omnitrix_cycle';
    const CURRENT_PLAYLIST_KEY = 'current_playlist';
    const CURRENT_ALIEN_SLOT_KEY = 'current_alien_slot';
    const MAX_ALIEN_SLOTS = 10;
    const MAX_PLAYLISTS = 10;

    event.register(
        Commands.literal("alienremoveall")
            .requires(src => src.hasPermission(2))
            .then(Commands.argument('entity', Arguments.PLAYER.create(event))
                .executes(ctx => {
                    let target = Arguments.PLAYER.getResult(ctx, 'entity');
                    let alienCount = 0;

                    for (let p = 1; p <= MAX_PLAYLISTS; p++) {
                        for (let s = 1; s <= MAX_ALIEN_SLOTS; s++) {
                            let alienInSlot = target.persistentData.getInt(`alienevo.alien_${p}_${s}`);
                            if (alienInSlot !== 0) {
                                alienCount++;
                                target.persistentData.putInt(`alienevo.alien_${p}_${s}`, 0);
                            }
                        }
                    }

                    const currentPlaylist = target.persistentData.getInt(CURRENT_PLAYLIST_KEY) || 1;

                    for (let slot = 1; slot <= MAX_ALIEN_SLOTS; slot++) {
                        palladium.setProperty(target, `alien_evo_slot_${slot}`, 0);
                    }

                    palladium.setProperty(target, OMNITRIX_PROPERTY_KEY, 0);
                    target.persistentData.putInt(CURRENT_ALIEN_SLOT_KEY, 1);

                    let targetName = target.getGameProfile().getName();
                    let translateRemoveSuccess = Component.translate(`command.removeall.alienevo.success`, `${alienCount}`).getString();
                    let translatePlayer = Component.translate("command.playlist.alienevo.player").getString();
                    let successMessage = `${translateRemoveSuccess}\n§7${translatePlayer} §f${targetName}`;
                    ctx.source.sendSuccess(Text.of(successMessage), true);

                    return alienCount;
                })
            )
    );
});

ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Arguments } = event;
    event.register(
        Commands.literal("setuniform")
            .requires(src => src.hasPermission(2))
            .then(Commands.argument('entity', Arguments.PLAYER.create(event))
                .then(Commands.argument('uniform', Arguments.STRING.create(event))
                    .executes(ctx => {
                        let target = Arguments.PLAYER.getResult(ctx, 'entity');
                        let uniformValue = Arguments.STRING.getResult(ctx, 'uniform');

                        palladium.setProperty(target, 'uniform', uniformValue);

                        let targetName = target.getGameProfile().getName();
                        let translateUniformSuccess = Component.translate(`command.setuniform.alienevo.success`, `${uniformValue}`).getString();
                        let translatePlayer = Component.translate("command.playlist.alienevo.player").getString();
                        let successMessage = `${translateUniformSuccess}\n§7${translatePlayer} §f${targetName}`;
                        ctx.source.sendSuccess(Text.of(successMessage), true);

                        return 1;
                    })
                )
            )
    );
});