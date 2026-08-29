StartupEvents.registry('palladium:condition_serializer', (event) => {
  event.create('alienevo:quick_change_wheel')
    .test((entity, props) => {
      const wheelState = palladium.getProperty(entity, 'quick_change_wheel');
      return wheelState === "enabled";
    });
});