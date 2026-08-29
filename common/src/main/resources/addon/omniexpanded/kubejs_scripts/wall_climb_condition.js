StartupEvents.registry('palladium:condition_serializer', (event) => {
  event.create('alienevo:on_wall')
    .addProperty("data_name", "string", "climb", "Persistent data used")
    .test((entity, props) => {
      let data_name = props.get("data_name")
      return entity.persistentData[data_name] >= 1
    })
});