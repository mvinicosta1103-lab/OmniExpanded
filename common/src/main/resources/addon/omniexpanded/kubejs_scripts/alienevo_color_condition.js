StartupEvents.registry('palladium:condition_serializer', (event) => {
  event.create('alienevo:color')
    .addProperty("value", "string", "default", "Color to check")
    .test((entity, props) => {
      return palladium.getProperty(entity, 'AlienEvo.Color') === props.get("value");
    });
});