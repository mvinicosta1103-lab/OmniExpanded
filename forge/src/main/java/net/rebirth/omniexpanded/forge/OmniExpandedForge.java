package net.rebirth.omniexpanded.forge;

import net.rebirth.omniexpanded.OmniExpanded;
import net.minecraftforge.fml.common.Mod;
import net.minecraftforge.fml.javafmlmod.FMLJavaModLoadingContext;
import net.threetag.palladiumcore.forge.PalladiumCoreForge;

@Mod(OmniExpanded.MOD_ID)
public class OmniExpandedForge {

    public OmniExpandedForge() {
        // Submit our event bus to let PalladiumCore register our content on the right time
        PalladiumCoreForge.registerModEventBus(OmniExpanded.MOD_ID, FMLJavaModLoadingContext.get().getModEventBus());
        OmniExpanded.init();
    }
}
