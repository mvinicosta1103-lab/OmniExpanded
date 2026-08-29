// ===============================
// Universal Omnitrix DNA Script (watch-agnostic)
// Features:
// - Auto-set 'watch' Palladium property from item id when applying
// - Per-alien glow persistence to NBT on decouple
// - Reset per-alien glows to Codex defaults on decouple
// - Fresh watch (no NBT) initializes correct Codex glows for that watch
// - Optional baseline Codex init even when NBT exists, before restore
// ===============================

var MAX_PLAYLISTS = 10; // 10 playlists
var SLOTS_PER_PLAYLIST = 10;
var OMNITRIX_PROPERTY_KEY = 'omnitrix_cycle';
var CURRENT_PLAYLIST_KEY = 'current_playlist';
var CURRENT_ALIEN_SLOT_KEY = 'current_alien_slot';

// ---------- Utils ----------
function toJsString(v){ if(v===null||v===undefined) return null; try { return String(v); } catch(e){ return null; } }
function normalizeHex6(s){
  s = toJsString(s);
  if(!s) return null;
  s = s.trim();
  if(s.charAt(0)==='#') s = s.substring(1);
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

// Parse a watch prefix directly from an omnitrix item id.
// "alienevo:prototype_omnitrix"      -> "prototype"
// "alienevo:prototype_omnitrix_10k"  -> "prototype"
// "alienevo:ultimate_v2_omnitrix"    -> "ultimate" (first token)
function inferWatchPrefixFromItemId(itemId){
  try {
    var name = itemId.split(':')[1] || itemId;
    var base = name.split('_omnitrix')[0];
    var first = base.split('_')[0];
    first = first.toLowerCase().replace(/[^a-z0-9_]/g, '');
    return first || null;
  } catch (e) { return null; }
}

// Get the active watch prefix (fallback to 'prototype')
function getWatchPrefix(entity){
  var raw = palladium.getProperty(entity, 'watch');
  var s = toJsString(raw);
  if(!s) return 'prototype';
  s = s.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  return s || 'prototype';
}

// Item id from phase/stage and watch prefix
function getWatchItemId(prefix, phase, stage){
  if (phase === 1 && stage === 2) return 'alienevo:' + prefix + '_omnitrix_10k';
  return 'alienevo:' + prefix + '_omnitrix';
}

// Sound id per watch
function getDecoupleSoundId(prefix){ return 'alienevo:' + prefix + '_decouple'; }

// Superpower id per watch
function getWatchSuperpowerId(prefix){ return new ResourceLocation('alienevo:' + prefix + '_omnitrix'); }

// ---------- Slot property sync ----------
function updateAllSlotProperties(entity, playlist) {
  try {
    for (var slot = 1; slot <= SLOTS_PER_PLAYLIST; slot++) {
      var alienKey = 'alienevo.alien_' + playlist + '_' + slot;
      var storedAlienId = entity.persistentData.getInt(alienKey);
      palladium.setProperty(entity, 'alien_evo_slot_' + slot, storedAlienId || 0);
    }
    console.log('Successfully updated slot properties for playlist ' + playlist);
  } catch (error) {
    console.log('Error in updateAllSlotProperties: ' + error);
  }
}

// ---------- Alien name fallback ----------
function getAlienName(alienId, entity) {
  var alienInfo = global['alienevo_alien_' + alienId];
  if (alienInfo) {
    var fullName = alienInfo[0];
    return (fullName.indexOf(':') !== -1) ? fullName.split(':')[1] : fullName;
  }
  if (entity) {
    var storedName = entity.persistentData.getString('alienevo.alien_name_' + alienId);
    if (storedName) return storedName;
  }
  return 'alien_' + alienId;
}

// ---------- Glow color helpers ----------
function readGlowHex(entity, idx, keyPrefix){
  var raw = palladium.getProperty(entity, keyPrefix + idx);
  return normalizeHex6(raw);
}
function writeGlowHex(entity, idx, hex, keyPrefix){
  var v = normalizeHex6(hex);
  if (v) palladium.setProperty(entity, keyPrefix + idx, v);
}
function readGlowBase(entity, key){ return normalizeRgbCsv(palladium.getProperty(entity, key)); }
function writeGlowBase(entity, key, csv){
  var v = normalizeRgbCsv(csv);
  if (v) palladium.setProperty(entity, key, v);
}

// Defaults for watch-specific glows (green set like prototype)
function resetWatchGlowDefaults(entity, prefix) {
  palladium.setProperty(entity, prefix + '_glow_color_base', '0,0,0');
  palladium.setProperty(entity, prefix + '_glow_color_1', 'b3ff40');
  palladium.setProperty(entity, prefix + '_glow_color_2', 'a7f72e');
  palladium.setProperty(entity, prefix + '_glow_color_3', '8ed721');
  palladium.setProperty(entity, prefix + '_glow_color_4', '77b81a');
  palladium.setProperty(entity, prefix + '_glow_color_5', '639d11');
}

// Defaults for uniform glows (white/gray palette)
function resetUniformGlowDefaults(entity) {
  palladium.setProperty(entity, 'uniform_glow_color_base', '0,0,0');
  palladium.setProperty(entity, 'uniform_glow_color_1', 'ffffff');
  palladium.setProperty(entity, 'uniform_glow_color_2', 'eaeaea');
  palladium.setProperty(entity, 'uniform_glow_color_3', 'cfcfdd');
  palladium.setProperty(entity, 'uniform_glow_color_4', 'b9b7cd');
  palladium.setProperty(entity, 'uniform_glow_color_5', '9f9cb6');
}

// ===============================
// Per-alien glow persistence + Codex reset (decouple)
// ===============================

// Collect current values and then reset entity props to Codex defaults
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

    var alienInfo = global['alienevo_alien_' + alienId];
    if (!alienInfo || !alienInfo[0]) return;
    var alienFullName = String(alienInfo[0]);
    var alienName = alienFullName.indexOf(':') !== -1 ? alienFullName.split(':')[1] : alienFullName;

    var prefix = alienName + '_' + variationName + '_glowcolor_' + glowId + (suffix || '');

    // 1) STORE current values
    var baseKey = prefix + '_base';
    var baseVal = readGlowBase(entity, baseKey);

    var storedColors = [];
    for (var i = 0; i < defArray.length; i++) {
      var colorKey = prefix + '_color_' + (i + 1);
      var val = normalizeHex6(palladium.getProperty(entity, colorKey));
      storedColors.push(val);
    }

    var hasSomething = !!baseVal || storedColors.some(function (c) { return !!c; });
    if (hasSomething) {
      result[prefix] = { base: baseVal, colors: storedColors };
    }

    // 2) RESET to Codex defaults
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

// ===============================
// NEW: Apply Codex glows for a given watch prefix (used for fresh watches)
// ===============================
function applyCodexGlowDefaultsForWatch(entity, watchPrefix) {
  var DEF_RE = /^alienevo_(\d+)_([^]+?)_glowcolor_(\d+)(.*)$/;

  // Find combos that have explicit variant for this watch
  var hasExplicit = {};
  Object.keys(global).forEach(function (key) {
    var m = key.match(DEF_RE);
    if (!m) return;
    var alienId = m[1], variation = m[2], glowId = m[3], suffix = m[4] || '';
    if (variation === watchPrefix) {
      hasExplicit[alienId + '|' + glowId + '|' + suffix] = true;
    }
  });

  // Apply explicit watch variant or fallback to default if no explicit exists
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
    var alienName = full.indexOf(':') !== -1 ? full.split(':')[1] : full;

    // Keep the real variation we’re actually applying (watchPrefix or default)
    var resolvedVariation = (variation === 'default' && hasExplicit[combo]) ? watchPrefix : variation;
    var prefix = alienName + '_' + resolvedVariation + '_glowcolor_' + glowId + suffix;

    for (var i = 0; i < arr.length; i++) {
      var hex = normalizeHex6(arr[i]);
      if (hex) palladium.setProperty(entity, prefix + '_color_' + (i + 1), hex);
    }
    palladium.setProperty(entity, prefix + '_base', '0,0,0');
  });
}

// ===============================
// Create + Give Omnitrix (DECouple, universal)
// ===============================
function createAndGiveOmnitrix(entity) {
  var watchPrefix = getWatchPrefix(entity);

  var allDNA = {};
  var storedAlienCount = 0;

  var storedItemName = entity.persistentData.getString('storedItemName') || '';
  var alienNamespaceData = {};

  // Current playlist + slot
  var currentPlaylist = entity.persistentData.getInt(CURRENT_PLAYLIST_KEY) || 1;
  var currentAlienSlot = entity.persistentData.getInt(CURRENT_ALIEN_SLOT_KEY) || 1;

  // Gather + clear DNA from ALL playlists/slots
  for (var playlist = 1; playlist <= MAX_PLAYLISTS; playlist++) {
    allDNA[playlist] = {};
    for (var slot = 1; slot <= SLOTS_PER_PLAYLIST; slot++) {
      var alienKey = 'alienevo.alien_' + playlist + '_' + slot;
      var alienId = entity.persistentData.getInt(alienKey);
      if (alienId && alienId !== 0) {
        var info = global['alienevo_alien_' + alienId];
        var alienName = 'Unknown';
        var alienNamespace = 'alienevo_aliens';

        if (info) {
          var alienFullName = info[0];
          if (alienFullName.indexOf(':') !== -1) {
            var parts = alienFullName.split(':');
            alienNamespace = parts[0];
            alienName = parts[1];
          } else {
            alienName = alienFullName;
          }
          alienNamespaceData[alienId] = { namespace: alienNamespace, name: alienName };
        } else {
          alienName = getAlienName(alienId, entity);
        }

        allDNA[playlist][slot] = { alienId: alienId, alienName: alienName };
        storedAlienCount++;
        entity.persistentData.putInt(alienKey, 0); // clear after storing
      }
    }
  }

  var username = entity.getGameProfile().getName();

  // Scores (non-color)
  function getScore(scoreName) {
    var scoreResult = entity.server.runCommandSilent('scoreboard players get ' + username + ' ' + scoreName);
    return isNaN(scoreResult) ? 0 : parseInt(scoreResult);
  }
  var basePrimaryScore   = getScore('AlienEvo.BasePrimary');
  var baseSecondaryScore = getScore('AlienEvo.BaseSecondary');
  var baseTertiaryScore  = getScore('AlienEvo.BaseTertiary');
  var buttonsScore       = getScore('AlienEvo.Buttons');
  var coreSideScore      = getScore('AlienEvo.CoreSide');
  var coreTopScore       = getScore('AlienEvo.CoreTop');
  var dialInnerScore     = getScore('AlienEvo.DialInner');
  var dialOuterScore     = getScore('AlienEvo.DialOuter');
  var tubesScore         = getScore('AlienEvo.Tubes');
  var phase10kScore      = getScore('AlienEvo.10kPhase');
  var stage10kScore      = getScore('AlienEvo.10kStage');

  // Codes
  var currentCode            = entity.persistentData.getString('code') || '000000';
  var currentPosition        = entity.persistentData.getString('position') || '0';
  var masterTargetCode       = entity.persistentData.getString('masterTargetCode') || '';
  var selfDestructTargetCode = entity.persistentData.getString('selfDestructTargetCode') || '';

  // Read watch-specific glow props
  var wgPrefix = watchPrefix + '_glow_color_';
  var glow1 = readGlowHex(entity, 1, wgPrefix);
  var glow2 = readGlowHex(entity, 2, wgPrefix);
  var glow3 = readGlowHex(entity, 3, wgPrefix);
  var glow4 = readGlowHex(entity, 4, wgPrefix);
  var glow5 = readGlowHex(entity, 5, wgPrefix);
  var watchBase = readGlowBase(entity, watchPrefix + '_glow_color_base');

  // Read uniform glow props
  var ugPrefix = 'uniform_glow_color_';
  var uGlow1 = readGlowHex(entity, 1, ugPrefix);
  var uGlow2 = readGlowHex(entity, 2, ugPrefix);
  var uGlow3 = readGlowHex(entity, 3, ugPrefix);
  var uGlow4 = readGlowHex(entity, 4, ugPrefix);
  var uGlow5 = readGlowHex(entity, 5, ugPrefix);
  var uniformBase = readGlowBase(entity, 'uniform_glow_color_base');

  var hasMastercontrol = entity.tags.contains('AlienEvo.MasterControl');

  // Build item NBT
  var nbtData = {
    storedAllDNA: JSON.stringify(allDNA),
    storedAlienCount: storedAlienCount,
    storedAlienNamespaces: JSON.stringify(alienNamespaceData),
    storedCurrentPlaylist: currentPlaylist,
    storedCurrentAlienSlot: currentAlienSlot,
    storedOmnitrixCycle: currentAlienSlot,
    storedBasePrimaryScore: basePrimaryScore,
    storedBaseSecondaryScore: baseSecondaryScore,
    storedBaseTertiaryScore: baseTertiaryScore,
    storedButtonsScore: buttonsScore,
    storedCoreSideScore: coreSideScore,
    storedCoreTopScore: coreTopScore,
    storedDialInnerScore: dialInnerScore,
    storedDialOuterScore: dialOuterScore,
    storedTubesScore: tubesScore,
    stored10kPhaseScore: phase10kScore,
    stored10kStageScore: stage10kScore,
    storedCode: currentCode,
    storedPosition: currentPosition,
    storedMasterTargetCode: masterTargetCode,
    storedSelfDestructTargetCode: selfDestructTargetCode,
    storedMastercontrol: hasMastercontrol,
    storedWatch: watchPrefix
  };
  if (storedItemName && storedItemName !== '') {
    nbtData.display = { Name: storedItemName };
    entity.persistentData.remove('storedItemName');
  }

  // Attach watch glows
  if (glow1) nbtData.storedGlowColor1 = glow1;
  if (glow2) nbtData.storedGlowColor2 = glow2;
  if (glow3) nbtData.storedGlowColor3 = glow3;
  if (glow4) nbtData.storedGlowColor4 = glow4;
  if (glow5) nbtData.storedGlowColor5 = glow5;
  if (watchBase) nbtData.storedGlowColorBase = watchBase;

  // Attach uniform glows
  if (uGlow1) nbtData.storedUniformGlowColor1 = uGlow1;
  if (uGlow2) nbtData.storedUniformGlowColor2 = uGlow2;
  if (uGlow3) nbtData.storedUniformGlowColor3 = uGlow3;
  if (uGlow4) nbtData.storedUniformGlowColor4 = uGlow4;
  if (uGlow5) nbtData.storedUniformGlowColor5 = uGlow5;
  if (uniformBase) nbtData.storedUniformGlowColorBase = uniformBase;

  // Store per-alien glows then reset to Codex defaults
  var generatedAlienGlowProps = collectAndResetGeneratedAlienGlowProps(entity);
  if (generatedAlienGlowProps && Object.keys(generatedAlienGlowProps).length) {
    nbtData.storedAlienGlowProps = JSON.stringify(generatedAlienGlowProps);
  }

  // Create the item WITH NBT
  var itemId = getWatchItemId(watchPrefix, phase10kScore, stage10kScore);
  var watchItem = Item.of(itemId, 1, nbtData);

  console.log('Giving ' + itemId + ' with glow NBT:', {
    watch: watchPrefix,
    base: nbtData.storedGlowColorBase,
    c1: nbtData.storedGlowColor1, c2: nbtData.storedGlowColor2, c3: nbtData.storedGlowColor3,
    c4: nbtData.storedGlowColor4, c5: nbtData.storedGlowColor5,
    ubase: nbtData.storedUniformGlowColorBase,
    u1: nbtData.storedUniformGlowColor1, u2: nbtData.storedUniformGlowColor2, u3: nbtData.storedUniformGlowColor3,
    u4: nbtData.storedUniformGlowColor4, u5: nbtData.storedUniformGlowColor5,
    alienGlowPrefixes: Object.keys(generatedAlienGlowProps || {})
  });

  // Update visible slots then give item
  updateAllSlotProperties(entity, currentPlaylist);
  entity.give(watchItem);

  // Optional post-give inspect
  try {
    var held = entity.getMainHandItem();
    console.log('Player now holds:', held.id, 'NBT:', held.nbt);
  } catch (e) {
    console.log('Post-give inspect failed:', e);
  }

  // Play SFX (prefix-aware)
  entity.level.playSound(null, entity.x, entity.y, entity.z,
    getDecoupleSoundId(watchPrefix), entity.getSoundSource(), 1.0, 1.0);

  // Reset watch/uniform glow defaults (watch-level)
  resetWatchGlowDefaults(entity, watchPrefix);
  resetUniformGlowDefaults(entity);

  // Reset scores
  entity.server.runCommandSilent('scoreboard players set ' + username + ' AlienEvo.10kPhase 0');
  entity.server.runCommandSilent('scoreboard players set ' + username + ' AlienEvo.10kStage 0');
  entity.server.runCommandSilent('scoreboard players set ' + username + ' AlienEvo.BasePrimary -1');
  entity.server.runCommandSilent('scoreboard players set ' + username + ' AlienEvo.BaseSecondary -1');
  entity.server.runCommandSilent('scoreboard players set ' + username + ' AlienEvo.BaseTertiary -1');
  entity.server.runCommandSilent('scoreboard players set ' + username + ' AlienEvo.Buttons -1');
  entity.server.runCommandSilent('scoreboard players set ' + username + ' AlienEvo.CoreSide -1');
  entity.server.runCommandSilent('scoreboard players set ' + username + ' AlienEvo.CoreTop -1');
  entity.server.runCommandSilent('scoreboard players set ' + username + ' AlienEvo.DialInner -1');
  entity.server.runCommandSilent('scoreboard players set ' + username + ' AlienEvo.DialOuter -1');
  entity.server.runCommandSilent('scoreboard players set ' + username + ' AlienEvo.Tubes -1');

  // Clear codes & pos
  entity.persistentData.remove('code');
  entity.persistentData.remove('position');
  entity.persistentData.remove('masterTargetCode');
  entity.persistentData.remove('selfDestructTargetCode');
  entity.server.runCommandSilent('scoreboard players set ' + username + ' code_position 0');
  palladium.setProperty(entity, 'code', '000000');

  // Clear playlist/slot trackers
  entity.persistentData.remove(CURRENT_PLAYLIST_KEY);
  entity.persistentData.remove(CURRENT_ALIEN_SLOT_KEY);

  // Remove powers/tags
  entity.tags.remove('AlienEvo.MasterControl');
  superpowerUtil.removeSuperpower(entity, new ResourceLocation('alienevo:quick_change'));
  superpowerUtil.removeSuperpower(entity, getWatchSuperpowerId(watchPrefix));
}

// ===============================
// Apply from Omnitrix (COUple, universal)
// ===============================
function applyAllDNAFromOmnitrix(entity) {
  var mainHandItem = entity.getMainHandItem();
  if (mainHandItem.id.indexOf('alienevo:') !== 0 || mainHandItem.id.indexOf('_omnitrix') === -1) return;

  var itemId = mainHandItem.id;

  // Set the entity's 'watch' property from the item name BEFORE anything else.
  var inferred = inferWatchPrefixFromItemId(itemId) || 'prototype';
  palladium.setProperty(entity, 'watch', inferred);

  // Use the current entity 'watch' (sanitized) everywhere below
  var watchPrefix = getWatchPrefix(entity);

  if (itemId.indexOf('_omnitrix_10k') !== -1) {
    var username10k = entity.getGameProfile().getName();
    entity.server.runCommandSilent('scoreboard players set ' + username10k + ' AlienEvo.10kPhase 1');
    entity.server.runCommandSilent('scoreboard players set ' + username10k + ' AlienEvo.10kStage 2');
  }

  var nbt = mainHandItem.nbt;

  // If no NBT: initialize Codex glows for THIS watch, seed aliens, and clear item
  if (!nbt) {
    var inferredNoNbt = inferWatchPrefixFromItemId(mainHandItem.id) || 'prototype';
    palladium.setProperty(entity, 'watch', inferredNoNbt);
    var watchPrefixNoNbt = getWatchPrefix(entity);

    // Initialize all per-alien glow properties to Codex values for this watch
    applyCodexGlowDefaultsForWatch(entity, watchPrefixNoNbt);

    // Seed aliens (fallback behavior)
    giveFirstTenAliensRandomOrder(entity);

    // Also reset the watch/uniform global glows to their defaults
    resetWatchGlowDefaults(entity, watchPrefixNoNbt);
    resetUniformGlowDefaults(entity);

    entity.setMainHandItem(Item.of('minecraft:air'));
    return;
  }

  // Optional baseline even when NBT exists: initialize Codex glows first,
  // then stored NBT (if any) will overwrite specifics.
  applyCodexGlowDefaultsForWatch(entity, watchPrefix);

  var storedAllDNAString = nbt.storedAllDNA || '';
  if (!storedAllDNAString) {
    // If somehow no DNA, still consume and seed defaults
    giveFirstTenAliensRandomOrder(entity);
    entity.setMainHandItem(Item.of('minecraft:air'));
    return;
  }

  // Preserve item custom name for next creation
  var displayNbt = nbt.display;
  var itemName = '';
  if (displayNbt && displayNbt.Name) {
    itemName = displayNbt.Name;
    entity.persistentData.putString('storedItemName', itemName);
  }

  // Parse DNA
  var storedAllDNA;
  try { storedAllDNA = JSON.parse(storedAllDNAString); }
  catch (e) {
    giveFirstTenAliensRandomOrder(entity);
    entity.setMainHandItem(Item.of('minecraft:air'));
    return;
  }

  // Parse namespace data
  var alienNamespaceData = {};
  try {
    if (nbt.storedAlienNamespaces) alienNamespaceData = JSON.parse(nbt.storedAlienNamespaces);
  } catch (e2) { alienNamespaceData = {}; }

  for (var p in storedAllDNA) {
    for (var s in storedAllDNA[p]) {
      var key = 'alienevo.alien_' + p + '_' + s;
      var alienData = storedAllDNA[p][s];

      if (alienData && alienData.alienId) {
        var alienId2 = alienData.alienId;
        entity.persistentData.putInt(key, alienId2);

        if (alienData.alienName) {
          entity.persistentData.putString('alienevo.alien_name_' + alienId2, alienData.alienName);
        }

        if (alienNamespaceData && alienNamespaceData[alienId2]) {
          var namespace = alienNamespaceData[alienId2].namespace || 'alienevo_aliens';
          var name = alienNamespaceData[alienId2].name || alienData.alienName || ('alien_' + alienId2);
          var alienInfo = [namespace + ':' + name];
          global['alienevo_alien_' + alienId2] = alienInfo;
        }
      }
    }
  }

  var username = entity.getGameProfile().getName();

  var storedOmnitrixCycle = nbt.storedOmnitrixCycle || 1;
  palladium.setProperty(entity, OMNITRIX_PROPERTY_KEY, storedOmnitrixCycle);

  var storedCode = nbt.storedCode || '000000';
  var storedPosition = nbt.storedPosition || '0';
  var storedMasterTargetCode = nbt.storedMasterTargetCode || '';
  var storedSelfDestructTargetCode = nbt.storedSelfDestructTargetCode || '';

  entity.persistentData.putString('code', storedCode);
  entity.persistentData.putString('position', storedPosition);
  entity.persistentData.putString('masterTargetCode', storedMasterTargetCode);
  entity.persistentData.putString('selfDestructTargetCode', storedSelfDestructTargetCode);

  entity.server.runCommandSilent('scoreboard players set ' + username + ' code_position ' + parseInt(storedPosition));
  palladium.setProperty(entity, 'code', storedCode);

  var storedCurrentPlaylist = nbt.storedCurrentPlaylist || 1;
  var storedCurrentAlienSlot = nbt.storedCurrentAlienSlot || 1;
  entity.persistentData.putInt(CURRENT_PLAYLIST_KEY, storedCurrentPlaylist);
  entity.persistentData.putInt(CURRENT_ALIEN_SLOT_KEY, storedCurrentAlienSlot);

  function setScore(scoreName, scoreValue) {
    entity.server.runCommandSilent('scoreboard players set ' + username + ' ' + scoreName + ' ' + scoreValue);
  }
  function getStoredScore(nbtTag, defaultValue) {
    return nbt.contains(nbtTag) ? nbt.getInt(nbtTag) : defaultValue;
  }

  setScore('AlienEvo.10kPhase',      getStoredScore('stored10kPhaseScore', 0));
  setScore('AlienEvo.10kStage',      getStoredScore('stored10kStageScore', 0));
  setScore('AlienEvo.BasePrimary',   getStoredScore('storedBasePrimaryScore', -1));
  setScore('AlienEvo.BaseSecondary', getStoredScore('storedBaseSecondaryScore', -1));
  setScore('AlienEvo.BaseTertiary',  getStoredScore('storedBaseTertiaryScore', -1));
  setScore('AlienEvo.Buttons',       getStoredScore('storedButtonsScore', -1));
  setScore('AlienEvo.CoreSide',      getStoredScore('storedCoreSideScore', -1));
  setScore('AlienEvo.CoreTop',       getStoredScore('storedCoreTopScore', -1));
  setScore('AlienEvo.DialInner',     getStoredScore('storedDialInnerScore', -1));
  setScore('AlienEvo.DialOuter',     getStoredScore('storedDialOuterScore', -1));
  setScore('AlienEvo.Tubes',         getStoredScore('storedTubesScore', -1));

  if (nbt.storedMastercontrol) entity.tags.add('AlienEvo.MasterControl');

  var wgPrefix = watchPrefix + '_glow_color_';
  if (typeof nbt.storedGlowColor1 === 'string') writeGlowHex(entity, 1, nbt.storedGlowColor1, wgPrefix);
  if (typeof nbt.storedGlowColor2 === 'string') writeGlowHex(entity, 2, nbt.storedGlowColor2, wgPrefix);
  if (typeof nbt.storedGlowColor3 === 'string') writeGlowHex(entity, 3, nbt.storedGlowColor3, wgPrefix);
  if (typeof nbt.storedGlowColor4 === 'string') writeGlowHex(entity, 4, nbt.storedGlowColor4, wgPrefix);
  if (typeof nbt.storedGlowColor5 === 'string') writeGlowHex(entity, 5, nbt.storedGlowColor5, wgPrefix);

  var ugPrefix = 'uniform_glow_color_';
  if (typeof nbt.storedUniformGlowColor1 === 'string') writeGlowHex(entity, 1, nbt.storedUniformGlowColor1, ugPrefix);
  if (typeof nbt.storedUniformGlowColor2 === 'string') writeGlowHex(entity, 2, nbt.storedUniformGlowColor2, ugPrefix);
  if (typeof nbt.storedUniformGlowColor3 === 'string') writeGlowHex(entity, 3, nbt.storedUniformGlowColor3, ugPrefix);
  if (typeof nbt.storedUniformGlowColor4 === 'string') writeGlowHex(entity, 4, nbt.storedUniformGlowColor4, ugPrefix);
  if (typeof nbt.storedUniformGlowColor5 === 'string') writeGlowHex(entity, 5, nbt.storedUniformGlowColor5, ugPrefix);

  if (typeof nbt.storedGlowColorBase === 'string') writeGlowBase(entity, watchPrefix + '_glow_color_base', nbt.storedGlowColorBase);
  if (typeof nbt.storedUniformGlowColorBase === 'string') writeGlowBase(entity, 'uniform_glow_color_base', nbt.storedUniformGlowColorBase);

  if (typeof nbt.storedAlienGlowProps === 'string' && nbt.storedAlienGlowProps.length) {
    try {
      var parsedAlienGlow = JSON.parse(nbt.storedAlienGlowProps);
      restoreGeneratedAlienGlowProps(entity, parsedAlienGlow);
    } catch (eAG) {
      console.log('Failed to parse storedAlienGlowProps:', eAG);
    }
  }


  updateAllSlotProperties(entity, storedCurrentPlaylist);

  entity.setMainHandItem(Item.of('minecraft:air'));
}

function giveFirstTenAliensRandomOrder(entity) {
  var firstTenAlienIds = [1,2,3,4,5,6,7,8,9,10];

  for (var i = firstTenAlienIds.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = firstTenAlienIds[i];
    firstTenAlienIds[i] = firstTenAlienIds[j];
    firstTenAlienIds[j] = tmp;
  }

  var playlist = 1;
  for (var slot = 1; slot <= firstTenAlienIds.length; slot++) {
    var alienKey = 'alienevo.alien_' + playlist + '_' + slot;
    var alienId = firstTenAlienIds[slot - 1];
    entity.persistentData.putInt(alienKey, alienId);
  }

  for (var slot2 = firstTenAlienIds.length + 1; slot2 <= SLOTS_PER_PLAYLIST; slot2++) {
    var alienKey2 = 'alienevo.alien_' + playlist + '_' + slot2;
    entity.persistentData.putInt(alienKey2, 0);
  }


  for (var p = 2; p <= MAX_PLAYLISTS; p++) {
    for (var s = 1; s <= SLOTS_PER_PLAYLIST; s++) {
      var k = 'alienevo.alien_' + p + '_' + s;
      entity.persistentData.putInt(k, 0);
    }
  }

  entity.persistentData.putInt(CURRENT_PLAYLIST_KEY, 1);
  entity.persistentData.putInt(CURRENT_ALIEN_SLOT_KEY, 1);

  updateAllSlotProperties(entity, 1);
}

StartupEvents.registry('palladium:abilities', function (event) {
  event.create('alienevo:decouple')
    .icon(palladium.createItemIcon('alienevo:prototype_omnitrix'))
    .addProperty('property', 'string', 'alienevodnaomnitrixgeneration', '')
    .tick(function (entity, entry, holder, enabled) {
      if (enabled) createAndGiveOmnitrix(entity);
    });

  event.create('alienevo:couple')
    .icon(palladium.createItemIcon('alienevo:prototype_omnitrix'))
    .addProperty('property', 'string', 'alienevodnaomnitrixapplication', '')
    .tick(function (entity, entry, holder, enabled) {
      if (enabled) applyAllDNAFromOmnitrix(entity);
    });
});
