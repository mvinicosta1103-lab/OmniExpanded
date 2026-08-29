StartupEvents.registry('palladium:condition_serializer', (event) => {
  event.create('alienevo:current_alien_nickname')
    .addProperty("value", "string", "default", "Nickname value")
    .test((entity, props) => {
      return palladium.getProperty(entity, 'current_alien_nickname') === props.get("value");
    });
});