ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Arguments } = event;
    
    const SIL_COLOR_PROPERTY_KEY = 'sil_color';
    
    function isValidHexColor(hexColor) {
        const hexRegex = /^#?([0-9A-Fa-f]{6})$/;
        return hexRegex.test(hexColor);
    }
    
    function formatHexColor(hexColor) {
        hexColor = hexColor.toLowerCase();
        if (hexColor.startsWith('#')) {
            return hexColor.substring(1);
        }
        return hexColor;
    }
    
    event.register(
        Commands.literal("silcolor")
        .requires(src => src.hasPermission(0))
        .then(Commands.argument('hexColor', Arguments.STRING.create(event))
            .executes(ctx => {
                let target = ctx.source.getPlayer();
                
                if (!target) {
                    ctx.source.sendFailure(Component.translate("command.silcolor.alienevo.fail_player").getString());
                    return 0;
                }
                
                let hexColor = Arguments.STRING.getResult(ctx, 'hexColor');
                
                if (!isValidHexColor(hexColor)) {
                    ctx.source.sendFailure(Component.translate("command.silcolor.alienevo.fail_color").getString());
                    return 0;
                }
                
                hexColor = formatHexColor(hexColor);
                
                palladium.setProperty(target, SIL_COLOR_PROPERTY_KEY, hexColor);
                
                let successMessage = `§a§l${Component.translate("command.silcolor.alienevo.success").getString()} §r${hexColor}`;
                target.tell(Text.of(successMessage));
                
                return 1;
            })
        )
    );
});
