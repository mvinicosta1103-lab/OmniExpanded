StartupEvents.registry('palladium:condition_serializer', (event) => {
    event.create('alienevo:is_alien')
      .test((entity, props) => {
        // Get the current alien number from omnitrix_cycle property
        let currentAlienNumber = palladium.getProperty(entity, 'omnitrix_cycle');
        
        // If not transformed (no alien number or 0), return false
        if (!currentAlienNumber || currentAlienNumber <= 0) {
          return false;
        }
        
        let alienInfo = global[`alienevo_alien_${currentAlienNumber}`];
        if (!alienInfo) return false;
        
        let alienFullName = alienInfo[0];
        let alienNamespace = 'alienevo_aliens';
        let alienPath = alienFullName;
        
        if (alienFullName.includes(':')) {
          const parts = alienFullName.split(':');
          alienNamespace = parts[0];
          alienPath = parts[1];
        }
        
        const powerName = `${alienNamespace}:${alienPath}`;
        
        return abilityUtil.hasPower(entity, powerName);
      });
  });