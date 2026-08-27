package net.rebirth.omniexpanded.item;

import net.minecraft.core.registries.Registries;
import net.minecraft.world.item.Item;
import net.threetag.palladiumcore.registry.DeferredRegister;
import net.threetag.palladiumcore.registry.RegistrySupplier;

/**
 * Segue o mesmo padrão de registro usado pelo AlienEvoItems (DeferredRegister
 * do palladiumcore). Se o seu projeto já tem uma classe de itens (algo tipo
 * OmniExpandedItems em net.rebirth.omniexpanded.item), só copia o campo
 * UPGRADED_OMNITRIX pra ela em vez de criar este arquivo do zero.
 */
public class OmniExpandedItems {

    public static final DeferredRegister<Item> ITEMS =
            DeferredRegister.create("alienevo", Registries.ITEM);

    // stacksTo(1) porque é um dispositivo vestido/segurado, não um item empilhável
    public static final RegistrySupplier<Item> UPGRADED_OMNITRIX = ITEMS.register(
            "upgraded_omnitrix",
            () -> new Item(new Item.Properties().stacksTo(1))
    );

    public static void init() {
        ITEMS.register();
    }
}