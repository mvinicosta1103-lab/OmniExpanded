StartupEvents.registry('palladium:abilities', (event) => {
  event.create('alienevo:omni_properties')
    .icon(palladium.createItemIcon('minecraft:clock'))
    .addProperty("watch", "string", "prototype", "The name of the Omnitrix (e.g., prototype, omnitrix, ultimatrix)")
    .addProperty("watch_namespace", "string", "alienevo", "The namespace for the watch resource location")
    .addProperty("use_timeout_bubble", "boolean", true, "Whether to show the timeout bubble on detransform")
    .addProperty("uniform", "string", "default", "The appearance variant/uniform to apply to transformed aliens")
    .addProperty("badge", "string", "prototype", "Badge to apply to transformed aliens")
    .firstTick((entity, abilityEntry, abilityHolder, isEnabled) => {
      if (!isEnabled || !entity) return;
      
      const watch = abilityEntry.getPropertyByName('watch');
      const watchNamespace = abilityEntry.getPropertyByName('watch_namespace');
      const useTimeoutBubble = abilityEntry.getPropertyByName('use_timeout_bubble');
      
      palladium.setProperty(entity, 'watch', watch);
      palladium.setProperty(entity, 'watch_namespace', watchNamespace);
      palladium.setProperty(entity, 'use_timeout_bubble', useTimeoutBubble);
      
    })
   .lastTick((entity, abilityEntry, abilityHolder, isEnabled) => {
  if (!isEnabled || !entity) return;
      
  let uniform = abilityEntry.getPropertyByName('uniform');
  let badge = abilityEntry.getPropertyByName('badge');

  try {
    let scoreValue = palladium.scoreboard.getScore(entity, "AlienEvo.10kPhase");
    let has10kPhase = scoreValue === 1;
     
    if (has10kPhase) {
      uniform = "10k";
      badge = "10k";
    }
  } catch (e) {
  }

  palladium.setProperty(entity, 'uniform', uniform);
  palladium.setProperty(entity, 'badge', badge);
});
});