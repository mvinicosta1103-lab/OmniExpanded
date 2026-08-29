StartupEvents.registry('palladium:condition_serializer', (event) => {
  event.create('alienevo:watch_type')
    .addProperty("value", "string", "default", "Color to check")
    .test((entity, props) => {
      return palladium.getProperty(entity, 'watch') === props.get("value");
    });
});

StartupEvents.registry('palladium:condition_serializer', (event) => {
  event.create('alienevo:uniform_type')
    .addProperty("value", "string", "default", "Uniform variant to check")
    .test((entity, props) => {
      return palladium.getProperty(entity, 'uniform') === props.get("value");
    });
});

StartupEvents.registry('palladium:condition_serializer', (event) => {
  event.create('alienevo:has_timeout_bubble')
    .addProperty("value", "boolean", false, "Whether entity has timeout bubble enabled")
    .test((entity, props) => {
      return palladium.getProperty(entity, 'use_timeout_bubble') === props.get("value");
    });
});