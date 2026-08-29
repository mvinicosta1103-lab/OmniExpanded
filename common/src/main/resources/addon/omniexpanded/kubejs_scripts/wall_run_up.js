StartupEvents.registry('palladium:condition_serializer', (event) => {
  event.create('alienevo:wall_run_up')
    .addProperty("data_name", "string", "wall_run", "Persistent data used")
    .test((entity, props) => {
      let data_name = props.get("data_name")
      return entity.persistentData[data_name] === 2
    })
});