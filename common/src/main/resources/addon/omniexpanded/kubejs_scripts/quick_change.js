if (Platform.isClientEnvironment()) {
    ClientEvents.init(event => {
      const $KeyMappingRegistry = Java.loadClass("dev.architectury.registry.client.keymappings.KeyMappingRegistry");
      const $KeyMapping = Java.loadClass("net.minecraft.client.KeyMapping");
      const $GLFWKey = Java.loadClass("org.lwjgl.glfw.GLFW");

      for (let i = 1; i <= 10; i++) {
        let keyName = `QUICKCHANGE${i.toString().padStart(2, '0')}`;
        global[keyName] = new $KeyMapping(
          `key.alienevo.key${i}`,
          $GLFWKey.GLFW_KEY_UNKNOWN,
          "key.categories.alienevo"
        );
        
        $KeyMappingRegistry.register(global[keyName]);
      }
      
      global["QUICKCHANGEWHEEL"] = new $KeyMapping(
        "key.alienevo.wheel",
        $GLFWKey.GLFW_KEY_UNKNOWN,
        "key.categories.alienevo"
      );
      
      $KeyMappingRegistry.register(global["QUICKCHANGEWHEEL"]);
    })
  }