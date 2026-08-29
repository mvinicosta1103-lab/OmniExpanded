
var MAX_PLAYLISTS = 10;
var SLOTS_PER_PLAYLIST = 10;
var OMNITRIX_PROPERTY_KEY = 'omnitrix_cycle';
var CURRENT_PLAYLIST_KEY = 'current_playlist';
var CURRENT_ALIEN_SLOT_KEY = 'current_alien_slot';

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
function getWatchPrefix(entity){
  var raw = palladium.getProperty(entity, 'watch');
  var s = toJsString(raw);
  if(!s) s = 'prototype';
  s = s.trim().toLowerCase().replace(/[^a-z0-9_]/g,'');
  if(!s) s = 'prototype';
  return s;
}

function readGlowHex(entity, idx, keyPrefix){ return normalizeHex6(palladium.getProperty(entity, keyPrefix + idx)); }
function writeGlowHex(entity, idx, hex, keyPrefix){ var v = normalizeHex6(hex); if (v) palladium.setProperty(entity, keyPrefix + idx, v); }
function readGlowBase(entity, key){ return normalizeRgbCsv(palladium.getProperty(entity, key)); }
function writeGlowBase(entity, key, csv){ var v = normalizeRgbCsv(csv); if (v) palladium.setProperty(entity, key, v); }

function resetWatchGlowDefaults(entity, prefix){
  palladium.setProperty(entity, prefix + '_glow_color_base', '0,0,0');
  palladium.setProperty(entity, prefix + '_glow_color_1', 'b3ff40');
  palladium.setProperty(entity, prefix + '_glow_color_2', 'a7f72e');
  palladium.setProperty(entity, prefix + '_glow_color_3', '8ed721');
  palladium.setProperty(entity, prefix + '_glow_color_4', '77b81a');
  palladium.setProperty(entity, prefix + '_glow_color_5', '639d11');
}
function resetUniformGlowDefaults(entity){
  palladium.setProperty(entity, 'uniform_glow_color_base', '0,0,0');
  palladium.setProperty(entity, 'uniform_glow_color_1', 'ffffff');
  palladium.setProperty(entity, 'uniform_glow_color_2', 'eaeaea');
  palladium.setProperty(entity, 'uniform_glow_color_3', 'cfcfdd');
  palladium.setProperty(entity, 'uniform_glow_color_4', 'b9b7cd');
  palladium.setProperty(entity, 'uniform_glow_color_5', '9f9cb6');
}

function getAlienName(alienId, entity) {
  var info = global['alienevo_alien_' + alienId];
  if (info) {
    var full = info[0];
    if (full.indexOf(':') !== -1) return full.split(':')[1];
    return full;
  }
  var stored = entity.persistentData.getString('alienevo.alien_name_' + alienId);
  if (stored) return stored;
  return 'alien_' + alienId;
}
function collectAndResetGeneratedAlienGlowProps(entity) {
  var result = {};
  var GLOW_DEF_RE = /^alienevo_(\d+)_([^]+?)_glowcolor_(\d+)(.*)$/;

  Object.keys(global).forEach(function (key) {
    var m = key.match(GLOW_DEF_RE);
    if (!m) return;

    var alienId = m[1];
    var variationName = m[2];    // e.g., "default", "prototype", "10k", ...
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
    var baseVal = readGlowBase(entity, baseKey);
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
function createAndGivePrototypeCore(entity) {
  var allDNA = {};
  var storedAlienCount = 0;

  var storedItemName = entity.persistentData.getString('storedItemName') || '';
  var alienNamespaceData = {};

  // Collect + clear DNA
  for (var playlist = 1; playlist <= MAX_PLAYLISTS; playlist++) {
    allDNA[playlist] = {};
    for (var slot = 1; slot <= SLOTS_PER_PLAYLIST; slot++) {
      var key = 'alienevo.alien_' + playlist + '_' + slot;
      var alienId = entity.persistentData.getInt(key);
      if (alienId && alienId !== 0) {
        var info = global['alienevo_alien_' + alienId];
        var alienName = 'Unknown';
        var alienNamespace = 'alienevo_aliens';
        if (info) {
          var full = info[0];
          if (full.indexOf(':') !== -1) {
            var parts = full.split(':');
            alienNamespace = parts[0];
            alienName = parts[1];
          } else {
            alienName = full;
          }
          alienNamespaceData[alienId] = { namespace: alienNamespace, name: alienName };
        } else {
          alienName = getAlienName(alienId, entity);
        }
        allDNA[playlist][slot] = { alienId: alienId, alienName: alienName };
        storedAlienCount++;
        entity.persistentData.putInt(key, 0);
      }
    }
  }

  var username = entity.getGameProfile().getName();

  var currentPlaylist = entity.persistentData.getInt(CURRENT_PLAYLIST_KEY) || 1;
  var currentAlienSlot = entity.persistentData.getInt(CURRENT_ALIEN_SLOT_KEY) || 1;

  var currentCode            = entity.persistentData.getString('code') || '000000';
  var currentPosition        = entity.persistentData.getString('position') || '0';
  var masterTargetCode       = entity.persistentData.getString('masterTargetCode') || '';
  var selfDestructTargetCode = entity.persistentData.getString('selfDestructTargetCode') || '';

  var watchPrefix = getWatchPrefix(entity);
  var wgPrefix = watchPrefix + '_glow_color_';
  var ugPrefix = 'uniform_glow_color_';

  var glow1 = readGlowHex(entity, 1, wgPrefix);
  var glow2 = readGlowHex(entity, 2, wgPrefix);
  var glow3 = readGlowHex(entity, 3, wgPrefix);
  var glow4 = readGlowHex(entity, 4, wgPrefix);
  var glow5 = readGlowHex(entity, 5, wgPrefix);
  var watchBase = readGlowBase(entity, watchPrefix + '_glow_color_base');

  var uGlow1 = readGlowHex(entity, 1, ugPrefix);
  var uGlow2 = readGlowHex(entity, 2, ugPrefix);
  var uGlow3 = readGlowHex(entity, 3, ugPrefix);
  var uGlow4 = readGlowHex(entity, 4, ugPrefix);
  var uGlow5 = readGlowHex(entity, 5, ugPrefix);
  var uniformBase = readGlowBase(entity, 'uniform_glow_color_base');

  var hasMastercontrol = entity.tags.contains('AlienEvo.MasterControl');

  var nbtData = {
    storedAllDNA: JSON.stringify(allDNA),
    storedAlienCount: storedAlienCount,
    storedAlienNamespaces: JSON.stringify(alienNamespaceData),
    storedCurrentPlaylist: currentPlaylist,
    storedCurrentAlienSlot: currentAlienSlot,
    storedOmnitrixCycle: toJsString(palladium.getProperty(entity, OMNITRIX_PROPERTY_KEY)) ? (parseInt(palladium.getProperty(entity, OMNITRIX_PROPERTY_KEY),10)||0) : 0,
    storedCode: currentCode,
    storedPosition: currentPosition,
    storedMasterTargetCode: masterTargetCode,
    storedSelfDestructTargetCode: selfDestructTargetCode,
    storedMastercontrol: hasMastercontrol,
    storedWatch: watchPrefix
  };
  if (glow1) nbtData.storedGlowColor1 = glow1;
  if (glow2) nbtData.storedGlowColor2 = glow2;
  if (glow3) nbtData.storedGlowColor3 = glow3;
  if (glow4) nbtData.storedGlowColor4 = glow4;
  if (glow5) nbtData.storedGlowColor5 = glow5;
  if (watchBase) nbtData.storedGlowColorBase = watchBase;
  if (uGlow1) nbtData.storedUniformGlowColor1 = uGlow1;
  if (uGlow2) nbtData.storedUniformGlowColor2 = uGlow2;
  if (uGlow3) nbtData.storedUniformGlowColor3 = uGlow3;
  if (uGlow4) nbtData.storedUniformGlowColor4 = uGlow4;
  if (uGlow5) nbtData.storedUniformGlowColor5 = uGlow5;
  if (uniformBase) nbtData.storedUniformGlowColorBase = uniformBase;

  var generatedAlienGlowProps = collectAndResetGeneratedAlienGlowProps(entity);
  if (generatedAlienGlowProps && Object.keys(generatedAlienGlowProps).length) {
    nbtData.storedAlienGlowProps = JSON.stringify(generatedAlienGlowProps);
  }

  var coreItem = Item.of('alienevo:prototype_core', 1, nbtData);
  entity.give(coreItem);

  resetWatchGlowDefaults(entity, watchPrefix);
  resetUniformGlowDefaults(entity);

  palladium.setProperty(entity, OMNITRIX_PROPERTY_KEY, 0);
  entity.persistentData.remove('code');
  entity.persistentData.remove('position');
  entity.persistentData.remove('masterTargetCode');
  entity.persistentData.remove('selfDestructTargetCode');
  entity.server.runCommandSilent('scoreboard players set ' + username + ' code_position 0');
  palladium.setProperty(entity, 'code', '000000');

  entity.persistentData.remove(CURRENT_PLAYLIST_KEY);
  entity.persistentData.remove(CURRENT_ALIEN_SLOT_KEY);

  entity.tags.remove('AlienEvo.MasterControl');
}

function applyAllDNAFromPrototypeCore(entity) {
  var mainHandItem = entity.getMainHandItem();
  if (mainHandItem.id.indexOf('alienevo:prototype_core') !== 0) return;

  var username = entity.getGameProfile().getName();
  var nbt = mainHandItem.nbt;

  if (nbt && nbt.display && nbt.display.Name) {
    entity.persistentData.putString('storedItemName', nbt.display.Name);
  }

  entity.setMainHandItem(Item.of('minecraft:air'));

  if (!nbt) {
    var watchPrefixNoNbt = getWatchPrefix(entity);
    applyCodexGlowDefaultsForWatch(entity, watchPrefixNoNbt);

    var randomMasterCode = generateRandomCode();
    var randomSelfDestructCode = generateRandomCode();
    entity.persistentData.putString('masterTargetCode', randomMasterCode);
    entity.persistentData.putString('selfDestructTargetCode', randomSelfDestructCode);

    palladium.setProperty(entity, OMNITRIX_PROPERTY_KEY, 1);
    giveFirstTenAliensRandomOrder(entity);
    return;
  }

  if (typeof nbt.storedWatch === 'string' && nbt.storedWatch) {
    palladium.setProperty(entity, 'watch', nbt.storedWatch);
  }
  var watchPrefix = (typeof nbt.storedWatch === 'string' && nbt.storedWatch) ? nbt.storedWatch : getWatchPrefix(entity);

  applyCodexGlowDefaultsForWatch(entity, watchPrefix);

  var storedAllDNAString = nbt.storedAllDNA || '';
  if (storedAllDNAString) {
    var storedAllDNA = null;
    try { storedAllDNA = JSON.parse(storedAllDNAString); } catch(e) {}
    var alienNamespaceData = {};
    try {
      if (nbt.storedAlienNamespaces) alienNamespaceData = JSON.parse(nbt.storedAlienNamespaces);
    } catch(e2) { alienNamespaceData = {}; }

    if (storedAllDNA) {
      for (var p in storedAllDNA) {
        for (var s in storedAllDNA[p]) {
          var slotKey = 'alienevo.alien_' + p + '_' + s;
          var ad = storedAllDNA[p][s];
          if (ad && ad.alienId) {
            var aid = ad.alienId;
            entity.persistentData.putInt(slotKey, aid);

            if (ad.alienName) {
              entity.persistentData.putString('alienevo.alien_name_' + aid, ad.alienName);
            }
            if (alienNamespaceData && alienNamespaceData[aid]) {
              var ns = alienNamespaceData[aid].namespace || 'alienevo_aliens';
              var nm = alienNamespaceData[aid].name || ad.alienName || ('alien_' + aid);
              global['alienevo_alien_' + aid] = [ns + ':' + nm];
            }
          }
        }
      }
    } else {
      giveFirstTenAliensRandomOrder(entity);
    }
  } else {
    giveFirstTenAliensRandomOrder(entity);
  }

  var storedCode = nbt.storedCode || '000000';
  var storedPosition = nbt.storedPosition || '0';
  var storedMasterTargetCode = nbt.storedMasterTargetCode || '';
  var storedSelfDestructTargetCode = nbt.storedSelfDestructTargetCode || '';

  entity.persistentData.putString('code', storedCode);
  entity.persistentData.putString('position', storedPosition);
  entity.persistentData.putString('masterTargetCode', storedMasterTargetCode);
  entity.persistentData.putString('selfDestructTargetCode', storedSelfDestructTargetCode);

  entity.server.runCommandSilent('scoreboard players set ' + username + ' code_position ' + parseInt(storedPosition,10));
  palladium.setProperty(entity, 'code', storedCode);

  var storedCurrentPlaylist = nbt.storedCurrentPlaylist || 1;
  var storedCurrentAlienSlot = nbt.storedCurrentAlienSlot || 1;
  entity.persistentData.putInt(CURRENT_PLAYLIST_KEY, storedCurrentPlaylist);
  entity.persistentData.putInt(CURRENT_ALIEN_SLOT_KEY, storedCurrentAlienSlot);

  var storedOmnitrixCycle = (typeof nbt.storedOmnitrixCycle === 'number') ? nbt.storedOmnitrixCycle : 1;
  palladium.setProperty(entity, OMNITRIX_PROPERTY_KEY, storedOmnitrixCycle);

  if (nbt.storedMastercontrol) entity.tags.add('AlienEvo.MasterControl');

  // Restore glow props (watch + uniform), base + 1..5
  var wgPrefix = watchPrefix + '_glow_color_';
  var ugPrefix = 'uniform_glow_color_';

  if (typeof nbt.storedGlowColor1 === 'string') writeGlowHex(entity, 1, nbt.storedGlowColor1, wgPrefix);
  if (typeof nbt.storedGlowColor2 === 'string') writeGlowHex(entity, 2, nbt.storedGlowColor2, wgPrefix);
  if (typeof nbt.storedGlowColor3 === 'string') writeGlowHex(entity, 3, nbt.storedGlowColor3, wgPrefix);
  if (typeof nbt.storedGlowColor4 === 'string') writeGlowHex(entity, 4, nbt.storedGlowColor4, wgPrefix);
  if (typeof nbt.storedGlowColor5 === 'string') writeGlowHex(entity, 5, nbt.storedGlowColor5, wgPrefix);
  if (typeof nbt.storedGlowColorBase === 'string') writeGlowBase(entity, watchPrefix + '_glow_color_base', nbt.storedGlowColorBase);

  if (typeof nbt.storedUniformGlowColor1 === 'string') writeGlowHex(entity, 1, nbt.storedUniformGlowColor1, ugPrefix);
  if (typeof nbt.storedUniformGlowColor2 === 'string') writeGlowHex(entity, 2, nbt.storedUniformGlowColor2, ugPrefix);
  if (typeof nbt.storedUniformGlowColor3 === 'string') writeGlowHex(entity, 3, nbt.storedUniformGlowColor3, ugPrefix);
  if (typeof nbt.storedUniformGlowColor4 === 'string') writeGlowHex(entity, 4, nbt.storedUniformGlowColor4, ugPrefix);
  if (typeof nbt.storedUniformGlowColor5 === 'string') writeGlowHex(entity, 5, nbt.storedUniformGlowColor5, ugPrefix);
  if (typeof nbt.storedUniformGlowColorBase === 'string') writeGlowBase(entity, 'uniform_glow_color_base', nbt.storedUniformGlowColorBase);

  if (typeof nbt.storedAlienGlowProps === 'string' && nbt.storedAlienGlowProps.length) {
    try {
      var parsedAlienGlow = JSON.parse(nbt.storedAlienGlowProps);
      restoreGeneratedAlienGlowProps(entity, parsedAlienGlow);
    } catch (eAG) {
      console.log('Failed to parse storedAlienGlowProps:', eAG);
    }
  }
}

function generateRandomCode() {
  var code = '';
  for (var i = 0; i < 6; i++) code += Math.floor(Math.random() * 10).toString();
  return code;
}

function giveFirstTenAliensRandomOrder(entity) {
  var firstTenAlienIds = [1,2,3,4,5,6,7,8,9,10];
  for (var i = firstTenAlienIds.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = firstTenAlienIds[i]; firstTenAlienIds[i] = firstTenAlienIds[j]; firstTenAlienIds[j] = tmp;
  }
  var playlist = 1;
  for (var slot = 1; slot <= firstTenAlienIds.length; slot++) {
    var key = 'alienevo.alien_' + playlist + '_' + slot;
    entity.persistentData.putInt(key, firstTenAlienIds[slot - 1]);
  }
  for (var s = firstTenAlienIds.length + 1; s <= SLOTS_PER_PLAYLIST; s++) {
    var key2 = 'alienevo.alien_' + playlist + '_' + s;
    entity.persistentData.putInt(key2, 0);
  }
}

StartupEvents.registry('palladium:abilities', function (event) {
  event.create('alienevo:create_all_dna_prototype_core')
    .icon(palladium.createItemIcon('alienevo:prototype_core'))
    .addProperty('property', 'string', 'alienevodnageneration', ':)')
    .tick(function (entity, entry, holder, enabled) {
      if (enabled) createAndGivePrototypeCore(entity);
    });

  event.create('alienevo:apply_dna_from_prototype_core')
    .icon(palladium.createItemIcon('alienevo:prototype_core'))
    .addProperty('property', 'string', 'alienevodnaapplication', ':)')
    .tick(function (entity, entry, holder, enabled) {
      if (enabled) applyAllDNAFromPrototypeCore(entity);
    });
});
