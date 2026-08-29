
function toJsString(v){ if(v===null||v===undefined) return null; try { return String(v); } catch(e){ return null; } }
function normalizeHex6(s){
  s = toJsString(s);
  if(!s) return null;
  s = s.trim();
  if (s.charAt(0) === '#') s = s.substring(1);
  return /^[0-9a-fA-F]{6}$/.test(s) ? s.toLowerCase() : null;
}
function normalizeRgbCsv(s){
  s = toJsString(s);
  if(!s) return null;
  var m = s.trim().match(/^(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})$/);
  if(!m) return null;
  function clamp(n){ n = parseInt(n,10); if(isNaN(n)) n=0; return Math.max(0, Math.min(255, n)); }
  var r = clamp(m[1]), g = clamp(m[2]), b = clamp(m[3]);
  return r + ',' + g + ',' + b;
}
function getWatchPrefixFromBench(){ return 'prototype'; } 


function resetWatchGlowDefaultsOnEntity(entity, prefix){
  palladium.setProperty(entity, prefix + '_glow_color_base', '0,0,0');
  palladium.setProperty(entity, prefix + '_glow_color_1', 'b3ff40');
  palladium.setProperty(entity, prefix + '_glow_color_2', 'a7f72e');
  palladium.setProperty(entity, prefix + '_glow_color_3', '8ed721');
  palladium.setProperty(entity, prefix + '_glow_color_4', '77b81a');
  palladium.setProperty(entity, prefix + '_glow_color_5', '639d11');
}
function resetUniformGlowDefaultsOnEntity(entity){
  palladium.setProperty(entity, 'uniform_glow_color_base', '0,0,0');
  palladium.setProperty(entity, 'uniform_glow_color_1', 'ffffff');
  palladium.setProperty(entity, 'uniform_glow_color_2', 'eaeaea');
  palladium.setProperty(entity, 'uniform_glow_color_3', 'cfcfdd');
  palladium.setProperty(entity, 'uniform_glow_color_4', 'b9b7cd');
  palladium.setProperty(entity, 'uniform_glow_color_5', '9f9cb6');
}

function applyCodexGlowDefaultsForWatch(entity, watchPrefix) {
  var DEF_RE = /^alienevo_(\d+)_([^]+?)_glowcolor_(\d+)(.*)$/;

  var hasExplicit = {};
  Object.keys(global).forEach(function (key) {
    var m = key.match(DEF_RE);
    if (!m) return;
    var alienId = m[1], variation = m[2], glowId = m[3], suffix = m[4] || '';
    if (variation === watchPrefix) {
      hasExplicit[alienId + '|' + glowId + '|' + suffix] = true;
    }
  });

  Object.keys(global).forEach(function (key) {
    var m = key.match(DEF_RE);
    if (!m) return;

    var alienId = m[1];
    var variation = m[2];
    var glowId = m[3];
    var suffix = m[4] || '';
    var arr = global[key];
    if (!Array.isArray(arr)) return;

    var combo = alienId + '|' + glowId + '|' + suffix;
    var useThis = (variation === watchPrefix) || (variation === 'default' && !hasExplicit[combo]);
    if (!useThis) return;

    var info = global['alienevo_alien_' + alienId];
    if (!info || !info[0]) return;
    var full = String(info[0]);
    var alienName = (full.indexOf(':') !== -1) ? full.split(':')[1] : full;

    var resolvedVariation = (variation === 'default' && hasExplicit[combo]) ? watchPrefix : variation;
    var prefix = alienName + '_' + resolvedVariation + '_glowcolor_' + glowId + suffix;

    for (var i = 0; i < arr.length; i++) {
      var hex = normalizeHex6(arr[i]);
      if (hex) palladium.setProperty(entity, prefix + '_color_' + (i + 1), hex);
    }
    palladium.setProperty(entity, prefix + '_base', '0,0,0');
  });
}

function collectAndResetGeneratedAlienGlowProps(entity) {
  var result = {};
  var GLOW_DEF_RE = /^alienevo_(\d+)_([^]+?)_glowcolor_(\d+)(.*)$/;

  Object.keys(global).forEach(function (key) {
    var m = key.match(GLOW_DEF_RE);
    if (!m) return;

    var alienId = m[1];
    var variationName = m[2];
    var glowId = m[3];
    var suffix = m[4] || '';
    var defArray = global[key];
    if (!Array.isArray(defArray)) return;

    var info = global['alienevo_alien_' + alienId];
    if (!info || !info[0]) return;
    var full = String(info[0]);
    var alienName = (full.indexOf(':') !== -1) ? full.split(':')[1] : full;

    var prefix = alienName + '_' + variationName + '_glowcolor_' + glowId + (suffix || '');

    var baseKey = prefix + '_base';
    var baseVal = normalizeRgbCsv(palladium.getProperty(entity, baseKey));
    var storedColors = [];
    for (var i = 0; i < defArray.length; i++) {
      var colorKey = prefix + '_color_' + (i + 1);
      storedColors.push(normalizeHex6(palladium.getProperty(entity, colorKey)));
    }
    if (baseVal || storedColors.some(function(c){return !!c;})) {
      result[prefix] = { base: baseVal, colors: storedColors };
    }

    var explicitDefaultKey = 'alienevo_' + alienId + '_default_glowcolor_' + glowId;
    var defaultArr = Array.isArray(global[explicitDefaultKey]) ? global[explicitDefaultKey] : defArray;

    for (var j = 0; j < defaultArr.length; j++) {
      var defColor = normalizeHex6(defaultArr[j]);
      if (defColor) palladium.setProperty(entity, prefix + '_color_' + (j + 1), defColor);
    }
    palladium.setProperty(entity, baseKey, '0,0,0');
  });

  return result;
}

function restoreGeneratedAlienGlowProps(entity, stored) {
  if (!stored || typeof stored !== 'object') return;
  Object.keys(stored).forEach(function (prefix) {
    var bundle = stored[prefix];
    if (!bundle) return;
    if (typeof bundle.base === 'string') {
      var baseVal = normalizeRgbCsv(bundle.base);
      if (baseVal) palladium.setProperty(entity, prefix + '_base', baseVal);
    }
    if (Array.isArray(bundle.colors)) {
      for (var i = 0; i < bundle.colors.length; i++) {
        var hex = normalizeHex6(bundle.colors[i]);
        if (hex) palladium.setProperty(entity, prefix + '_color_' + (i + 1), hex);
      }
    }
  });
}



BlockEvents.placed('alienevo:omnitrix_workbench', event => {
  let pos = event.block.pos;
  let yaw = event.player.yaw;

  let adjustedYaw = yaw + 180;
  if (adjustedYaw > 180) adjustedYaw -= 360;

  if (adjustedYaw >= -135 && adjustedYaw < -45) {
    adjustedYaw = -90; // East
  } else if (adjustedYaw >= -45 && adjustedYaw < 45) {
    adjustedYaw = 0; // South
  } else if (adjustedYaw >= 45 && adjustedYaw < 135) {
    adjustedYaw = 90; // West
  } else {
    adjustedYaw = 180; // North
  }

  event.server.runCommandSilent(
    `summon minecraft:armor_stand ${pos.x + 0} ${pos.y} ${pos.z + 0} {Rotation:[${adjustedYaw}f,0f],Tags:["workbench_stand"],Marker:1b,Invisible:1,NoGravity:1b}`
  );
});


BlockEvents.broken('alienevo:omnitrix_workbench', event => {
  let pos = event.block.pos;
  let username = event.player.getGameProfile().getName();

  function getArmorStandScore(scoreName) {
    let cmd = `scoreboard players get @e[type=armor_stand,tag=workbench_stand,sort=nearest,limit=1] ${scoreName}`;
    let scoreResult = event.server.runCommandSilent(`execute positioned ${pos.x} ${pos.y} ${pos.z} run ${cmd}`);
    return isNaN(scoreResult) ? null : parseInt(scoreResult);
  }

  let hasWorkbenchPower = event.server.runCommandSilent(
    `execute as ${username} positioned ${pos.x} ${pos.y} ${pos.z} if entity @e[type=minecraft:armor_stand,tag=workbench_stand,sort=nearest,limit=1,distance=..0.8,palladium.power=alienevo:omnitrix_workbench]`
  );

  if (hasWorkbenchPower) {
    let scores = {
      uniformOSMain: getArmorStandScore('AlienEvo.UniformOSMain') ?? 0,
      uniformOSSecondary: getArmorStandScore('AlienEvo.UniformOSSecondary') ?? 0,
      phase10k: getArmorStandScore('AlienEvo.10kPhase') ?? 0,
      stage10k: getArmorStandScore('AlienEvo.10kStage') ?? 0,
      basePrimary: getArmorStandScore('AlienEvo.BasePrimary') ?? -1,
      baseSecondary: getArmorStandScore('AlienEvo.BaseSecondary') ?? -1,
      baseTertiary: getArmorStandScore('AlienEvo.BaseTertiary') ?? -1,
      buttons: getArmorStandScore('AlienEvo.Buttons') ?? -1,
      coreSide: getArmorStandScore('AlienEvo.CoreSide') ?? -1,
      coreTop: getArmorStandScore('AlienEvo.CoreTop') ?? -1,
      dialOuter: getArmorStandScore('AlienEvo.DialOuter') ?? -1,
      dialInner: getArmorStandScore('AlienEvo.DialInner') ?? -1,
      tubes: getArmorStandScore('AlienEvo.Tubes') ?? -1,
      codePosition: getArmorStandScore('code_position') ?? 0
    };


    let getArmorStandProperty = (propName, defaultValue) => {
      try {
        event.server.runCommandSilent(
          `execute positioned ${pos.x} ${pos.y} ${pos.z} run tag @e[type=armor_stand,tag=workbench_stand,sort=nearest,limit=1] add prop_target`
        );

        let armorStand = null;
        try {
          if (event.level && typeof event.level.getEntities === 'function') {
            let entities = event.level.getEntities();
            for (let entity of entities) {
              if (entity.getTags().contains('prop_target')) {
                armorStand = entity;
                break;
              }
            }
          }
          if (armorStand) {
            let propValue = palladium.getProperty(armorStand, propName);
            event.server.runCommandSilent(`tag @e[tag=prop_target] remove prop_target`);
            return (propValue ?? defaultValue);
          }
        } catch (e) {}
        event.server.runCommandSilent(`tag @e[tag=prop_target] remove prop_target`);
        return defaultValue;
      } catch (e) { return defaultValue; }
    };

    // Read core + glow properties from stand
    let properties = {
      omnitrixCycle: getArmorStandProperty('omnitrix_cycle', '1'),
      code: getArmorStandProperty('code', '000000'),

      // UNIFORM glow
      uniformGlowBase: getArmorStandProperty('uniform_glow_color_base', "0,0,0"),
      uniformGlow1:   getArmorStandProperty('uniform_glow_color_1', "ffffff"),
      uniformGlow2:   getArmorStandProperty('uniform_glow_color_2', "eaeaea"),
      uniformGlow3:   getArmorStandProperty('uniform_glow_color_3', "cfcfdd"),
      uniformGlow4:   getArmorStandProperty('uniform_glow_color_4', "b9b7cd"),
      uniformGlow5:   getArmorStandProperty('uniform_glow_color_5', "9f9cb6"),

      // WATCH (prototype) glow
      prototypeGlowBase: getArmorStandProperty('prototype_glow_color_base', "0,0,0"),
      prototypeGlow1:    getArmorStandProperty('prototype_glow_color_1', "b3ff40"),
      prototypeGlow2:    getArmorStandProperty('prototype_glow_color_2', "a7f72e"),
      prototypeGlow3:    getArmorStandProperty('prototype_glow_color_3', "8ed721"),
      prototypeGlow4:    getArmorStandProperty('prototype_glow_color_4', "77b81a"),
      prototypeGlow5:    getArmorStandProperty('prototype_glow_color_5', "639d11")
    };

    let hasMasterControl = event.server.runCommandSilent(
      `execute as ${username} positioned ${pos.x} ${pos.y} ${pos.z} if entity @e[type=armor_stand,tag=workbench_stand,sort=nearest,limit=1,tag=AlienEvo.MasterControl]`
    );
    let hasGlowingEyes = event.server.runCommandSilent(
      `execute as ${username} positioned ${pos.x} ${pos.y} ${pos.z} if entity @e[type=armor_stand,tag=workbench_stand,sort=nearest,limit=1,tag=AlienEvo.GlowingEyes]`
    );
    let hasMainUniform = event.server.runCommandSilent(
      `execute as ${username} positioned ${pos.x} ${pos.y} ${pos.z} if entity @e[type=armor_stand,tag=workbench_stand,sort=nearest,limit=1,tag=AlienEvo.MainUniform]`
    );
    let hasSecondaryUniform = event.server.runCommandSilent(
      `execute as ${username} positioned ${pos.x} ${pos.y} ${pos.z} if entity @e[type=armor_stand,tag=workbench_stand,sort=nearest,limit=1,tag=AlienEvo.SecondaryUniform]`
    );

    let allDNA = {};
    let storedAlienCount = 0;
    let alienNamespaceData = "{}";

    let omnitrixEntity = event.level.getEntitiesWithin(AABB.of(pos.x, pos.y, pos.z, pos.x + 1, pos.y + 2, pos.z + 1))
      .find(entity => entity.type === 'minecraft:interaction' && entity.getTags().contains('omnitrix_interaction'));

    if (omnitrixEntity) {
      for (let playlist = 1; playlist <= 10; playlist++) {
        allDNA[playlist] = {};
        for (let slot = 1; slot <= 10; slot++) {
          let dnaKey = `alienevo.alien_${playlist}_${slot}`;
          let alienId = omnitrixEntity.persistentData.getInt(dnaKey);
          if (alienId > 0) {
            allDNA[playlist][slot] = { alienId: alienId, alienName: getAlienName(alienId) };
            storedAlienCount++;
          }
        }
      }

      if (omnitrixEntity.persistentData.contains('storedAlienNamespaces')) {
        alienNamespaceData = omnitrixEntity.persistentData.getString('storedAlienNamespaces');
      }

      let currentPlaylist = omnitrixEntity.persistentData.getInt('current_playlist') || 1;
      let currentAlienSlot = omnitrixEntity.persistentData.getInt('current_alien_slot') || 1;

      let codeData = {
        code: omnitrixEntity.persistentData.getString('code') || properties.code || '000000',
        position: omnitrixEntity.persistentData.getString('position') || String(scores.codePosition || '0'),
        masterTargetCode: omnitrixEntity.persistentData.getString('masterTargetCode') || '',
        selfDestructTargetCode: omnitrixEntity.persistentData.getString('selfDestructTargetCode') || ''
      };

      let storedItemName = omnitrixEntity.persistentData.getString('storedItemName');

      let benchStand = null;
      try {
        let ents = event.level.getEntities();
        for (let e of ents) {
          if (e.getTags().contains('workbench_stand')) { benchStand = e; break; }
        }
      } catch (e) {}
      let storedAlienGlowProps = {};
      if (benchStand) {
        palladium.setProperty(benchStand, 'watch', getWatchPrefixFromBench());
        storedAlienGlowProps = collectAndResetGeneratedAlienGlowProps(benchStand) || {};
      }

      let nbtData = {
        storedUniformOSMainScore: scores.uniformOSMain,
        storedUniformOSSecondaryScore: scores.uniformOSSecondary,
        stored10kPhaseScore: scores.phase10k,
        stored10kStageScore: scores.stage10k,
        storedBasePrimaryScore: scores.basePrimary,
        storedBaseSecondaryScore: scores.baseSecondary,
        storedBaseTertiaryScore: scores.baseTertiary,
        storedButtonsScore: scores.buttons,
        storedCoreSideScore: scores.coreSide,
        storedCoreTopScore: scores.coreTop,
        storedDialOuterScore: scores.dialOuter,
        storedDialInnerScore: scores.dialInner,
        storedTubesScore: scores.tubes,

        storedAllDNA: JSON.stringify(allDNA),
        storedAlienCount: storedAlienCount,
        storedAlienNamespaces: alienNamespaceData,

        storedCurrentPlaylist: currentPlaylist,
        storedCurrentAlienSlot: currentAlienSlot,

        storedMastercontrol: hasMasterControl ? 1 : 0,
        storedGlowingEyes: hasGlowingEyes ? 1 : 0,
        storedMainUniform: hasMainUniform ? 1 : 0,
        storedSecondaryUniform: hasSecondaryUniform ? 1 : 0,

        // Core props
        storedOmnitrixCycle: properties.omnitrixCycle,
        storedCode: codeData.code,
        storedPosition: codeData.position,
        storedMasterTargetCode: codeData.masterTargetCode,
        storedSelfDestructTargetCode: codeData.selfDestructTargetCode,

        // UNIFORM glow
        storedUniformGlowColorBase: properties.uniformGlowBase,
        storedUniformGlowColor1: properties.uniformGlow1,
        storedUniformGlowColor2: properties.uniformGlow2,
        storedUniformGlowColor3: properties.uniformGlow3,
        storedUniformGlowColor4: properties.uniformGlow4,
        storedUniformGlowColor5: properties.uniformGlow5,

        // WATCH (prototype) glow
        storedGlowColorBase: properties.prototypeGlowBase,
        storedGlowColor1: properties.prototypeGlow1,
        storedGlowColor2: properties.prototypeGlow2,
        storedGlowColor3: properties.prototypeGlow3,
        storedGlowColor4: properties.prototypeGlow4,
        storedGlowColor5: properties.prototypeGlow5,

        storedAlienGlowProps: JSON.stringify(storedAlienGlowProps),

        storedWatch: getWatchPrefixFromBench()
      };

      if (storedItemName) nbtData.display = { Name: storedItemName };

      let omnitrixId = getPrototypeOmnitrixItem(scores.phase10k, scores.stage10k);

      event.server.runCommandSilent(
        `execute as ${username} positioned ${pos.x + 0.5} ${pos.y + 0.5} ${pos.z + 0.5} run summon minecraft:item ~ ~ ~ {Item:{id:"${omnitrixId}",Count:1b,tag:${JSON.stringify(nbtData)}},PickupDelay:10,Motion:[0.0,0.2,0.0]}`
      );
    }
  }

  event.server.runCommandSilent(
    `execute as ${username} positioned ${pos.x} ${pos.y} ${pos.z} run kill @e[type=minecraft:armor_stand,tag=workbench_stand,sort=nearest,limit=1]`
  );

  const interactionTags = [
    'baseprimary_interaction','basesecondary_interaction','basetertiary_interaction',
    'coreside_interaction','coretop_interaction','tubes_interaction',
    'dialinner_interaction','dialouter_interaction','buttons_interaction','omnitrix_interaction'
  ];
  interactionTags.forEach(tag => {
    event.server.runCommandSilent(
      `execute as ${username} positioned ${pos.x} ${pos.y} ${pos.z} run kill @e[type=minecraft:interaction,tag=${tag},sort=nearest,limit=1]`
    );
  });
});


BlockEvents.placed('alienevo:omnitrix_workbench', event => {
  let pos = event.block.pos;
  let blockStateStr = event.block.blockState.toString();
  let direction = 'south';
  let username = event.player.getGameProfile().getName();

  if (blockStateStr.includes('facing=north')) direction = 'north';
  else if (blockStateStr.includes('facing=east')) direction = 'east';
  else if (blockStateStr.includes('facing=west')) direction = 'west';

  function rotate(dx, dz, facing) {
    let dx_new, dz_new;
    if (facing === 'north') { dx_new = dx; dz_new = dz; }
    else if (facing === 'east') { dx_new = -dz; dz_new = dx; }
    else if (facing === 'south') { dx_new = -dx; dz_new = -dz; }
    else if (facing === 'west') { dx_new = dz; dz_new = -dx; }
    return { dx: dx_new, dz: dz_new };
  }

  let interactions = [
    { tag: "basesecondary_interaction", dx: 0.0, dy: 0.6, dz: -0.3 },
    { tag: "basetertiary_interaction",  dx: -0.19, dy: 0.6, dz: -0.3 },
    { tag: "baseprimary_interaction",   dx: 0.19, dy: 0.6, dz: -0.3 },
    { tag: "coreside_interaction",      dx: 0.0,  dy: 0.4, dz: -0.3 },
    { tag: "tubes_interaction",         dx: -0.19,dy: 0.4, dz: -0.3 },
    { tag: "coretop_interaction",       dx: 0.19, dy: 0.4, dz: -0.3 },
    { tag: "dialinner_interaction",     dx: 0.0,  dy: 0.23,dz: -0.4 },
    { tag: "dialouter_interaction",     dx: 0.19, dy: 0.23,dz: -0.4 },
    { tag: "buttons_interaction",       dx: -0.19,dy: 0.23,dz: -0.4 }
  ];

  for (let i of interactions) {
    let rotated = rotate(i.dx, i.dz, direction);
    let x = pos.x + rotated.dx + 0.5;
    let y = pos.y + i.dy;
    let z = pos.z + rotated.dz + 0.5;
    event.server.runCommandSilent(`execute as ${username} run summon minecraft:interaction ${x} ${y} ${z} {width:0.1f,height:0.1f,Tags:["${i.tag}"]}`);
  }
  event.server.runCommandSilent(`execute as ${username} run summon minecraft:interaction ${pos.x + 0.5} ${pos.y + 1} ${pos.z + 0.5} {width:0.5f,height:0.5f,Tags:["omnitrix_interaction"]}`);
});


const VALID_OMNITRIX_TYPES = [
  "alienevo:prototype_omnitrix",
  "alienevo:prototype_omnitrix_phase1",
  "alienevo:prototype_omnitrix_phase2",
  "alienevo:prototype_omnitrix_10k"
];


ItemEvents.entityInteracted('*', event => {
  let username = event.player.getGameProfile().getName();

  if (event.target.type != 'minecraft:interaction' || !event.target.getTags().contains('omnitrix_interaction')) return;

  var x = Math.floor(event.target.x);
  var y = Math.floor(event.target.y);
  var z = Math.floor(event.target.z);

  var mainHandItem = event.player.getMainHandItem();
  if (!mainHandItem || !VALID_OMNITRIX_TYPES.includes(mainHandItem.id)) return;

  if (event.server.runCommandSilent(
    `execute as ${username} positioned ${x} ${y} ${z} if entity @e[type=minecraft:armor_stand,tag=workbench_stand,sort=nearest,limit=1,distance=..1.1,palladium.power=alienevo:omnitrix_workbench]`
  )) return;

  event.server.runCommandSilent(`execute positioned ${x} ${y} ${z} run playsound minecraft:item.armor.equip_netherite master @a[distance=..10] ~ ~ ~ 1 1.5`);

  var nbt = mainHandItem.nbt;

  if (nbt && nbt.display && nbt.display.Name) {
    event.target.persistentData.putString('storedItemName', nbt.display.Name);
  }

  const MAX_PLAYLISTS = 10;
  const SLOTS_PER_PLAYLIST = 10;

  try {
    var storedDNA = nbt && nbt.storedAllDNA ? nbt.storedAllDNA : '';
    if (storedDNA) {
      var dnaData = JSON.parse(storedDNA);
      for (let playlist = 1; playlist <= MAX_PLAYLISTS; playlist++) {
        for (let slot = 1; slot <= SLOTS_PER_PLAYLIST; slot++) {
          let alienKey = `alienevo.alien_${playlist}_${slot}`;
          let alienId = 0;
          if (dnaData[playlist] && dnaData[playlist][slot] && dnaData[playlist][slot].alienId) {
            alienId = dnaData[playlist][slot].alienId;
          }
          event.target.persistentData.putInt(alienKey, alienId);
        }
      }
    } else {
      let firstTenAlienIds = [1,2,3,4,5,6,7,8,9,10];
      for (let i = firstTenAlienIds.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [firstTenAlienIds[i], firstTenAlienIds[j]] = [firstTenAlienIds[j], firstTenAlienIds[i]];
      }
      let playlist = 1;
      for (let slot = 1; slot <= SLOTS_PER_PLAYLIST; slot++) {
        let alienKey = `alienevo.alien_${playlist}_${slot}`;
        let alienId = slot <= firstTenAlienIds.length ? firstTenAlienIds[slot - 1] : 0;
        event.target.persistentData.putInt(alienKey, alienId);
      }
      for (let p = 2; p <= MAX_PLAYLISTS; p++) {
        for (let slot = 1; slot <= SLOTS_PER_PLAYLIST; slot++) {
          event.target.persistentData.putInt(`alienevo.alien_${p}_${slot}`, 0);
        }
      }
    }
  } catch (e) {
    let firstTenAlienIds = [1,2,3,4,5,6,7,8,9,10];
    for (let i = firstTenAlienIds.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [firstTenAlienIds[i], firstTenAlienIds[j]] = [firstTenAlienIds[j], firstTenAlienIds[i]];
    }
    let playlist = 1;
    for (let slot = 1; slot <= SLOTS_PER_PLAYLIST; slot++) {
      let alienKey = `alienevo.alien_${playlist}_${slot}`;
      let alienId = slot <= firstTenAlienIds.length ? firstTenAlienIds[slot - 1] : 0;
      event.target.persistentData.putInt(alienKey, alienId);
    }
    for (let p = 2; p <= MAX_PLAYLISTS; p++) {
      for (let slot = 1; slot <= SLOTS_PER_PLAYLIST; slot++) {
        event.target.persistentData.putInt(`alienevo.alien_${p}_${slot}`, 0);
      }
    }
  }


  try {
    let storedCode = nbt && nbt.storedCode ? nbt.storedCode : '000000';
    let storedPosition = nbt && nbt.storedPosition ? nbt.storedPosition : '0';
    let storedMasterTargetCode = nbt && nbt.storedMasterTargetCode ? nbt.storedMasterTargetCode : '';
    let storedSelfDestructTargetCode = nbt && nbt.storedSelfDestructTargetCode ? nbt.storedSelfDestructTargetCode : '';
    event.target.persistentData.putString('code', storedCode);
    event.target.persistentData.putString('position', storedPosition);
    event.target.persistentData.putString('masterTargetCode', storedMasterTargetCode);
    event.target.persistentData.putString('selfDestructTargetCode', storedSelfDestructTargetCode);
  } catch (e) {
    event.target.persistentData.putString('code', '000000');
    event.target.persistentData.putString('position', '0');
    event.target.persistentData.putString('masterTargetCode', '');
    event.target.persistentData.putString('selfDestructTargetCode', '');
  }

  try {
    if (nbt && nbt.storedAlienNamespaces) {
      event.target.persistentData.putString('storedAlienNamespaces', nbt.storedAlienNamespaces);
    }
  } catch (e) {}

  try {
    let storedCurrentPlaylist = nbt && nbt.storedCurrentPlaylist ? nbt.storedCurrentPlaylist : 1;
    let storedCurrentAlienSlot = nbt && nbt.storedCurrentAlienSlot ? nbt.storedCurrentAlienSlot : 1;
    event.target.persistentData.putInt('current_playlist', storedCurrentPlaylist);
    event.target.persistentData.putInt('current_alien_slot', storedCurrentAlienSlot);
  } catch (e) {
    event.target.persistentData.putInt('current_playlist', 1);
    event.target.persistentData.putInt('current_alien_slot', 1);
  }

  event.server.runCommandSilent(`execute positioned ${x} ${y} ${z} run tag @e[type=armor_stand,tag=workbench_stand,sort=nearest,limit=1,distance=..1.1] add temp_target`);
  let armorStand = null;
  try {
    if (!armorStand && event.level && typeof event.level.getEntities === 'function') {
      let entities = event.level.getEntities();
      for (let entity of entities) {
        if (entity.getTags().contains('temp_target')) { armorStand = entity; break; }
      }
    }
  } catch (e) {}
  event.server.runCommandSilent(`tag @e[tag=temp_target] remove temp_target`);

  if (armorStand) {
    try {
      palladium.setProperty(armorStand, 'watch', getWatchPrefixFromBench());
      applyCodexGlowDefaultsForWatch(armorStand, getWatchPrefixFromBench());

      if (nbt && nbt.storedOmnitrixCycle) palladium.setProperty(armorStand, 'omnitrix_cycle', nbt.storedOmnitrixCycle);
      if (nbt && nbt.storedCode)          palladium.setProperty(armorStand, 'code', nbt.storedCode);

      // UNIFORM glow back onto stand from item NBT
      if (typeof nbt?.storedUniformGlowColorBase === 'string') palladium.setProperty(armorStand, 'uniform_glow_color_base', nbt.storedUniformGlowColorBase);
      if (typeof nbt?.storedUniformGlowColor1   === 'string') palladium.setProperty(armorStand, 'uniform_glow_color_1',    nbt.storedUniformGlowColor1);
      if (typeof nbt?.storedUniformGlowColor2   === 'string') palladium.setProperty(armorStand, 'uniform_glow_color_2',    nbt.storedUniformGlowColor2);
      if (typeof nbt?.storedUniformGlowColor3   === 'string') palladium.setProperty(armorStand, 'uniform_glow_color_3',    nbt.storedUniformGlowColor3);
      if (typeof nbt?.storedUniformGlowColor4   === 'string') palladium.setProperty(armorStand, 'uniform_glow_color_4',    nbt.storedUniformGlowColor4);
      if (typeof nbt?.storedUniformGlowColor5   === 'string') palladium.setProperty(armorStand, 'uniform_glow_color_5',    nbt.storedUniformGlowColor5);

      // WATCH (prototype) glow back onto stand if present
      if (typeof nbt?.storedGlowColorBase === 'string') palladium.setProperty(armorStand, 'prototype_glow_color_base', nbt.storedGlowColorBase);
      if (typeof nbt?.storedGlowColor1    === 'string') palladium.setProperty(armorStand, 'prototype_glow_color_1',    nbt.storedGlowColor1);
      if (typeof nbt?.storedGlowColor2    === 'string') palladium.setProperty(armorStand, 'prototype_glow_color_2',    nbt.storedGlowColor2);
      if (typeof nbt?.storedGlowColor3    === 'string') palladium.setProperty(armorStand, 'prototype_glow_color_3',    nbt.storedGlowColor3);
      if (typeof nbt?.storedGlowColor4    === 'string') palladium.setProperty(armorStand, 'prototype_glow_color_4',    nbt.storedGlowColor4);
      if (typeof nbt?.storedGlowColor5    === 'string') palladium.setProperty(armorStand, 'prototype_glow_color_5',    nbt.storedGlowColor5);

      // NEW: restore generated per-alien glow props from item NBT (over Codex baseline)
      if (typeof nbt?.storedAlienGlowProps === 'string' && nbt.storedAlienGlowProps.length) {
        try {
          var parsedAlienGlow = JSON.parse(nbt.storedAlienGlowProps);
          restoreGeneratedAlienGlowProps(armorStand, parsedAlienGlow);
        } catch (eAG) { console.log('Failed to parse storedAlienGlowProps on insert:', eAG); }
      }
    } catch (e) {}
  } else {
    // Cache on interaction entity if no stand found (optional)
    if (nbt && nbt.storedOmnitrixCycle) event.target.persistentData.putInt('storedOmnitrixCycle', nbt.storedOmnitrixCycle);

    if (typeof nbt?.storedUniformGlowColorBase === 'string') event.target.persistentData.putString('uniform_glow_color_base', nbt.storedUniformGlowColorBase);
    if (typeof nbt?.storedUniformGlowColor1   === 'string') event.target.persistentData.putString('uniform_glow_color_1',    nbt.storedUniformGlowColor1);
    if (typeof nbt?.storedUniformGlowColor2   === 'string') event.target.persistentData.putString('uniform_glow_color_2',    nbt.storedUniformGlowColor2);
    if (typeof nbt?.storedUniformGlowColor3   === 'string') event.target.persistentData.putString('uniform_glow_color_3',    nbt.storedUniformGlowColor3);
    if (typeof nbt?.storedUniformGlowColor4   === 'string') event.target.persistentData.putString('uniform_glow_color_4',    nbt.storedUniformGlowColor4);
    if (typeof nbt?.storedUniformGlowColor5   === 'string') event.target.persistentData.putString('uniform_glow_color_5',    nbt.storedUniformGlowColor5);

    if (typeof nbt?.storedGlowColorBase === 'string') event.target.persistentData.putString('prototype_glow_color_base', nbt.storedGlowColorBase);
    if (typeof nbt?.storedGlowColor1    === 'string') event.target.persistentData.putString('prototype_glow_color_1',    nbt.storedGlowColor1);
    if (typeof nbt?.storedGlowColor2    === 'string') event.target.persistentData.putString('prototype_glow_color_2',    nbt.storedGlowColor2);
    if (typeof nbt?.storedGlowColor3    === 'string') event.target.persistentData.putString('prototype_glow_color_3',    nbt.storedGlowColor3);
    if (typeof nbt?.storedGlowColor4    === 'string') event.target.persistentData.putString('prototype_glow_color_4',    nbt.storedGlowColor4);
    if (typeof nbt?.storedGlowColor5    === 'string') event.target.persistentData.putString('prototype_glow_color_5',    nbt.storedGlowColor5);

    // Optional: cache per-alien bundle if stand missing
    if (typeof nbt?.storedAlienGlowProps === 'string') {
      event.target.persistentData.putString('storedAlienGlowProps', nbt.storedAlienGlowProps);
    }
  }

  function getStoredScore(nbtTag, defaultValue) {
    return (nbt && nbt.contains && nbt.contains(nbtTag)) ? nbt.getInt(nbtTag) : defaultValue;
  }

  if (!nbt && mainHandItem.id.includes('_10k')) {
    event.server.runCommandSilent(`execute positioned ${x} ${y} ${z} as @e[type=armor_stand,tag=workbench_stand,sort=nearest,limit=1] run scoreboard players set @s AlienEvo.10kPhase 1`);
    event.server.runCommandSilent(`execute positioned ${x} ${y} ${z} as @e[type=armor_stand,tag=workbench_stand,sort=nearest,limit=1] run scoreboard players set @s AlienEvo.10kStage 2`);
  } else {
    var scoreCommands = [
      ['10kPhase', 'stored10kPhaseScore', 0],
      ['10kStage', 'stored10kStageScore', 0],
      ['BasePrimary', 'storedBasePrimaryScore', -1],
      ['BaseSecondary', 'storedBaseSecondaryScore', -1],
      ['BaseTertiary', 'storedBaseTertiaryScore', -1],
      ['Buttons', 'storedButtonsScore', -1],
      ['CoreSide', 'storedCoreSideScore', -1],
      ['CoreTop', 'storedCoreTopScore', -1],
      ['DialInner', 'storedDialInnerScore', -1],
      ['DialOuter', 'storedDialOuterScore', -1],
      ['Tubes', 'storedTubesScore', -1]
    ];
    for (var i = 0; i < scoreCommands.length; i++) {
      var scoreName = scoreCommands[i][0];
      var nbtTag = scoreCommands[i][1];
      var defaultValue = scoreCommands[i][2];
      var scoreValue = getStoredScore(nbtTag, defaultValue);
      event.server.runCommandSilent(`execute positioned ${x} ${y} ${z} as @e[type=armor_stand,tag=workbench_stand,sort=nearest,limit=1] run scoreboard players set @s AlienEvo.${scoreName} ${scoreValue}`);
    }
  }

  let positionValue = getStoredScore('storedPosition', 0);
  if (nbt && nbt.storedPosition && !isNaN(parseInt(nbt.storedPosition))) positionValue = parseInt(nbt.storedPosition);
  event.server.runCommandSilent(`execute positioned ${x} ${y} ${z} as @e[type=armor_stand,tag=workbench_stand,sort=nearest,limit=1] run scoreboard players set @s code_position ${positionValue}`);

  if (nbt && nbt.storedMastercontrol) {
    event.server.runCommandSilent(`execute positioned ${x} ${y} ${z} run tag @e[type=armor_stand,tag=workbench_stand,sort=nearest,limit=1] add AlienEvo.MasterControl`);
  }

  event.server.runCommandSilent(`execute positioned ${x} ${y} ${z} run superpower set alienevo:omnitrix_workbench @e[type=armor_stand,tag=workbench_stand,sort=nearest,limit=1]`);
  mainHandItem.count--;
  event.cancel();
});


ItemEvents.entityInteracted(event => {
  let username = event.player.getGameProfile().getName();

  if (event.target.type != 'minecraft:interaction') return;
  if (!event.target.getTags().contains('omnitrix_interaction')) return;

  let x = Math.floor(event.target.x);
  let y = Math.floor(event.target.y);
  let z = Math.floor(event.target.z);

  let mainHandItem = event.player.getMainHandItem();
  if (mainHandItem.id !== 'minecraft:air') return;

  let hasWorkbenchPower = event.server.runCommandSilent(
    `execute as ${username} positioned ${x} ${y} ${z} if entity @e[type=armor_stand,tag=workbench_stand,distance=0..1.1,sort=nearest,limit=1,palladium.power=alienevo:omnitrix_workbench]`
  );
  if (!hasWorkbenchPower) return;

  let allDNA = {};
  let storedAlienCount = 0;
  for (let playlist = 1; playlist <= 10; playlist++) {
    allDNA[playlist] = {};
    for (let slot = 1; slot <= 10; slot++) {
      let dnaKey = `alienevo.alien_${playlist}_${slot}`;
      let alienId = event.target.persistentData.getInt(dnaKey);
      if (alienId > 0) {
        allDNA[playlist][slot] = { alienId: alienId, alienName: getAlienName(alienId) };
        storedAlienCount++;
        event.target.persistentData.putInt(dnaKey, 0);
      }
    }
  }

  let alienNamespaceData = "{}";
  if (event.target.persistentData.contains('storedAlienNamespaces')) {
    alienNamespaceData = event.target.persistentData.getString('storedAlienNamespaces');
    event.target.persistentData.remove('storedAlienNamespaces');
  }

  function getArmorStandScore(scoreName) {
    let cmd = `scoreboard players get @e[type=armor_stand,distance=..1.1,tag=workbench_stand,sort=nearest,limit=1] ${scoreName}`;
    let scoreResult = event.server.runCommandSilent(`execute positioned ${x} ${y} ${z} run ${cmd}`);
    return isNaN(scoreResult) ? null : parseInt(scoreResult)
  }

  let scores = {
    uniformOSMain: getArmorStandScore('AlienEvo.UniformOSMain') ?? 0,
    uniformOSSecondary: getArmorStandScore('AlienEvo.UniformOSSecondary') ?? 0,
    phase10k: getArmorStandScore('AlienEvo.10kPhase') ?? 0,
    stage10k: getArmorStandScore('AlienEvo.10kStage') ?? 0,
    basePrimary: getArmorStandScore('AlienEvo.BasePrimary') ?? -1,
    baseSecondary: getArmorStandScore('AlienEvo.BaseSecondary') ?? -1,
    baseTertiary: getArmorStandScore('AlienEvo.BaseTertiary') ?? -1,
    buttons: getArmorStandScore('AlienEvo.Buttons') ?? -1,
    coreSide: getArmorStandScore('AlienEvo.CoreSide') ?? -1,
    coreTop: getArmorStandScore('AlienEvo.CoreTop') ?? -1,
    dialOuter: getArmorStandScore('AlienEvo.DialOuter') ?? -1,
    dialInner: getArmorStandScore('AlienEvo.DialInner') ?? -1,
    tubes: getArmorStandScore('AlienEvo.Tubes') ?? -1,
    codePosition: getArmorStandScore('code_position') ?? 0
  };

  // Helper to read properties
  let getArmorStandProperty = (propName, defaultValue) => {
    try {
      event.server.runCommandSilent(
        `execute positioned ${x} ${y} ${z} run tag @e[type=armor_stand,tag=workbench_stand,sort=nearest,limit=1,distance=..1.1] add prop_target`
      );
      let armorStand = null;
      try {
        if (event.level && typeof event.level.getEntities === 'function') {
          let entities = event.level.getEntities();
          for (let entity of entities) {
            if (entity.getTags().contains('prop_target')) { armorStand = entity; break; }
          }
        }
        if (armorStand) {
          let propValue = palladium.getProperty(armorStand, propName);
          event.server.runCommandSilent(`tag @e[tag=prop_target] remove prop_target`);
          return (propValue ?? defaultValue);
        }
      } catch (e) {}
      event.server.runCommandSilent(`tag @e[tag=prop_target] remove prop_target`);

      // fallback to interaction entity cache if it exists
      if (event.target.persistentData.contains(propName)) {
        return event.target.persistentData.getString(propName);
      }
      return defaultValue;
    } catch (e) { return defaultValue; }
  };

  let properties = {
    omnitrixCycle: getArmorStandProperty('omnitrix_cycle', '1'),
    code: getArmorStandProperty('code', '000000'),

    // UNIFORM glow
    uniformGlowBase: getArmorStandProperty('uniform_glow_color_base', "0,0,0"),
    uniformGlow1:   getArmorStandProperty('uniform_glow_color_1', "ffffff"),
    uniformGlow2:   getArmorStandProperty('uniform_glow_color_2', "eaeaea"),
    uniformGlow3:   getArmorStandProperty('uniform_glow_color_3', "cfcfdd"),
    uniformGlow4:   getArmorStandProperty('uniform_glow_color_4', "b9b7cd"),
    uniformGlow5:   getArmorStandProperty('uniform_glow_color_5', "9f9cb6"),

    // WATCH (prototype) glow
    prototypeGlowBase: getArmorStandProperty('prototype_glow_color_base', "0,0,0"),
    prototypeGlow1:    getArmorStandProperty('prototype_glow_color_1', "b3ff40"),
    prototypeGlow2:    getArmorStandProperty('prototype_glow_color_2', "a7f72e"),
    prototypeGlow3:    getArmorStandProperty('prototype_glow_color_3', "8ed721"),
    prototypeGlow4:    getArmorStandProperty('prototype_glow_color_4', "77b81a"),
    prototypeGlow5:    getArmorStandProperty('prototype_glow_color_5', "639d11")
  };

  let hasMasterControl = event.server.runCommandSilent(
    `execute as ${username} positioned ${x} ${y} ${z} if entity @e[type=armor_stand,tag=workbench_stand,distance=0..1.1,sort=nearest,limit=1,tag=AlienEvo.MasterControl]`
  );
  let hasGlowingEyes = event.server.runCommandSilent(
    `execute as ${username} positioned ${x} ${y} ${z} if entity @e[type=armor_stand,tag=workbench_stand,distance=0..1.1,sort=nearest,limit=1,tag=AlienEvo.GlowingEyes]`
  );
  let hasMainUniform = event.server.runCommandSilent(
    `execute as ${username} positioned ${x} ${y} ${z} if entity @e[type=armor_stand,tag=workbench_stand,distance=0..1.1,sort=nearest,limit=1,tag=AlienEvo.MainUniform]`
  );
  let hasSecondaryUniform = event.server.runCommandSilent(
    `execute as ${username} positioned ${x} ${y} ${z} if entity @e[type=armor_stand,tag=workbench_stand,distance=0..1.1,sort=nearest,limit=1,tag=AlienEvo.SecondaryUniform]`
  );

  let currentPlaylist = event.target.persistentData.getInt('current_playlist') || 1;
  let currentAlienSlot = event.target.persistentData.getInt('current_alien_slot') || 1;
  event.target.persistentData.remove('current_playlist');
  event.target.persistentData.remove('current_alien_slot');

  let codeData = {
    code: event.target.persistentData.getString('code') || '000000',
    position: event.target.persistentData.getString('position') || String(scores.codePosition || '0'),
    masterTargetCode: event.target.persistentData.getString('masterTargetCode') || '',
    selfDestructTargetCode: event.target.persistentData.getString('selfDestructTargetCode') || ''
  };
  event.target.persistentData.remove('code');
  event.target.persistentData.remove('position');
  event.target.persistentData.remove('masterTargetCode');
  event.target.persistentData.remove('selfDestructTargetCode');

  // NEW: collect bench per-alien glows and reset to Codex defaults before giving item
  let benchStand = null;
  try {
    let ents = event.level.getEntities();
    for (let e of ents) { if (e.getTags().contains('workbench_stand')) { benchStand = e; break; } }
  } catch (e) {}
  let storedAlienGlowProps = {};
  if (benchStand) {
    palladium.setProperty(benchStand, 'watch', getWatchPrefixFromBench()); // ensure prototype
    storedAlienGlowProps = collectAndResetGeneratedAlienGlowProps(benchStand) || {};
  } else if (event.target.persistentData.contains('storedAlienGlowProps')) {
    // fallback if cached on interaction entity
    try { storedAlienGlowProps = JSON.parse(event.target.persistentData.getString('storedAlienGlowProps')); } catch(e){}
    event.target.persistentData.remove('storedAlienGlowProps');
  }

  let nbtData = {
    storedUniformOSMainScore: scores.uniformOSMain,
    storedUniformOSSecondaryScore: scores.uniformOSSecondary,
    stored10kPhaseScore: scores.phase10k,
    stored10kStageScore: scores.stage10k,
    storedBasePrimaryScore: scores.basePrimary,
    storedBaseSecondaryScore: scores.baseSecondary,
    storedBaseTertiaryScore: scores.baseTertiary,
    storedButtonsScore: scores.buttons,
    storedCoreSideScore: scores.coreSide,
    storedCoreTopScore: scores.coreTop,
    storedDialOuterScore: scores.dialOuter,
    storedDialInnerScore: scores.dialInner,
    storedTubesScore: scores.tubes,

    storedAllDNA: JSON.stringify(allDNA),
    storedAlienCount: storedAlienCount,
    storedAlienNamespaces: alienNamespaceData,

    storedCurrentPlaylist: currentPlaylist,
    storedCurrentAlienSlot: currentAlienSlot,

    storedMastercontrol: hasMasterControl ? 1 : 0,
    storedGlowingEyes: hasGlowingEyes ? 1 : 0,
    storedMainUniform: hasMainUniform ? 1 : 0,
    storedSecondaryUniform: hasSecondaryUniform ? 1 : 0,

    storedOmnitrixCycle: properties.omnitrixCycle,
    storedCode: codeData.code,
    storedPosition: codeData.position,
    storedMasterTargetCode: codeData.masterTargetCode,
    storedSelfDestructTargetCode: codeData.selfDestructTargetCode,

    // UNIFORM glow (exact keys)
    storedUniformGlowColorBase: properties.uniformGlowBase,
    storedUniformGlowColor1: properties.uniformGlow1,
    storedUniformGlowColor2: properties.uniformGlow2,
    storedUniformGlowColor3: properties.uniformGlow3,
    storedUniformGlowColor4: properties.uniformGlow4,
    storedUniformGlowColor5: properties.uniformGlow5,

    // WATCH (prototype) glow
    storedGlowColorBase: properties.prototypeGlowBase,
    storedGlowColor1: properties.prototypeGlow1,
    storedGlowColor2: properties.prototypeGlow2,
    storedGlowColor3: properties.prototypeGlow3,
    storedGlowColor4: properties.prototypeGlow4,
    storedGlowColor5: properties.prototypeGlow5,

    // NEW: per-alien bundle
    storedAlienGlowProps: JSON.stringify(storedAlienGlowProps),

    // NEW: store watch for downstream scripts
    storedWatch: getWatchPrefixFromBench()
  };

  let storedName = event.target.persistentData.getString('storedItemName');
  if (storedName) {
    nbtData.display = { Name: storedName };
    event.target.persistentData.remove('storedItemName');
  }

  // Only four variants now, chosen by phase/stage
  let omnitrixId = getPrototypeOmnitrixItem(scores.phase10k, scores.stage10k);

  let omnitrix = Item.of(omnitrixId);
  omnitrix.setNbt(nbtData);
  event.player.give(omnitrix);

  event.server.runCommandSilent(`execute positioned ${x} ${y} ${z} run playsound minecraft:item.armor.equip_leather master @a[distance=..10] ~ ~ ~ 1 1`);
  event.server.runCommandSilent(
    `execute as ${username} positioned ${x} ${y} ${z} run superpower remove alienevo:omnitrix_workbench @e[type=armor_stand,tag=workbench_stand,sort=nearest,limit=1]`
  );

  ['MasterControl','GlowingEyes','MainUniform','SecondaryUniform'].forEach(tag => {
    event.server.runCommandSilent(
      `execute as ${username} positioned ${x} ${y} ${z} run tag @e[type=armor_stand,tag=workbench_stand,sort=nearest,limit=1] remove AlienEvo.${tag}`
    );
  });

  event.cancel();
});


function getAlienName(alienId) {
  return `Alien_${alienId}`;
}

function getPrototypeOmnitrixItem(phase, stage) {
  if (phase === 1 && stage === 2) return "alienevo:prototype_omnitrix_10k";
  if (phase === 1 && stage === 1) return "alienevo:prototype_omnitrix_phase2";
  if (phase === 1 && stage === 0) return "alienevo:prototype_omnitrix_phase1";
  return "alienevo:prototype_omnitrix";
}
