let Minecraft = Java.loadClass('net.minecraft.client.Minecraft');
const RenderSystem = Java.loadClass('com.mojang.blaze3d.systems.RenderSystem');
let SoundEvents = Java.loadClass('net.minecraft.sounds.SoundEvents');

let isPowerScreenClosed = false;
let editingNickname = false;
let editingHexCode = false;
let needsColorRefresh = true;
let selectedTab = 0;
let selectedColorSlot = 0;
let lastUniformType = '';
let lastAlienNumber = 0;
let totalSlots = 0;

let isDraggingAlien = false;
let lastMouseX = 0;
let lastMouseY = 0;
let alienYaw = 0;
let alienPitch = 0;
let hasBeenDragged = false;
let draggedYaw = 0;
let draggedPitch = 0;

const TextFieldWidget = Java.loadClass('net.minecraft.client.gui.components.EditBox');
let nickTextBox = null;
let hexTextBox = null;
let lastAppliedHex = "";
let updatingFromText = false;
let lastBaseH = null, lastBaseS = null, lastBaseL = null;
let currentScreen = null;
let lastTickTime = 0;
let lastScreenWidth = 0;
let lastScreenHeight = 0;
const TICK_INTERVAL = 50;

let GLFW = Java.loadClass('org.lwjgl.glfw.GLFW');
let dragging = false;
let dragOffsetX = 0;
let activeModule = -1; // -1 = no drag
let moduleSize = 10;
let wasPressed = false;

let baseColor = { h: 0, s: 0, l: 0 };
let colorPalette = [];
let manuallyEditedColors = [false, false, false, false, false];
let currentInputSlot = 2;
let currentTab = null;
let previousTab = null;

let trackOffsets = {
    hue: { x: 139, y: -37 },   // hue
    saturation: { x: 139, y: -25 }, // saturation
    lightness: { x: 139, y: -13 }   // lightness
};
let trackWidth = 115;
let trackHeight = 2;

let sliders = [
    {
        x: 0, y: 0,
        name: 'Hue',
        value: 0,
        max: 360
    },
    {
        x: 0, y: 0,
        name: 'Saturation',
        value: 0,
        max: 100
    },
    {
        x: 0, y: 0,
        name: 'Lightness',
        value: 0,
        max: 100
    }
];

PalladiumEvents.registerGuiOverlays((event) => {
    event.register('alienevo/power_screen_reset', (minecraft) => {
        let player = minecraft.player;
        if (minecraft.screen != null && minecraft.screen.getClass().getSimpleName().equals("PowersScreen")) {
            if (player && needsColorRefresh) {
                refreshColorInterface(player);
                loadPaletteFromProperties(player);
                needsColorRefresh = false;
                hasBeenDragged = false;
                isDraggingAlien = false;
                alienYaw = 0;
                alienPitch = 0;
            }
        } else {
            needsColorRefresh = true;
        }

        if (isPowerScreenClosed === true && minecraft.screen != null && !minecraft.screen.getClass().getSimpleName().equals("PowersScreen")) {
            isPowerScreenClosed = false;
        }

        if (editingNickname === true && minecraft.screen != null && !minecraft.screen.getClass().getSimpleName().equals("PowersScreen")) {
            editingNickname = false;
        }
        if (editingHexCode === true && minecraft.screen != null && !minecraft.screen.getClass().getSimpleName().equals("PowersScreen")) {
            editingHexCode = false;
        }

        if (nickTextBox !== null && isPowerScreenClosed === true) {
            nickTextBox.setVisible(false);
            nickTextBox.setEditable(false);
        }
        if (hexTextBox !== null && isPowerScreenClosed === true) {
            hexTextBox.setVisible(false);
            hexTextBox.setEditable(false);
        }

        let watchType = palladium.getProperty(player, 'watch');
        let uniformType = palladium.getProperty(player, 'uniform') || 'default';
        let omnitrixColor = palladium.getProperty(player, `${watchType}_glow_color_1`);
        let beamColor = palladium.getProperty(player, `galvanic_mechamorph_beam_color`);
        if (omnitrixColor && beamColor !== omnitrixColor) {
            //palladium.setProperty(player, 'galvanic_mechamorph_beam_color', omnitrixColor);
            player.sendData("saveBeamColorData", { value: omnitrixColor });
        }

        let currentAlienNumber = palladium.getProperty(player, 'omnitrix_cycle');
        let alienInfo = global['alienevo_alien_' + currentAlienNumber];
        let alienFullName = alienInfo[0];
        let alienName = alienFullName.includes(':') ? alienFullName.split(':')[1] : alienFullName;
        let energyColor = palladium.getProperty(player, `${alienName}_energy_color`);

        if (currentAlienNumber == 4) {
            let skinColor = palladium.getProperty(player, `${alienName}_${uniformType}_skincolor_palette_1_color_3`);
            if (energyColor != skinColor) {
                energyColor = skinColor;
                //palladium.setProperty(player, `${alienName}_energy_color`, energyColor);
                player.sendData("saveEnergyColorData", { value: energyColor });
            }
        }

        if (currentAlienNumber == 11) {
            let skinColor = palladium.getProperty(player, `${alienName}_${uniformType}_skincolor_palette_1_color_1`);
            if (energyColor != skinColor) {
                energyColor = skinColor;
                //palladium.setProperty(player, `${alienName}_energy_color`, energyColor);
                player.sendData("saveEnergyColorData", { value: energyColor });
            }
        }
    })
});

function isMouseOverAlien(mouseX, mouseY, player_x, player_y, player_size) {
    let padding = 20;
    let alienLeft = player_x - player_size / 2 - padding;
    let alienRight = player_x + player_size / 2 + padding;
    let alienTop = player_y - player_size - padding;
    let alienBottom = player_y + padding;

    return mouseX >= alienLeft && mouseX <= alienRight &&
        mouseY >= alienTop && mouseY <= alienBottom;
}

function drawWrappedText(guiGraphics, text, x, y, maxWidth, lineHeight, alienColor, defaultColor) {
    let mutableText = '' + text;
    let processedWords = [];
    let processedText = '';
    let i = 0;
    while (i < mutableText.length) {
        if (mutableText[i] === '<') {
            let endIndex = mutableText.indexOf('>', i);
            if (endIndex !== -1) {
                let insideText = mutableText.substring(i + 1, endIndex);
                processedText += `§${insideText}§`;
                i = endIndex + 1;
            } else {
                processedText += mutableText[i];
                i++;
            }
        } else {
            processedText += mutableText[i];
            i++;
        }
    }
    let words = processedText.split(' ');
    words.forEach(word => {
        if (word.startsWith('§') && word.endsWith('§') && word.length > 2) {
            let cleanWord = word.slice(1, -1);
            processedWords.push({ text: cleanWord, useAlienColor: true });
        }
        else {
            processedWords.push({ text: word, useAlienColor: false });
        }
    });
    let lines = [];
    let currentLine = [];
    let currentLineText = '';
    for (let wordObj of processedWords) {
        let testLine = currentLineText + (currentLineText ? ' ' : '') + wordObj.text;
        let testWidth = Minecraft.getInstance().font.width(testLine);
        if (testWidth <= maxWidth || currentLineText === '') {
            currentLine.push(wordObj);
            currentLineText = testLine;
        } else {
            lines.push(currentLine);
            currentLine = [wordObj];
            currentLineText = wordObj.text;
            if (Minecraft.getInstance().font.width(wordObj.text) > maxWidth) {
                let brokenWord = '';
                let remainingText = wordObj.text;
                for (let char of wordObj.text) {
                    let testChar = brokenWord + char;
                    if (Minecraft.getInstance().font.width(testChar) <= maxWidth) {
                        brokenWord = testChar;
                    } else {
                        if (brokenWord) {
                            lines.push([{ text: brokenWord, useAlienColor: wordObj.useAlienColor }]);
                            remainingText = remainingText.substring(brokenWord.length);
                            brokenWord = char;
                        } else {
                            lines.push([{ text: char, useAlienColor: wordObj.useAlienColor }]);
                            remainingText = remainingText.substring(1);
                            brokenWord = '';
                        }
                    }
                }
                if (brokenWord) {
                    currentLine = [{ text: brokenWord, useAlienColor: wordObj.useAlienColor }];
                    currentLineText = brokenWord;
                } else {
                    currentLine = [];
                    currentLineText = '';
                }
            }
        }
    }
    if (currentLine.length > 0) {
        lines.push(currentLine);
    }
    lines.forEach((line, lineIndex) => {
        let currentX = x;
        line.forEach((wordObj, wordIndex) => {
            let color = wordObj.useAlienColor ? alienColor : defaultColor;
            palladium.gui.drawString(guiGraphics,
                Component.string(wordObj.text),
                currentX,
                y + (lineIndex * lineHeight),
                color
            );
            currentX += Minecraft.getInstance().font.width(wordObj.text + ' ');
        });
    });
    return {
        height: lines.length * lineHeight,
        lineCount: lines.length,
        wrapCount: lines.length - 1
    }
}
function drawBar(guiGraphics, x, y, value, min, max, width, height, baseTexturePath) {
    let clampedValue = Math.max(min, Math.min(value, max));
    let fillPercent = (clampedValue - min) / (max - min);
    let fillWidth = Math.floor(fillPercent * width);

    let suffix = "0";
    if (fillPercent > 0.66) {
        suffix = "2";
    } else if (fillPercent > 0.33) {
        suffix = "1";
    }

    let barTexture = `${baseTexturePath}${suffix}.png`;

    guiGraphics.blit(
        new ResourceLocation(barTexture),
        x, y,
        0, 0,
        fillWidth, height,
        width, height
    );
}

function refreshColorInterface(player) {
    let currentAlienNumber = palladium.getProperty(player, 'omnitrix_cycle');
    let uniformType = palladium.getProperty(player, 'uniform') || 'default';
    let totalSlots = getTotalColorSlots(currentAlienNumber, uniformType, currentTab);

    if (selectedColorSlot >= totalSlots) {
        selectedColorSlot = 0;
    }

    changeColorSlot(selectedColorSlot, player, currentTab);
}
function updateExtendedPalettes(currentAlienNumber, uniformType, slotInfo, colorPalette, propertiesToSave) {
    if (currentAlienNumber == 1 && slotInfo.type === 'skin') {
        let alienInfo = global['alienevo_alien_' + currentAlienNumber];
        if (alienInfo && alienInfo[0]) {
            let alienFullName = alienInfo[0];
            let alienName = alienFullName.includes(':') ?
                alienFullName.split(':')[1] : alienFullName;

            if (slotInfo.index == 1 || slotInfo.index == 2) {
                let darknessDivisor = slotInfo.index == 1 ? 4 : 3; // palette 1: /4, palette 2: /3
                let darkerL = baseColor.l / darknessDivisor;

                // Generate darker palette
                generatePalette(baseColor.h, baseColor.s, darkerL);

                // Save the darker colors to extended palette
                for (let i = 0; i < colorPalette.length; i++) {
                    let hexColor = rgbToHexString(colorPalette[i].r, colorPalette[i].g, colorPalette[i].b);
                    let reversedIndex = colorPalette.length - i;
                    let extPropertyName = alienName + '_' + uniformType + '_skincolor_palette_' + slotInfo.index + '_ext_color_' + reversedIndex;
                    propertiesToSave[extPropertyName] = hexColor;
                }

                // Restore original palette
                generatePalette(baseColor.h, baseColor.s, baseColor.l);
            }
        }
    }

    if (currentAlienNumber == 10 && slotInfo.type === 'skin') {
        let alienInfo = global['alienevo_alien_' + currentAlienNumber];
        if (alienInfo && alienInfo[0]) {
            let alienFullName = alienInfo[0];
            let alienName = alienFullName.includes(':') ?
                alienFullName.split(':')[1] : alienFullName;

            if (slotInfo.index == 1 || slotInfo.index == 2) {
                let invertedH = baseColor.h;
                let invertedS = baseColor.s;
                let invertedL = 100 - baseColor.l; // Invert lightness

                // Generate inverted palette
                generatePalette(invertedH, invertedS, invertedL);

                // Save the inverted colors to inv palette
                for (let i = 0; i < colorPalette.length; i++) {
                    let hexColor = rgbToHexString(colorPalette[i].r, colorPalette[i].g, colorPalette[i].b);
                    let reversedIndex = colorPalette.length - i;
                    let invPropertyName = alienName + '_' + uniformType + '_skincolor_palette_' + slotInfo.index + '_inv_color_' + reversedIndex;
                    propertiesToSave[invPropertyName] = hexColor;
                }

                // Save the inverted base color
                let invBasePropertyName = alienName + '_' + uniformType + '_skincolor_palette_' + slotInfo.index + '_inv_base';
                propertiesToSave[invBasePropertyName] = invertedH + ',' + invertedS + ',' + invertedL;

                // Restore original palette
                generatePalette(baseColor.h, baseColor.s, baseColor.l);
            }
        }
    }
}

function resetExtendedPalettes(currentAlienNumber, uniformType, slotInfo, propertiesToSave) {
    if (currentAlienNumber == 1 && slotInfo.type === 'skin' && (slotInfo.index == 1 || slotInfo.index == 2)) {
        let alienInfo = global['alienevo_alien_' + currentAlienNumber];
        if (alienInfo && alienInfo[0]) {
            let alienFullName = alienInfo[0];
            let alienName = alienFullName.includes(':') ?
                alienFullName.split(':')[1] : alienFullName;

            let originalExtColors = global['alienevo_' + currentAlienNumber + '_' + uniformType + '_skincolor_palette_' + slotInfo.index + '_ext'];

            if (originalExtColors && originalExtColors.length > 0) {
                // Reset to original ext colors
                for (let i = 1; i <= originalExtColors.length; i++) {
                    let extPropertyName = alienName + '_' + uniformType + '_skincolor_palette_' + slotInfo.index + '_ext_color_' + i;
                    let arrayIndex = i - 1;
                    propertiesToSave[extPropertyName] = originalExtColors[arrayIndex];
                }

                // Reset the base for the ext palette
                let extBasePropertyName = alienName + '_' + uniformType + '_skincolor_palette_' + slotInfo.index + '_ext_base';
                propertiesToSave[extBasePropertyName] = "0,0,0";
            }
        }
    }

    if (currentAlienNumber == 10 && slotInfo.type === 'skin' && (slotInfo.index == 1 || slotInfo.index == 2)) {
        let alienInfo = global['alienevo_alien_' + currentAlienNumber];
        if (alienInfo && alienInfo[0]) {
            let alienFullName = alienInfo[0];
            let alienName = alienFullName.includes(':') ?
                alienFullName.split(':')[1] : alienFullName;

            let originalInvColors = global['alienevo_' + currentAlienNumber + '_' + uniformType + '_skincolor_palette_' + slotInfo.index + '_inv'];

            if (originalInvColors && originalInvColors.length > 0) {
                // Reset to original inv colors
                for (let i = 1; i <= originalInvColors.length; i++) {
                    let invPropertyName = alienName + '_' + uniformType + '_skincolor_palette_' + slotInfo.index + '_inv_color_' + i;
                    let arrayIndex = i - 1;
                    propertiesToSave[invPropertyName] = originalInvColors[arrayIndex];
                }

                // Reset the base for the inv palette
                let invBasePropertyName = alienName + '_' + uniformType + '_skincolor_palette_' + slotInfo.index + '_inv_base';
                propertiesToSave[invBasePropertyName] = "0,0,0";
            }
        }
    }
}
function isUniformSlotEnabled(alienId, slotIndex, currentTab) {
    let player = Client.Player || Minecraft.getInstance().player;
    let uniformType = palladium.getProperty(player, 'uniform') || 'default';
    let watch = palladium.getProperty(player, 'watch');
    let watch_namespace = palladium.getProperty(player, 'watch_namespace');
    let omnitrixTab = `${watch_namespace}:${watch}_omnitrix`;
    if (currentTab === omnitrixTab || !alienId) {
        return true;
    }

    let uniformsConfig = global[`alienevo_${alienId}_${uniformType}_uniforms`];
    if (uniformsConfig && Array.isArray(uniformsConfig)) {
        return uniformsConfig[slotIndex] !== false;
    }
    return true;
}
function getTotalColorSlots(alienId, uniformName, currentTab) {
    let player = Client.Player || Minecraft.getInstance().player;
    let watch = palladium.getProperty(player, 'watch');
    let watch_namespace = palladium.getProperty(player, 'watch_namespace');
    let omnitrixTab = `${watch_namespace}:${watch}_omnitrix`;
    if (currentTab === omnitrixTab) {
        return 3;
    }

    if (!uniformName) {
        uniformName = 'default';
    }

    let enabledUniformSlots = 0;
    for (let i = 0; i < 3; i++) {
        if (isUniformSlotEnabled(alienId, i, currentTab)) {
            enabledUniformSlots++;
        }
    }

    let skinPalettes = 0;
    let paletteIndex = 1;

    while (global['alienevo_' + alienId + '_' + uniformName + '_skincolor_palette_' + paletteIndex]) {
        skinPalettes++;
        paletteIndex++;
    }

    return enabledUniformSlots + skinPalettes;
}
function getSlotInfo(slotIndex, alienId, uniformName, currentTab) {
    if (!uniformName) {
        uniformName = 'default';
    }
    let player = Client.Player || Minecraft.getInstance().player;
    let watch = palladium.getProperty(player, 'watch');
    let watch_namespace = palladium.getProperty(player, 'watch_namespace');
    let omnitrixTab = `${watch_namespace}:${watch}_omnitrix`;

    // Omnitrix tab: ONLY glow/primary/secondary; never skin
    if (currentTab === omnitrixTab) {
        let idx = slotIndex;
        if (idx < 0) idx = 0;
        if (idx > 2) idx = 2;
        return {
            type: 'uniform',
            index: idx,
            name: ['glow', 'primary', 'secondary'][idx]
        };
    }

    // Normal (alien) tabs:
    let uniformSlotIndex = -1;
    let enabledSlotCount = 0;

    for (let i = 0; i < 3; i++) {
        if (isUniformSlotEnabled(alienId, i, currentTab)) {
            if (enabledSlotCount === slotIndex) {
                uniformSlotIndex = i;
                break;
            }
            enabledSlotCount++;
        }
    }

    if (uniformSlotIndex !== -1) {
        return {
            type: 'uniform',
            index: uniformSlotIndex,
            name: ['glow', 'primary', 'secondary'][uniformSlotIndex]
        };
    } else {
        let skinSlotIndex = slotIndex - enabledSlotCount + 1;
        return {
            type: 'skin',
            index: skinSlotIndex,
            name: 'skin_palette_' + skinSlotIndex,
            colors: global['alienevo_' + alienId + '_' + uniformName + '_skincolor_palette_' + skinSlotIndex]
        };
    }
}
function updateSliderPosition(sliderIndex, screenCenterX, screenCenterY) {
    let slider = sliders[sliderIndex];
    let trackKey = ['hue', 'saturation', 'lightness'][sliderIndex];
    let trackOffset = trackOffsets[trackKey];
    let trackStartX = screenCenterX + trackOffset.x;
    let trackStartY = screenCenterY + trackOffset.y;

    let normalizedValue = slider.value / slider.max;
    let sliderX = trackStartX + (normalizedValue * trackWidth) - (moduleSize / 2);
    let sliderY = trackStartY - (moduleSize / 2) + (trackHeight / 2);

    slider.x = sliderX;
    slider.y = sliderY;
}
function getTrackBounds(sliderIndex, screenCenterX, screenCenterY) {
    let trackKey = ['hue', 'saturation', 'lightness'][sliderIndex];
    let trackOffset = trackOffsets[trackKey];

    let trackStartX = screenCenterX + trackOffset.x;
    let trackEndX = trackStartX + trackWidth;

    let minX = trackStartX - (moduleSize / 2);
    let maxX = trackEndX - (moduleSize / 2);

    return { minX: minX, maxX: maxX, trackStartX: trackStartX };
}
function hslToRgb(h, s, l) {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        let hue2rgb = function (p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
function rgbToHex(r, g, b) {
    let color = (255 << 24) | (r << 16) | (g << 8) | b;
    if (color > 2147483647) {
        color = color - 4294967296;
    }
    return color;
}
function rgbToHexString(r, g, b) {
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');

    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;

    return { r: r, g: g, b: b };
}
function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}
const saturationControlPoints = [
    { hue: 0, multiplier: 0.75 },
    { hue: 25, multiplier: 1.2 },
    { hue: 45, multiplier: 0.97 },
    { hue: 90, multiplier: 0.72 },
    { hue: 120, multiplier: 0.70 },
    { hue: 150, multiplier: 0.69 },
    { hue: 180, multiplier: 0.68 },
    { hue: 210, multiplier: 0.70 },
    { hue: 240, multiplier: 0.94 },
    { hue: 270, multiplier: 0.87 },
    { hue: 300, multiplier: 0.90 },
    { hue: 330, multiplier: 1.00 },
    { hue: 360, multiplier: 0.75 }
];
const hueShiftControlPoints = [
    { hue: 0, shift: 3 },
    { hue: 25, shift: 8 },
    { hue: 40, shift: 3 },
    { hue: 90, shift: -3 },
    { hue: 120, shift: -5 },
    { hue: 150, shift: -6 },
    { hue: 180, shift: -8 },
    { hue: 210, shift: -6 },
    { hue: 240, shift: -3 },
    { hue: 270, shift: 4 },
    { hue: 300, shift: 6 },
    { hue: 330, shift: 8 },
    { hue: 360, shift: 3 }
];
function catmullRomSpline(t, p0, p1, p2, p3) {
    const t2 = t * t;
    const t3 = t2 * t;

    return 0.5 * (
        (2 * p1) +
        (-p0 + p2) * t +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
        (-p0 + 3 * p1 - 3 * p2 + p3) * t3
    );
}
function interpolateFromControlPoints(hue, controlPoints, valueKey) {
    hue = ((hue % 360) + 360) % 360;

    let segment = -1;
    for (let i = 0; i < controlPoints.length - 1; i++) {
        if (hue >= controlPoints[i].hue && hue <= controlPoints[i + 1].hue) {
            segment = i;
            break;
        }
    }

    if (segment === -1) return valueKey === 'multiplier' ? 1.0 : 0.0;

    // four control points
    const p0 = segment > 0 ? controlPoints[segment - 1][valueKey] : controlPoints[controlPoints.length - 2][valueKey];
    const p1 = controlPoints[segment][valueKey];
    const p2 = controlPoints[segment + 1][valueKey];
    const p3 = segment < controlPoints.length - 2 ? controlPoints[segment + 2][valueKey] : controlPoints[1][valueKey];

    const startHue = controlPoints[segment].hue;
    const endHue = controlPoints[segment + 1].hue;
    const t = (hue - startHue) / (endHue - startHue);

    return catmullRomSpline(t, p0, p1, p2, p3);
}
function getSaturationMultiplier(hue) {
    return interpolateFromControlPoints(hue, saturationControlPoints, 'multiplier');
}
function getHueShift(hue) {
    return interpolateFromControlPoints(hue, hueShiftControlPoints, 'shift');
}
function calculateHueShiftForSlot(baseHue, inputSlot, currentSlot) {
    if (currentSlot === inputSlot) {
        return 0;
    }
    const baseShiftAmount = getHueShift(baseHue);
    const distance = currentSlot - inputSlot;

    // get shift intensity based on distance from input slot
    const maxDistance = 2;
    const shiftIntensity = Math.abs(distance) / maxDistance;
    const direction = distance < 0 ? -1 : 1;

    return baseShiftAmount * shiftIntensity * direction;
}
function generatePalette(baseH, baseS, baseL) {
    let paletteSize = colorPalette.length || 5;

    let inputSlot;
    if (baseL < 20) {
        inputSlot = 0;
    } else if (baseL < 40) {
        inputSlot = Math.floor(paletteSize * 0.2);
    } else if (baseL < 60) {
        inputSlot = Math.floor(paletteSize * 0.4);
    } else if (baseL < 80) {
        inputSlot = Math.floor(paletteSize * 0.6);
    } else {
        inputSlot = paletteSize - 1;
    }

    currentInputSlot = inputSlot;
    let variations = [];
    const saturationMultiplier = getSaturationMultiplier(baseH);
    let lightnessMultiplier = 1.0;

    try {
        let player = Client.Player || Minecraft.getInstance().player;
        if (player) {
            let currentAlienNumber = palladium.getProperty(player, 'omnitrix_cycle');
            let uniformType = palladium.getProperty(player, 'uniform');
            let slotInfo = getSlotInfo(selectedColorSlot, currentAlienNumber, uniformType, currentTab);

            if (slotInfo.type === 'skin' && slotInfo.colors && slotInfo.colors.length > 1) {
                // get the brightest and darkest colors from the skin palette
                let brightestHex = slotInfo.colors[0];
                let darkestHex = slotInfo.colors[slotInfo.colors.length - 1];

                // convert hex to RGB then to HSL to get lightness
                let brightestRgb = hexToRgb(brightestHex);
                let darkestRgb = hexToRgb(darkestHex);

                let brightestHsl = rgbToHsl(brightestRgb.r, brightestRgb.g, brightestRgb.b);
                let darkestHsl = rgbToHsl(darkestRgb.r, darkestRgb.g, darkestRgb.b);

                // calculate the lightness difference and use as multiplier
                let existingLightnessDiff = brightestHsl[2] - darkestHsl[2];
                lightnessMultiplier = existingLightnessDiff / 25; // Adjustable divisor

                // prevent overflow
                lightnessMultiplier = Math.max(0.1, Math.min(2.0, lightnessMultiplier));
            }
        }
    } catch (error) {
        lightnessMultiplier = 1.0;
    }

    for (let i = 0; i < paletteSize; i++) {
        let t = i / (paletteSize - 1);
        let lightnessRatio = baseL / 100;

        let exponent = 2 - lightnessRatio;
        let minLightness = lightnessRatio * 20;
        let maxLightness = Math.min(100, 20 + lightnessRatio * 80);

        let contrastReduction = 0.3 + (lightnessRatio * 0.35);
        let range = maxLightness - minLightness;
        let adjustedRange = range * (1 - contrastReduction);
        let rangeReduction = (range - adjustedRange);

        minLightness += rangeReduction;
        if (baseL === 100) {
            maxLightness = 100;
        }

        let lightness = minLightness + (maxLightness - minLightness) * Math.pow(t, exponent) * lightnessMultiplier;

        lightness = Math.max(0, Math.min(100, lightness));

        let darknessRatio = (paletteSize - 1 - i) / (paletteSize - 1);
        let saturationBoost = darknessRatio * (saturationMultiplier - 1);
        let adjustedSaturation = Math.min(100, Math.max(0, baseS * (1 + saturationBoost)));

        // let maxDistance = Math.floor((paletteSize - 1) / 2);
        let hueShift = calculateHueShiftForSlot(baseH, inputSlot, i);
        let adjustedHue = ((baseH + hueShift) % 360 + 360) % 360;

        variations[i] = {
            h: adjustedHue,
            s: adjustedSaturation,
            l: lightness
        };
    }

    for (let i = 0; i < variations.length; i++) {
        if (!manuallyEditedColors[i]) {
            let variation = variations[i];
            let rgb = hslToRgb(variation.h, variation.s, variation.l);
            colorPalette[i] = {
                r: rgb[0],
                g: rgb[1],
                b: rgb[2],
                h: variation.h,
                s: variation.s,
                l: variation.l
            };
        }
    }
}
function getPropertyPrefix(slot) {
    switch (slot) {
        case 0: return 'uniform_glow_color';
        case 1: return 'uniform_primary_color';
        case 2: return 'uniform_secondary_color';
        default: return 'uniform_secondary_color';
    }
}
function changeColorSlot(newSlot, player, currentTab) {
    let currentAlienNumber = palladium.getProperty(player, 'omnitrix_cycle');
    let uniformType = palladium.getProperty(player, 'uniform');
    let totalSlots = getTotalColorSlots(currentAlienNumber, uniformType, currentTab);

    let actualNewSlot = ((newSlot % totalSlots) + totalSlots) % totalSlots;
    selectedColorSlot = actualNewSlot;

    let slotInfo = getSlotInfo(selectedColorSlot, currentAlienNumber, uniformType, currentTab);

    if (slotInfo.type === 'uniform') {
        // Ensure uniform uses 5-shade palette
        if (colorPalette.length !== 5) {
            colorPalette = new Array(5);
            for (let i = 0; i < 5; i++) {
                colorPalette[i] = { r: 255, g: 255, b: 255, h: 0, s: 0, l: 100 };
            }
        }

        loadPaletteFromProperties(player);
        generatePalette(baseColor.h, baseColor.s, baseColor.l);
    } else if (slotInfo.type === 'skin') {
        if (slotInfo.colors) {
            let targetSize = slotInfo.colors.length;
            // Resize colorPalette to match skin palette size
            if (colorPalette.length !== targetSize) {
                colorPalette = new Array(targetSize);
                for (let i = 0; i < targetSize; i++) {
                    colorPalette[i] = { r: 255, g: 255, b: 255, h: 0, s: 0, l: 100 };
                }
            }
        }

        loadPaletteFromProperties(player);
        generatePalette(baseColor.h, baseColor.s, baseColor.l);
    }

}
function savePaletteToProperties(player) {
    try {
        let currentAlienNumber = palladium.getProperty(player, 'omnitrix_cycle');
        let uniformType = palladium.getProperty(player, 'uniform');
        let slotInfo = getSlotInfo(selectedColorSlot, currentAlienNumber, uniformType, currentTab);

        let propertiesToSave = {};

        if (slotInfo.type === 'uniform') {
            let prefix = getPropertyPrefix(slotInfo.index);
            propertiesToSave[prefix + '_base'] = baseColor.h + ',' + baseColor.s + ',' + baseColor.l;
            propertiesToSave[prefix + '_1'] = rgbToHexString(colorPalette[4].r, colorPalette[4].g, colorPalette[4].b);
            propertiesToSave[prefix + '_2'] = rgbToHexString(colorPalette[3].r, colorPalette[3].g, colorPalette[3].b);
            propertiesToSave[prefix + '_3'] = rgbToHexString(colorPalette[2].r, colorPalette[2].g, colorPalette[2].b);
            propertiesToSave[prefix + '_4'] = rgbToHexString(colorPalette[1].r, colorPalette[1].g, colorPalette[1].b);
            propertiesToSave[prefix + '_5'] = rgbToHexString(colorPalette[0].r, colorPalette[0].g, colorPalette[0].b);

            if (slotInfo.index === 0) { // glow
                let glowColor1 = rgbToHexString(colorPalette[4].r, colorPalette[4].g, colorPalette[4].b);
                let glowColor2 = rgbToHexString(colorPalette[3].r, colorPalette[3].g, colorPalette[3].b);
                let glowColor3 = rgbToHexString(colorPalette[2].r, colorPalette[2].g, colorPalette[2].b);
                let glowColor4 = rgbToHexString(colorPalette[1].r, colorPalette[1].g, colorPalette[1].b);
                let glowColor5 = rgbToHexString(colorPalette[0].r, colorPalette[0].g, colorPalette[0].b);

                let watchType = palladium.getProperty(player, 'watch');

                // Update glow colors
                for (let alienId = 1; alienId <= 1000; alienId++) {
                    let alienInfo = global[`alienevo_alien_${alienId}`];
                    if (alienInfo && alienInfo[0]) {
                        let alienFullName = alienInfo[0];
                        let alienName = alienFullName.includes(':') ?
                            alienFullName.split(':')[1] : alienFullName;

                        ['default', '10k', 'prototype'].forEach(uniformVariant => {
                            let glowcolorIndex = 1;
                            while (global[`alienevo_${alienId}_${uniformVariant}_glowcolor_${glowcolorIndex}`]) {
                                let glowPalette = global[`alienevo_${alienId}_${uniformVariant}_glowcolor_${glowcolorIndex}`];

                                // Update colors based on the original palette size
                                for (let colorIndex = 1; colorIndex <= glowPalette.length; colorIndex++) {
                                    let propertyName = `${alienName}_${uniformVariant}_glowcolor_${glowcolorIndex}_color_${colorIndex}`;

                                    let paletteColor;
                                    switch (colorIndex) {
                                        case 1: paletteColor = glowColor1; break;
                                        case 2: paletteColor = glowColor2; break;
                                        case 3: paletteColor = glowColor3; break;
                                        case 4: paletteColor = glowColor4; break;
                                        case 5: paletteColor = glowColor5; break;
                                        default: paletteColor = glowColor1; // fallback
                                    }
                                    propertiesToSave[propertyName] = paletteColor;
                                }
                                glowcolorIndex++;
                            }
                        });
                    }
                }
                propertiesToSave[`${watchType}_glow_color_1`] = glowColor1;
                propertiesToSave[`${watchType}_glow_color_2`] = glowColor2;
                propertiesToSave[`${watchType}_glow_color_3`] = glowColor3;
                propertiesToSave[`${watchType}_glow_color_4`] = glowColor4;
                propertiesToSave[`${watchType}_glow_color_5`] = glowColor5;
            }

            if (currentAlienNumber == 5) {
                let suitPrefix = slotInfo.index === 1 ? 'suit_primary_color' : 'suit_secondary_color';
                for (let i = 0; i < colorPalette.length; i++) {
                    let colorIndex = colorPalette.length - i;
                    let suitPropertyName = suitPrefix + '_' + colorIndex;
                    let hexColor = rgbToHexString(colorPalette[i].r, colorPalette[i].g, colorPalette[i].b);
                    propertiesToSave[suitPropertyName] = hexColor;
                }
                propertiesToSave[suitPrefix + '_base'] = baseColor.h + ',' + baseColor.s + ',' + baseColor.l;
            }
        } else if (slotInfo.type === 'skin') {
            let alienInfo = global['alienevo_alien_' + currentAlienNumber];
            if (alienInfo && alienInfo[0]) {
                let alienFullName = alienInfo[0];
                let alienName = alienFullName.includes(':') ?
                    alienFullName.split(':')[1] : alienFullName;

                for (let i = 0; i < colorPalette.length; i++) {
                    if (colorPalette[i]) {
                        let reversedIndex = colorPalette.length - i;
                        let propertyName = alienName + '_' + uniformType + '_skincolor_palette_' + slotInfo.index + '_color_' + reversedIndex;
                        propertiesToSave[propertyName] = rgbToHexString(colorPalette[i].r, colorPalette[i].g, colorPalette[i].b);
                    }
                }

                let basePropertyName = alienName + '_' + uniformType + '_skincolor_palette_' + slotInfo.index + '_base';
                propertiesToSave[basePropertyName] = baseColor.h + ',' + baseColor.s + ',' + baseColor.l;
            }
        }
        updateExtendedPalettes(currentAlienNumber, uniformType, slotInfo, colorPalette, propertiesToSave);
        Client.player.sendData("savePaletteData", propertiesToSave);

    } catch (error) {
        console.log("Error preparing palette data:", error);
    }
}
function loadPaletteFromProperties(player) {
    try {
        let currentAlienNumber = palladium.getProperty(player, 'omnitrix_cycle');
        let uniformType = palladium.getProperty(player, 'uniform');
        let slotInfo = getSlotInfo(selectedColorSlot, currentAlienNumber, uniformType, currentTab);

        if (slotInfo.type === 'uniform') {
            let prefix = getPropertyPrefix(selectedColorSlot);

            let baseHSLString = palladium.getProperty(player, prefix + '_base') || '0,0,0';
            let hslValues = baseHSLString.split(',').map(v => parseFloat(v));
            baseColor.h = hslValues[0];
            baseColor.s = hslValues[1];
            baseColor.l = hslValues[2];

            sliders[0].value = baseColor.h;
            sliders[1].value = baseColor.s;
            sliders[2].value = baseColor.l;

            let color1 = palladium.getProperty(player, prefix + '_1') || "ffffff";
            let color2 = palladium.getProperty(player, prefix + '_2') || "edf4f4";
            let color3 = palladium.getProperty(player, prefix + '_3') || "d6dfe1";
            let color4 = palladium.getProperty(player, prefix + '_4') || "bdc7cf";
            let color5 = palladium.getProperty(player, prefix + '_5') || "97a2b0";

            // palette order: [Dark, Darker, Base, Lighter, Light]
            let colors = [color5, color4, color3, color2, color1];

            for (let i = 0; i < colors.length; i++) {
                let rgb = hexToRgb(colors[i]);
                colorPalette[i] = {
                    r: rgb.r,
                    g: rgb.g,
                    b: rgb.b,
                    h: 0,
                    s: 0,
                    l: 0
                };

                let hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                colorPalette[i].h = hsl[0];
                colorPalette[i].s = hsl[1];
                colorPalette[i].l = hsl[2];
            }
        } else if (slotInfo.type === 'skin') {
            let alienInfo = global['alienevo_alien_' + currentAlienNumber];
            if (alienInfo && alienInfo[0] && slotInfo.colors) {
                let alienFullName = alienInfo[0];
                let alienName = alienFullName.includes(':') ?
                    alienFullName.split(':')[1] : alienFullName;

                colorPalette = [];
                for (let index = 0; index < slotInfo.colors.length; index++) {
                    let hexColor = slotInfo.colors[index];
                    let r = parseInt(hexColor.substring(0, 2), 16);
                    let g = parseInt(hexColor.substring(2, 4), 16);
                    let b = parseInt(hexColor.substring(4, 6), 16);

                    colorPalette[index] = { r: r, g: g, b: b, h: 0, s: 0, l: 0 };

                    let hsl = rgbToHsl(r, g, b);
                    colorPalette[index].h = hsl[0];
                    colorPalette[index].s = hsl[1];
                    colorPalette[index].l = hsl[2];
                }

                // Load base color
                let basePropertyName = alienName + '_' + uniformType + '_skincolor_palette_' + slotInfo.index + '_base';
                let baseHSLString = palladium.getProperty(player, basePropertyName);

                if (baseHSLString) {
                    let hslValues = baseHSLString.split(',').map(v => parseFloat(v));
                    baseColor.h = hslValues[0];
                    baseColor.s = hslValues[1];
                    baseColor.l = hslValues[2];
                } else {
                    // Use middle color as base
                    let middleIndex = Math.floor(slotInfo.colors.length / 2);
                    if (colorPalette[middleIndex]) {
                        baseColor.h = colorPalette[middleIndex].h;
                        baseColor.s = colorPalette[middleIndex].s;
                        baseColor.l = colorPalette[middleIndex].l;
                    }
                }

                sliders[0].value = baseColor.h;
                sliders[1].value = baseColor.s;
                sliders[2].value = baseColor.l;
                for (let i = 1; i <= slotInfo.colors.length; i++) {
                    let colorPropertyName = alienName + '_' + uniformType + '_skincolor_palette_' + slotInfo.index + '_color_' + i;
                    let savedColor = palladium.getProperty(player, colorPropertyName);

                    if (savedColor) {
                        let paletteIndex = slotInfo.colors.length - i;
                        let rgb = hexToRgb(savedColor);

                        if (colorPalette[paletteIndex]) {
                            colorPalette[paletteIndex].r = rgb.r;
                            colorPalette[paletteIndex].g = rgb.g;
                            colorPalette[paletteIndex].b = rgb.b;

                            let hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                            colorPalette[paletteIndex].h = hsl[0];
                            colorPalette[paletteIndex].s = hsl[1];
                            colorPalette[paletteIndex].l = hsl[2];
                        }
                    }
                }
            }
        }

        return true;
    } catch (error) {
        return false;
    }
}
function formatHSLNumber(value, totalWidth) {
    let numStr = Math.round(value).toString();
    let paddingNeeded = totalWidth - numStr.length;
    let padding = paddingNeeded > 0 ? '0'.repeat(paddingNeeded) : '';
    return {
        padding: padding,
        number: numStr
    };
}
function resetColorSlotToDefaults(player) {
    let currentAlienNumber = palladium.getProperty(player, 'omnitrix_cycle');
    let uniformType = palladium.getProperty(player, 'uniform');
    let slotInfo = getSlotInfo(selectedColorSlot, currentAlienNumber, uniformType, currentTab);

    let propertiesToSave = {};

    if (slotInfo.type === 'uniform') {
        let prefix = getPropertyPrefix(slotInfo.index);

        if (slotInfo.index === 0) { // glow
            // Reset glow colors for all aliens
            for (let alienId = 1; alienId <= 1000; alienId++) {
                let alienInfo = global[`alienevo_alien_${alienId}`];
                if (alienInfo && alienInfo[0]) {
                    let alienFullName = alienInfo[0];
                    let alienName = alienFullName.includes(':') ?
                        alienFullName.split(':')[1] : alienFullName;

                    ['default', '10k', 'prototype'].forEach(uniformVariant => {
                        let glowcolorIndex = 1;
                        while (global[`alienevo_${alienId}_${uniformVariant}_glowcolor_${glowcolorIndex}`]) {
                            let originalGlowColors = global[`alienevo_${alienId}_${uniformVariant}_glowcolor_${glowcolorIndex}`];

                            if (originalGlowColors && Array.isArray(originalGlowColors)) {
                                // Reset to original colors
                                for (let colorIndex = 1; colorIndex <= originalGlowColors.length; colorIndex++) {
                                    let propertyName = `${alienName}_${uniformVariant}_glowcolor_${glowcolorIndex}_color_${colorIndex}`;
                                    propertiesToSave[propertyName] = originalGlowColors[colorIndex - 1];
                                }

                                // Reset base color
                                let basePropertyName = `${alienName}_${uniformVariant}_glowcolor_${glowcolorIndex}_base`;
                                propertiesToSave[basePropertyName] = "0,0,0";
                            }
                            glowcolorIndex++;
                        }
                    });
                }
            }

            propertiesToSave[prefix + '_base'] = "0,0,0";
            propertiesToSave[prefix + '_1'] = "ffffff";
            propertiesToSave[prefix + '_2'] = "eaeaea";
            propertiesToSave[prefix + '_3'] = "cfcfdd";
            propertiesToSave[prefix + '_4'] = "b9b7cd";
            propertiesToSave[prefix + '_5'] = "9f9cb6";

            let watchType = palladium.getProperty(player, 'watch');
            let watchPaletteKey = `watch_palette_${watchType}`;
            let defaultWatchColors = global[watchPaletteKey];

            if (defaultWatchColors && Array.isArray(defaultWatchColors)) {
                defaultWatchColors.forEach((color, index) => {
                    propertiesToSave[`${watchType}_glow_color_${index + 1}`] = color;
                });
            } else {
                propertiesToSave[`${watchType}_glow_color_1`] = "b3ff40";
                propertiesToSave[`${watchType}_glow_color_2`] = "a7f72e";
                propertiesToSave[`${watchType}_glow_color_3`] = "8ed721";
                propertiesToSave[`${watchType}_glow_color_4`] = "77b81a";
                propertiesToSave[`${watchType}_glow_color_5`] = "639d11";
            }

        } else {
            let watchType = palladium.getProperty(player, 'watch');
            let uniformType = palladium.getProperty(player, 'uniform');
            let uniformName;
            if (watchType === "prototype" && uniformType === "10k") {
                uniformName = "10k";
            } else {
                uniformName = watchType;
            }
            let defaultColors = {};
            let primaryDefaults = global["watch_palette_" + uniformName + "_uniform_primary"] || ["3a3333", "2c2828", "232020", "171515", "000000"];
            let secondaryDefaults = global["watch_palette_" + uniformName + "_uniform_secondary"] || ["ffffff", "edf4f4", "d6dfe1", "bdc7cf", "97a2b0"];

            if (slotInfo.index === 1) { // primary
                defaultColors = {
                    '_1': primaryDefaults[0],
                    '_2': primaryDefaults[1],
                    '_3': primaryDefaults[2],
                    '_4': primaryDefaults[3],
                    '_5': primaryDefaults[4]
                };
            } else if (slotInfo.index === 2) { // secondary
                defaultColors = {
                    '_1': secondaryDefaults[0],
                    '_2': secondaryDefaults[1],
                    '_3': secondaryDefaults[2],
                    '_4': secondaryDefaults[3],
                    '_5': secondaryDefaults[4]
                };
            }

            propertiesToSave[prefix + '_base'] = "0,0,0";

            // Set uniform colors to defaults
            propertiesToSave[prefix + '_1'] = defaultColors['_1'];
            propertiesToSave[prefix + '_2'] = defaultColors['_2'];
            propertiesToSave[prefix + '_3'] = defaultColors['_3'];
            propertiesToSave[prefix + '_4'] = defaultColors['_4'];
            propertiesToSave[prefix + '_5'] = defaultColors['_5'];

            if (currentAlienNumber == 5) {
                let suitPrefix = slotInfo.index === 1 ? 'suit_primary_color' : 'suit_secondary_color';
                let paletteNumber = slotInfo.index; // 1 for primary, 2 for secondary
                let defaultKey = 'alienevo_5_gadget_3_color_palette_' + paletteNumber;
                let defaultColors = global[defaultKey];

                if (defaultColors) {
                    for (let i = 1; i <= defaultColors.length; i++) {
                        propertiesToSave[suitPrefix + '_' + i] = defaultColors[i - 1];
                    }
                    propertiesToSave[suitPrefix + '_base'] = "0,0,0";
                }
            }
        }

    } else if (slotInfo.type === 'skin') {
        let alienInfo = global['alienevo_alien_' + currentAlienNumber];
        if (alienInfo && alienInfo[0]) {
            let alienFullName = alienInfo[0];
            let alienName = alienFullName.includes(':') ? alienFullName.split(':')[1] : alienFullName;

            if (slotInfo.colors && slotInfo.colors.length > 0) {
                let basePropertyName = alienName + '_' + uniformType + '_skincolor_palette_' + slotInfo.index + '_base';
                propertiesToSave[basePropertyName] = "0,0,0";

                // Set original skin colors
                for (let i = 1; i <= slotInfo.colors.length; i++) {
                    let colorPropertyName = alienName + '_' + uniformType + '_skincolor_palette_' + slotInfo.index + '_color_' + i;
                    let arrayIndex = i - 1;
                    propertiesToSave[colorPropertyName] = slotInfo.colors[arrayIndex];
                }
            }

            resetExtendedPalettes(currentAlienNumber, uniformType, slotInfo, propertiesToSave);
        }
    }

    Client.player.sendData("savePaletteData", propertiesToSave);

    for (let propertyName in propertiesToSave) {
        palladium.setProperty(player, propertyName, propertiesToSave[propertyName]);
    }

    loadPaletteFromProperties(player);

    for (let i = 0; i < manuallyEditedColors.length; i++) {
        manuallyEditedColors[i] = false;
    }
}

PalladiumEvents.renderPowerScreen(e => {
    let player = Client.Player || Minecraft.getInstance().player;
    if (!player) return;
    currentTab = e.tab;

    let window = Minecraft.getInstance().getWindow().getWindow();

    let mouseX = e.mouseX;
    let mouseY = e.mouseY;
    let mouseDetectX = mouseX - (e.screen.width / 2);
    let mouseDetectY = mouseY - (e.screen.height / 2);
    let screenWidth = e.screen.width;
    let screenHeight = e.screen.height;
    let isDown = GLFW.glfwGetMouseButton(window, GLFW.GLFW_MOUSE_BUTTON_LEFT) === GLFW.GLFW_PRESS;
    let clicked = isDown && !wasPressed;
    let released = !isDown && wasPressed;
    wasPressed = isDown;

    let currentAlienNumber = palladium.getProperty(player, 'omnitrix_cycle');
    let alienInfo = global[`alienevo_alien_${currentAlienNumber}`];
    if (!alienInfo) return;

    let alienFullName = alienInfo[0];
    let alienNamespace = 'alienevo_aliens';
    let alienPath = alienFullName;

    if (alienFullName.includes(':')) {
        let parts = alienFullName.split(':');
        alienNamespace = parts[0];
        alienPath = parts[1];
    }

    let allowedPowers = [
        `${alienNamespace}:${alienPath}`,
        'alienevo_aliens:galvanic_rod'
    ];

    let poseStack = e.guiGraphics.pose();
    let textureWidth = 640;
    let textureHeight = 360;
    let i = Math.floor((screenWidth - textureWidth) / 2);
    let j = Math.floor((screenHeight - textureHeight) / 2);

    let uniformType = palladium.getProperty(player, 'uniform') || 'default';
    let watchType = palladium.getProperty(player, 'watch');
    let alienTextColor = global[`alienevo_textcolor_${currentAlienNumber}`][0] || 0xffffff;
    let omnitrixColor = palladium.getProperty(player, `${watchType}_glow_color_1`);
    let omnitrixColorInt = parseInt(omnitrixColor, 16);
    let omnitrixTexturePath = watchType;

    let watch = palladium.getProperty(player, 'watch');
    let watch_namespace = palladium.getProperty(player, 'watch_namespace');
    let omnitrixTab = `${watch_namespace}:${watch}_omnitrix`;

    if (watchType === "prototype" && uniformType === "10k") {
        omnitrixTexturePath = "10k";
    }

    if (selectedTab === 1 && isPowerScreenClosed === true) {

        if (uniformType !== lastUniformType || currentAlienNumber !== lastAlienNumber) {
            lastUniformType = uniformType;
            lastAlienNumber = currentAlienNumber;

            if (selectedColorSlot >= totalSlots) {
                selectedColorSlot = 0;
            }

            changeColorSlot(selectedColorSlot, player, currentTab);
        }
    }

    // refresh colors when the tab changes
    if (previousTab !== currentTab) {
        let currentAlienNumber = palladium.getProperty(player, 'omnitrix_cycle');
        let totalSlots = getTotalColorSlots(currentAlienNumber, uniformType, currentTab);
        if (selectedColorSlot < 0) selectedColorSlot = 0;
        if (selectedColorSlot >= totalSlots) selectedColorSlot = totalSlots - 1;

        loadPaletteFromProperties(player);
        generatePalette(baseColor.h, baseColor.s, baseColor.l);

        previousTab = currentTab;
    }

    poseStack.pushPose();
    poseStack.translate(0, 0, 401);
    if (currentAlienNumber && currentAlienNumber > 0 && isPowerScreenClosed === false) {
        if (allowedPowers.includes(e.tab.toString())) {
            let alienBG = global[`alienevo_background_${currentAlienNumber}`][0] || 'alienevo:textures/gui/power_screen/power_screen.png';
            e.guiGraphics.blit(
                new ResourceLocation(alienBG),
                Math.floor((screenWidth) / 2 - 260), Math.floor((screenHeight) / 2 - 80),
                0, 0,
                16 * 8, 16 * 11,
                32, 32
            );

            // Render main interface
            RenderSystem.enableBlend();
            e.guiGraphics.blit(
                new ResourceLocation('alienevo:textures/gui/power_screen/power_interface.png'),
                i, j,
                0, 0,
                textureWidth, textureHeight,
                textureWidth, textureHeight
            );
            RenderSystem.disableBlend();

            let titleText;
            if (watchType === "prototype" && uniformType == "10k") {
                titleText = Component.translate(`watch_type.alienevo.10k`).getString();
            } else {
                titleText = Component.translate(`watch_type.alienevo.${watchType}`).getString();
            }
            let omnitrixTextWidth = Minecraft.getInstance().font.width(titleText);

            e.guiGraphics.blit(new ResourceLocation('alienevo:textures/gui/power_screen/power_button.png'),
                (screenWidth - omnitrixTextWidth) / 2, (screenHeight - 14) / 2 - 137 + 6, 6, 0, omnitrixTextWidth, 14, 1, 14);
            e.guiGraphics.blit(new ResourceLocation('alienevo:textures/gui/power_screen/power_button.png'),
                (screenWidth - omnitrixTextWidth) / 2 - 5, (screenHeight - 14) / 2 - 137 + 6, 0, 0, 5, 14, 36, 14);
            e.guiGraphics.blit(
                new ResourceLocation('alienevo:textures/gui/power_screen/power_button.png'),
                (screenWidth + omnitrixTextWidth) / 2 - 2, (screenHeight - 14) / 2 - 137 + 6, 30, 0, 6, 14, 36, 14);

            palladium.gui.drawString(e.guiGraphics,
                Component.string(titleText),
                (screenWidth / 2) - (omnitrixTextWidth / 2),
                (screenHeight / 2) - 141 + 6,
                0xffffff);

            poseStack.pushPose();
            poseStack.translate(0, 0, 200);

            let skillLabelText = Component.translate(`labels.ui.alienevo.skills`).getString();
            let skillLabelTextWidth = Minecraft.getInstance().font.width(skillLabelText);
            let alienNickname = palladium.getProperty(player, 'current_alien_nickname') || 'null';
            let alienNicknameTranslated = Component.translate(alienNickname).getString();
            let nickTextWidth = Minecraft.getInstance().font.width(alienNicknameTranslated);
            let skillLabelOffset = 0;
            if (nickTextWidth >= 145 && editingNickname === false) {
                skillLabelOffset = (nickTextWidth / 2) - 145 / 2 + 2;
            } else {
                skillLabelOffset = 0;
            }

            e.guiGraphics.blit(new ResourceLocation('alienevo:textures/gui/power_screen/power_button.png'),
                (screenWidth / 2) - 203 + 8 + 95 + skillLabelOffset, (screenHeight / 2) - 88, 6, 0, skillLabelTextWidth, 14, 1, 14);
            e.guiGraphics.blit(new ResourceLocation('alienevo:textures/gui/power_screen/power_button.png'),
                (screenWidth / 2) - 203 + 8 - 5 + 95 + skillLabelOffset, (screenHeight / 2) - 88, 0, 0, 5, 14, 36, 14);
            e.guiGraphics.blit(new ResourceLocation('alienevo:textures/gui/power_screen/power_button.png'),
                (screenWidth / 2) - 203 + 8 - 2 + 121 - 26 + skillLabelTextWidth + skillLabelOffset, (screenHeight / 2) - 88, 30, 0, 6, 14, 36, 14);
            palladium.gui.drawString(e.guiGraphics,
                Component.translate(`labels.ui.alienevo.skills`).getString(), (screenWidth / 2) - 100 + skillLabelOffset, (screenHeight / 2) - 85, 0xffffff);

            if (editingNickname === false) {
                e.guiGraphics.blit(new ResourceLocation('alienevo:textures/gui/power_screen/power_button.png'),
                    (screenWidth / 2) - (nickTextWidth / 2) - 203 + 8, (screenHeight / 2) - 88, 6, 0, nickTextWidth, 14, 1, 14);
                e.guiGraphics.blit(new ResourceLocation('alienevo:textures/gui/power_screen/power_button.png'),
                    (screenWidth / 2) - (nickTextWidth / 2) - 203 + 8 - 5, (screenHeight / 2) - 88, 0, 0, 5, 14, 36, 14);
                e.guiGraphics.blit(new ResourceLocation('alienevo:textures/gui/power_screen/power_button.png'),
                    (screenWidth / 2) + (nickTextWidth / 2) - 203 + 8 - 2, (screenHeight / 2) - 88, 30, 0, 6, 14, 36, 14);

                palladium.gui.drawString(e.guiGraphics,
                    Component.string(alienNicknameTranslated),
                    (screenWidth / 2) - (nickTextWidth / 2) - 203 + 8,
                    (screenHeight / 2) - 85,
                    0xffffff);

                let buttonEditNickX = (screenWidth / 2) + (nickTextWidth / 2) - 190;
                let buttonEditNickY = (screenHeight / 2) - 88;
                let buttonEditNickOffset = (mouseX >= buttonEditNickX && mouseX <= buttonEditNickX + 13 && mouseY >= buttonEditNickY && mouseY <= buttonEditNickY + 14) ? 13 : 0;

                if (clicked) {
                    if (mouseX >= buttonEditNickX && mouseX <= buttonEditNickX + 13 &&
                        mouseY >= buttonEditNickY && mouseY <= buttonEditNickY + 14) {
                        editingNickname = true;
                        player.playSound('minecraft:ui.button.click', 0.33, 1.0);
                    }
                };

                e.guiGraphics.blit(
                    new ResourceLocation(`alienevo:textures/gui/power_screen/buttons.png`),
                    Math.floor(screenWidth / 2 + (nickTextWidth / 2) - 190), Math.floor(screenHeight / 2 - 88),
                    buttonEditNickOffset, 78,
                    13, 14,
                    128, 128
                );
            } else if (editingNickname === true) {
                poseStack.pushPose();
                poseStack.translate(0, 0, 200);
                let buttonResetNickX = (screenWidth / 2) - 190 - 71;
                let buttonResetNickY = (screenHeight / 2) - 88;
                let buttonResetNickOffset = (mouseX >= buttonResetNickX && mouseX <= buttonResetNickX + 13 && mouseY >= buttonResetNickY && mouseY <= buttonResetNickY + 14) ? 13 : 0;
                e.guiGraphics.blit(
                    new ResourceLocation(`alienevo:textures/gui/power_screen/buttons.png`),
                    Math.floor(screenWidth / 2 - 190 - 71), Math.floor(screenHeight / 2 - 88),
                    buttonResetNickOffset + 26, 78,
                    13, 14,
                    128, 128
                );
                let buttonSaveNickX = (screenWidth / 2) - 190 + 45;
                let buttonSaveNickY = (screenHeight / 2) - 88;
                let buttonSaveNickOffset = (mouseX >= buttonSaveNickX && mouseX <= buttonSaveNickX + 13 && mouseY >= buttonSaveNickY && mouseY <= buttonSaveNickY + 14) ? 13 : 0;
                e.guiGraphics.blit(
                    new ResourceLocation(`alienevo:textures/gui/power_screen/buttons.png`),
                    Math.floor(screenWidth / 2 - 190 + 45), Math.floor(screenHeight / 2 - 88),
                    buttonSaveNickOffset + 52, 78,
                    13, 14,
                    128, 128
                );
                e.guiGraphics.blit(
                    new ResourceLocation(`alienevo:textures/gui/power_screen/textbox.png`),
                    Math.floor(screenWidth / 2 - 190 - 57), Math.floor(screenHeight / 2 - 89),
                    0, 0,
                    101, 16,
                    101, 16
                );
                if (clicked) {
                    if (mouseX >= buttonResetNickX && mouseX <= buttonResetNickX + 13 &&
                        mouseY >= buttonResetNickY && mouseY <= buttonResetNickY + 14) {

                        let defaultTranslationKey = `species.alienevo_aliens.${currentAlienNumber}`;
                        let translatedName = Component.translate(defaultTranslationKey).getString();

                        nickTextBox.setValue(translatedName);
                        player.playSound('minecraft:ui.button.click', 0.33, 1.0);
                    }

                    if (mouseX >= buttonSaveNickX && mouseX <= buttonSaveNickX + 13 &&
                        mouseY >= buttonSaveNickY && mouseY <= buttonSaveNickY + 14) {
                        nickTextBox.setVisible(false);
                        nickTextBox.setEditable(false);
                        editingNickname = false;
                        let inputText = nickTextBox.getValue();

                        let defaultTranslationKey = `species.alienevo_aliens.${currentAlienNumber}`;
                        let translatedName = Component.translate(defaultTranslationKey).getString();

                        let nicknameToSave;
                        if (inputText === translatedName) {
                            nicknameToSave = defaultTranslationKey;
                        } else {
                            nicknameToSave = inputText;
                        }

                        Client.player.sendData('alienevo_nickname', { nickname: nicknameToSave });
                        player.playSound('minecraft:ui.button.click', 0.33, 1.0);
                    }
                };
                if (currentScreen !== e.screen || lastScreenWidth !== screenWidth || lastScreenHeight !== screenHeight) {
                    nickTextBox = null; // Reset
                    currentScreen = e.screen;
                    lastScreenWidth = screenWidth;
                    lastScreenHeight = screenHeight;
                }

                if (nickTextBox === null) {
                    let font = Minecraft.getInstance().font;

                    nickTextBox = new TextFieldWidget(
                        font,
                        screenWidth / 2 - 190 - 57 + 4,
                        screenHeight / 2 - 88 + 3,
                        90,
                        14,
                        Component.literal("")
                    );

                    nickTextBox.setMaxLength(90);
                    //nickTextBox.setFocused(true);
                    nickTextBox.setEditable(true);
                    nickTextBox.setVisible(true);
                    nickTextBox.setBordered(false);

                    e.screen.addRenderableWidget(nickTextBox);
                    nickTextBox.setValue(alienNicknameTranslated);
                }
                if (nickTextBox !== null && !nickTextBox.isVisible() && editingNickname === true) {
                    nickTextBox.setVisible(true);
                    nickTextBox.setEditable(true);
                }
                if (nickTextBox !== null && nickTextBox.isVisible()) {
                    poseStack.pushPose();
                    poseStack.translate(0, 0, 400);
                    nickTextBox.render(e.guiGraphics, mouseX, mouseY, e.partialTick);
                    poseStack.popPose();
                }
                // Tick the nickTextBox
                if (nickTextBox !== null) {
                    let currentTime = Date.now();
                    if (currentTime - lastTickTime >= TICK_INTERVAL) {
                        nickTextBox.tick();
                        lastTickTime = currentTime;
                    }
                }
            }

            let simpleName = alienPath.charAt(0).toUpperCase() + alienPath.slice(1);
            let alien_level = palladium.scoreboard.getScore(player, `${simpleName}.Level`, 0);
            let currentXp = palladium.scoreboard.getScore(player, `${simpleName}.XP`, 0);
            let skillPoints = palladium.scoreboard.getScore(player, `${simpleName}.SkillPoint`, 0);
            let omniPoints = palladium.scoreboard.getScore(player, `AlienEvo.PrototypeSkillP`, 0);
            let maxXp = alien_level > 0 ? 100 * alien_level : 100;

            let pixelsToShowXP = maxXp > 0 ?
                Math.max(0, Math.min(236, Math.floor((currentXp / maxXp) * 236))) :
                (currentXp > 0 ? 236 : 1);

            // Draw XP progress
            e.guiGraphics.blit(
                new ResourceLocation('alienevo:textures/gui/power_screen/power_bar_xp.png'),
                Math.floor((screenWidth) / 2 - 118), Math.floor((screenHeight) / 2 - 97),
                0, 0,
                pixelsToShowXP, 2,
                236, 2
            );

            let levelTextWidth = Minecraft.getInstance().font.width(alien_level);
            palladium.gui.drawString(e.guiGraphics, Component.string(`§l${alien_level}`), (screenWidth / 2) - (levelTextWidth / 2) + 1, (screenHeight / 2) - 152 + 52 + 1, 0x000000);
            palladium.gui.drawString(e.guiGraphics, Component.string(`§l${alien_level}`), (screenWidth / 2) - (levelTextWidth / 2) - 1, (screenHeight / 2) - 152 + 52 + 1, 0x000000);
            palladium.gui.drawString(e.guiGraphics, Component.string(`§l${alien_level}`), (screenWidth / 2) - (levelTextWidth / 2) + 1, (screenHeight / 2) - 152 + 52 - 1, 0x000000);
            palladium.gui.drawString(e.guiGraphics, Component.string(`§l${alien_level}`), (screenWidth / 2) - (levelTextWidth / 2) - 1, (screenHeight / 2) - 152 + 52 + 0, 0x000000);
            palladium.gui.drawString(e.guiGraphics, Component.string(`§l${alien_level}`), (screenWidth / 2) - (levelTextWidth / 2) + 1, (screenHeight / 2) - 152 + 52 - 0, 0x000000);
            palladium.gui.drawString(e.guiGraphics, Component.string(`§l${alien_level}`), (screenWidth / 2) - (levelTextWidth / 2) - 1, (screenHeight / 2) - 152 + 52 - 1, 0x000000);
            palladium.gui.drawString(e.guiGraphics,
                Component.string(`§l${alien_level}`),
                (screenWidth / 2) - (levelTextWidth / 2),
                (screenHeight / 2) - 152 + 52,
                0xb3ff40);

            // Draw alien icon
            e.guiGraphics.blit(
                new ResourceLocation(`alienevo:textures/gui/playlists/playlist_1/alien_${currentAlienNumber}.png`),
                Math.floor((screenWidth) / 2 - 113 + 3 + 128), Math.floor((screenHeight) / 2 - 119),
                0, 0,
                16, 16,
                16, 16
            );

            // DRAW OMNITRIX ICON
            let omnitrixX = Math.floor((screenWidth) / 2 - 116 + 9);
            let omnitrixY = Math.floor((screenHeight) / 2 - 119);
            e.guiGraphics.blit(
                new ResourceLocation(`${watch_namespace}:textures/item/${omnitrixTexturePath}_omnitrix.png`),
                omnitrixX, omnitrixY,
                0, 0,
                16, 16,
                16, 16
            );

            let omnitrixColor1Red = ((omnitrixColorInt >> 16) & 0xFF) / 255.0;
            let omnitrixColor1Green = ((omnitrixColorInt >> 8) & 0xFF) / 255.0;
            let omnitrixColor1Blue = (omnitrixColorInt & 0xFF) / 255.0;
            let omnitrixColor2 = palladium.getProperty(player, `${watchType}_glow_color_3`);
            let omnitrixColor2Int = parseInt(omnitrixColor2, 16);
            let omnitrixColor2Red = ((omnitrixColor2Int >> 16) & 0xFF) / 255.0;
            let omnitrixColor2Green = ((omnitrixColor2Int >> 8) & 0xFF) / 255.0;
            let omnitrixColor2Blue = (omnitrixColor2Int & 0xFF) / 255.0;

            e.guiGraphics.setColor(omnitrixColor1Red, omnitrixColor1Green, omnitrixColor1Blue, 1.0);
            e.guiGraphics.blit(
                new ResourceLocation(`${watch_namespace}:textures/item/${omnitrixTexturePath}_omnitrix_glow_1.png`),
                omnitrixX, omnitrixY,
                0, 0,
                16, 16,
                16, 16
            );
            e.guiGraphics.setColor(omnitrixColor2Red, omnitrixColor2Green, omnitrixColor2Blue, 1.0);
            e.guiGraphics.blit(
                new ResourceLocation(`${watch_namespace}:textures/item/${omnitrixTexturePath}_omnitrix_glow_2.png`),
                omnitrixX, omnitrixY,
                0, 0,
                16, 16,
                16, 16
            );
            e.guiGraphics.setColor(1.0, 1.0, 1.0, 1.0);

            palladium.gui.drawString(e.guiGraphics,
                Component.translate(`labels.ui.alienevo.skillpoints`).getString(), (screenWidth / 2) - 92 + 3 + 128, (screenHeight / 2) - 114, alienTextColor);

            let skillPointsColor = omnitrixColorInt;
            let pointOffset = (skillPoints >= 100) ? -6 : (skillPoints >= 10) ? -3 : 0;
            let omniPointOffset = (omniPoints >= 100) ? -6 : (omniPoints >= 10) ? -3 : 0;
            palladium.gui.drawString(e.guiGraphics,
                Component.translate(`labels.ui.alienevo.skillpoints`).getString(), (screenWidth / 2) - 92 - 3 + 9, (screenHeight / 2) - 114, skillPointsColor);
            palladium.gui.drawString(e.guiGraphics,
                Component.string(`${omniPoints}`), (screenWidth / 2) - 94 - 3 + 63 + 9 + omniPointOffset, (screenHeight / 2) - 114, 0xffffff);
            palladium.gui.drawString(e.guiGraphics,
                Component.string(`${skillPoints}`), (screenWidth / 2) - 94 + 3 + 63 + 128 + pointOffset, (screenHeight / 2) - 114, 0xffffff);

            let tabWidth = 31;
            let tabHeight = 26;
            let tabX = (screenWidth / 2) + 273;
            let tabY = (screenHeight / 2) - 93;

            if (clicked) {
                if (mouseX >= tabX && mouseX <= tabX + tabWidth &&
                    mouseY >= tabY && mouseY <= tabY + tabHeight) {
                    selectedTab = 0;
                    player.playSound('minecraft:ui.button.click', 0.33, 1.0);
                }
                if (mouseX >= tabX && mouseX <= tabX + tabWidth &&
                    mouseY >= tabY + tabHeight + 2 && mouseY <= tabY + (tabHeight * 2) + 2) {
                    selectedTab = 1;
                    player.playSound('minecraft:ui.button.click', 0.33, 1.0);
                }
            }

            let tab0OffsetX = (selectedTab === 0) ? 0 : 31;
            let tab1OffsetX = (selectedTab === 1) ? 0 : 31;

            poseStack.pushPose();
            poseStack.translate(0, 0, 301);
            e.guiGraphics.blit(
                new ResourceLocation('alienevo:textures/gui/power_screen/buttons.png'),
                Math.floor(tabX), Math.floor(tabY),
                tab0OffsetX, 52,
                31, 26,
                128, 128
            );
            e.guiGraphics.blit(
                new ResourceLocation('alienevo:textures/gui/power_screen/buttons.png'),
                Math.floor(tabX), Math.floor(tabY + tabHeight + 2),
                tab1OffsetX, 52,
                31, 26,
                128, 128
            );

            let tabIconX = (screenWidth / 2) + 281;
            let tabIconY = (screenHeight / 2) - 88;
            let iconStatsOffset = selectedTab != 0 ? 2 : 0;
            let iconColorOffset = selectedTab != 1 ? 2 : 0;

            e.guiGraphics.blit(
                new ResourceLocation('alienevo:textures/gui/power_screen/icon_stats.png'),
                Math.floor(tabIconX - iconStatsOffset), Math.floor(tabIconY),
                0, 0,
                16, 16,
                16, 16
            );

            e.guiGraphics.blit(
                new ResourceLocation('alienevo:textures/gui/power_screen/icon_color.png'),
                Math.floor(tabIconX - iconColorOffset), Math.floor(tabIconY + 28),
                0, 0,
                16, 16,
                16, 16
            );

            poseStack.popPose();

            if (player && e.guiGraphics && e.screen) {
                let player_x = (screenWidth / 2) - 195;
                let player_y = (screenHeight / 2) + 75;
                let player_size = global[`alienevo_scale_${currentAlienNumber}`][0] || 55;

                let cachedBodyRot = Client.player.yBodyRot;
                let cachedYHeadRot = Client.player.yHeadRot;

                Client.player.yBodyRot = 0;
                Client.player.yHeadRot = 0;

                let mouseOverAlien = isMouseOverAlien(mouseX, mouseY, player_x, player_y, player_size);

                if (clicked && mouseOverAlien && !isDraggingAlien) {
                    isDraggingAlien = true;
                    hasBeenDragged = true;
                    lastMouseX = mouseX;
                    lastMouseY = mouseY;
                }

                if (released && isDraggingAlien) {
                    isDraggingAlien = false;
                }

                let deltaX = mouseX - player_x;
                let deltaY = mouseY - (player_y - player_size / 2);
                let sensitivity = 950;

                let baseYaw = Math.atan2(deltaX, sensitivity);
                let basePitch = Math.atan2(deltaY, sensitivity * 2) + 0.1;

                let maxYawRotation = 0.523599;
                let maxPitchRotation = 0.261799;

                baseYaw = Math.max(-maxYawRotation, Math.min(maxYawRotation, baseYaw));
                basePitch = Math.max(-maxPitchRotation, Math.min(maxPitchRotation, basePitch));

                if (isDraggingAlien && isDown) {
                    let dragDeltaX = mouseX - lastMouseX;
                    let dragDeltaY = mouseY - lastMouseY;

                    draggedYaw += dragDeltaX * 0.02;
                    draggedPitch += dragDeltaY * 0.02;

                    draggedPitch = Math.max(-0.4, Math.min(0.4, draggedPitch));

                    lastMouseX = mouseX;
                    lastMouseY = mouseY;
                }
                alienYaw = draggedYaw + baseYaw;
                alienPitch = draggedPitch + basePitch;

                let PI = 3.14159265359;
                let flipAngle = -PI;
                let totalPitch = flipAngle + alienPitch;
                let cosFlip = Math.cos(totalPitch * 0.5);
                let sinFlip = Math.sin(totalPitch * 0.5);
                let cosYaw = Math.cos(alienYaw * 0.5);
                let sinYaw = Math.sin(alienYaw * 0.5);

                let quat = new Quaternionf(
                    sinFlip * cosYaw,
                    cosFlip * sinYaw,
                    sinFlip * sinYaw,
                    cosFlip * cosYaw
                );

                poseStack.pushPose();
                poseStack.translate(0, 0, 250);
                InventoryScreen.renderEntityInInventory(
                    e.guiGraphics,
                    player_x,
                    player_y,
                    player_size,
                    quat,
                    null,
                    player
                );

                poseStack.popPose();

                Client.player.yBodyRot = cachedBodyRot;
                Client.player.yHeadRot = cachedYHeadRot;
            }

            poseStack.pushPose();
            poseStack.translate(0, 0, 201);
            if (mouseDetectX >= -113 && mouseDetectX <= -12 && mouseDetectY >= -122 && mouseDetectY <= -102) {
                let omniHelpText = Component.translate(`tooltip.ui.alienevo.omnipoints`).getString();
                poseStack.pushPose();
                poseStack.translate(0, 0, 1);
                let result = drawWrappedText(e.guiGraphics, omniHelpText, mouseX + 13, mouseY - 2, 160, 10, skillPointsColor, 0xffffff);
                poseStack.popPose();

                let numberOfWraps = result.wrapCount;

                RenderSystem.enableBlend();
                e.guiGraphics.blit(new ResourceLocation('alienevo:textures/gui/power_screen/power_tooltip_large.png'),
                    mouseX + 13 - 5, mouseY - 2 - 4, 0, 0, 164, 7, 164, 16);
                for (let i = 0; i < (numberOfWraps * 10) + 1; i++) {
                    e.guiGraphics.blit(new ResourceLocation('alienevo:textures/gui/power_screen/power_tooltip_large.png'),
                        mouseX + 13 - 5, mouseY - 2 - 4 + 7 + i, 0, 8, 164, 1, 164, 16);
                };
                e.guiGraphics.blit(new ResourceLocation('alienevo:textures/gui/power_screen/power_tooltip_large.png'),
                    mouseX + 13 - 5, mouseY - 2 - 4 + 8 + (numberOfWraps * 10), 0, 8, 164, 8, 164, 16);
                RenderSystem.disableBlend();
            };

            if (mouseDetectX >= 11 && mouseDetectX <= 112 && mouseDetectY >= -122 && mouseDetectY <= -102) {
                let omniHelpText = Component.translate(`tooltip.ui.alienevo.alienpoints`).getString();
                poseStack.pushPose();
                poseStack.translate(0, 0, 1);
                let result = drawWrappedText(e.guiGraphics, omniHelpText, mouseX + 13, mouseY - 2, 160, 10, alienTextColor, 0xffffff);
                poseStack.popPose();

                let numberOfWraps = result.wrapCount;

                RenderSystem.enableBlend();
                e.guiGraphics.blit(new ResourceLocation('alienevo:textures/gui/power_screen/power_tooltip_large.png'),
                    mouseX + 13 - 5, mouseY - 2 - 4, 0, 0, 164, 7, 164, 16);
                for (let i = 0; i < (numberOfWraps * 10) + 1; i++) {
                    e.guiGraphics.blit(new ResourceLocation('alienevo:textures/gui/power_screen/power_tooltip_large.png'),
                        mouseX + 13 - 5, mouseY - 2 - 4 + 7 + i, 0, 8, 164, 1, 164, 16);
                };
                e.guiGraphics.blit(new ResourceLocation('alienevo:textures/gui/power_screen/power_tooltip_large.png'),
                    mouseX + 13 - 5, mouseY - 2 - 4 + 8 + (numberOfWraps * 10), 0, 8, 164, 8, 164, 16);
                RenderSystem.disableBlend();
            };
            poseStack.popPose();

        }
    }
    poseStack.popPose();
    poseStack.pushPose();
    //poseStack.translate(0, 0, 401);
    if (selectedTab == 0 && allowedPowers.includes(e.tab.toString()) && isPowerScreenClosed === false) {
        e.guiGraphics.blit(
            new ResourceLocation('alienevo:textures/gui/power_screen/power_interface_stats.png'),
            i, j,
            0, 0,
            textureWidth, textureHeight,
            textureWidth, textureHeight
        );
        // Draw stats label
        let statsLabelText = Component.translate(`labels.ui.alienevo.stats`).getString();
        let statsLabelTextWidth = Minecraft.getInstance().font.width(statsLabelText);

        e.guiGraphics.blit(new ResourceLocation('alienevo:textures/gui/power_screen/power_button.png'),
            (screenWidth / 2) - 0 + 144, (screenHeight / 2) - 88, 6, 0, statsLabelTextWidth, 14, 1, 14);
        e.guiGraphics.blit(new ResourceLocation('alienevo:textures/gui/power_screen/power_button.png'),
            (screenWidth / 2) - 5 + 144, (screenHeight / 2) - 88, 0, 0, 5, 14, 36, 14);
        e.guiGraphics.blit(new ResourceLocation('alienevo:textures/gui/power_screen/power_button.png'),
            (screenWidth / 2) + statsLabelTextWidth + 143, (screenHeight / 2) - 88, 30, 0, 6, 14, 36, 14);

        palladium.gui.drawString(e.guiGraphics,
            Component.translate(`labels.ui.alienevo.stats`).getString(),
            (screenWidth / 2) + 137 + 7, (screenHeight / 2) - 85, 0xffffff);

        // Draw info label
        let infoLabelText = Component.translate(`labels.ui.alienevo.info`).getString();
        let infoLabelTextWidth = Minecraft.getInstance().font.width(infoLabelText);

        e.guiGraphics.blit(new ResourceLocation('alienevo:textures/gui/power_screen/power_button.png'),
            (screenWidth / 2) - 0 + 144, (screenHeight / 2) - 1, 6, 0, infoLabelTextWidth, 14, 1, 14);
        e.guiGraphics.blit(new ResourceLocation('alienevo:textures/gui/power_screen/power_button.png'),
            (screenWidth / 2) - 5 + 144, (screenHeight / 2) - 1, 0, 0, 5, 14, 36, 14);
        e.guiGraphics.blit(new ResourceLocation('alienevo:textures/gui/power_screen/power_button.png'),
            (screenWidth / 2) + infoLabelTextWidth + 143, (screenHeight / 2) - 1, 30, 0, 6, 14, 36, 14);

        palladium.gui.drawString(e.guiGraphics,
            Component.translate(`labels.ui.alienevo.info`).getString(),
            (screenWidth / 2) + 137 + 7, (screenHeight / 2) - 85 + 87, 0xffffff);

        let stat_text_x = (screenWidth / 2) + 137 + 7;
        let stat_text_y = (screenHeight / 2) - 75 + 3;
        let stat_value_text_x = (screenWidth / 2) + 137 + 59 + 6;
        let stat_offset = 10;

        // Draw stat labels
        let statLabels = [
            Component.translate(`stats.ui.alienevo.hp`).getString(),
            Component.translate(`stats.ui.alienevo.atk`).getString(),
            Component.translate(`stats.ui.alienevo.def`).getString(),
            Component.translate(`stats.ui.alienevo.tough`).getString(),
            Component.translate(`stats.ui.alienevo.speed`).getString(),
            Component.translate(`stats.ui.alienevo.regen`).getString()
        ];
        statLabels.forEach((label, index) => {
            palladium.gui.drawString(e.guiGraphics,
                Component.string(label),
                stat_text_x,
                stat_text_y + (stat_offset * index),
                0xffffff);
        });

        let currentHp = palladium.getProperty(player, 'current_hp') ?? 20;
        let currentAttack = palladium.getProperty(player, 'current_attack') || 1;
        let currentDefense = palladium.getProperty(player, 'current_defense') || 0;
        let currentToughness = palladium.getProperty(player, 'current_toughness') || 0;
        let currentSpeed = palladium.getProperty(player, 'current_speed') || 100;

        let currentRegen = (global[`alienevo_regen_${currentAlienNumber}`] && global[`alienevo_regen_${currentAlienNumber}`][0]) || 0;

        // Draw stat values
        let drawStat = (value, yIndex) => {
            let offset = (value >= 1000) ? -18 : (value >= 100) ? -12 : (value >= 10) ? -6 : 0;
            palladium.gui.drawString(e.guiGraphics,
                Component.string(value.toString()),
                stat_value_text_x + offset,
                stat_text_y + (stat_offset * yIndex),
                0xffffff);
        };

        drawStat(currentHp, 0);
        drawStat(currentAttack, 1);
        drawStat(currentDefense, 2);
        drawStat(currentToughness, 3);
        drawStat(currentSpeed, 4);
        drawStat(currentRegen, 5);

        let bar_x = Math.floor((screenWidth) / 2) + 215;
        let bar_y = Math.floor((screenHeight) / 2) - 71;

        drawBar(e.guiGraphics, bar_x, bar_y, currentHp, 0, 60, 42, 5, "alienevo:textures/gui/power_screen/power_bar_");
        drawBar(e.guiGraphics, bar_x, bar_y + 10, currentAttack, 0, 25, 42, 5, "alienevo:textures/gui/power_screen/power_bar_");
        drawBar(e.guiGraphics, bar_x, bar_y + 10 * 2, currentDefense, 0, 30, 42, 5, "alienevo:textures/gui/power_screen/power_bar_");
        drawBar(e.guiGraphics, bar_x, bar_y + 10 * 3, currentToughness, 0, 20, 42, 5, "alienevo:textures/gui/power_screen/power_bar_");
        drawBar(e.guiGraphics, bar_x, bar_y + 10 * 4, currentSpeed, 0, 50, 42, 5, "alienevo:textures/gui/power_screen/power_bar_");
        drawBar(e.guiGraphics, bar_x, bar_y + 10 * 5, currentRegen, 0, 10, 42, 5, "alienevo:textures/gui/power_screen/power_bar_");

        let infoText = Component.translate(`alienevo.alien_desc.${currentAlienNumber}`).getString();
        let infoX = (screenWidth / 2) + 137;
        let infoY = (screenHeight / 2) + 15;
        let maxWidth = 120;
        let lineHeight = 10;

        drawWrappedText(e.guiGraphics, infoText, infoX, infoY, maxWidth, lineHeight, alienTextColor, 0xa8a8a8);
    } else if (selectedTab === 1 && allowedPowers.includes(e.tab.toString()) && isPowerScreenClosed === false || e.tab === omnitrixTab && isPowerScreenClosed === false) {
        let textureWidth = 640;
        let textureHeight = 360;
        let i = Math.floor(screenWidth / 2);
        let j = Math.floor(screenHeight / 2);
        let iTexture = Math.floor((screenWidth - textureWidth) / 2);
        let jTexture = Math.floor((screenHeight - textureHeight) / 2);
        let poseStack = e.guiGraphics.pose();

        if (e.tab === omnitrixTab && isPowerScreenClosed === false) {
            poseStack.translate(0, 0, 401);
            e.guiGraphics.blit(
                new ResourceLocation('alienevo:textures/gui/power_screen/power_interface_omnitrix.png'),
                iTexture, jTexture,
                0, 0,
                textureWidth, textureHeight,
                textureWidth, textureHeight
            );

            // Draw skills label
            poseStack.pushPose();
            poseStack.translate(0, 0, 200);

            let skillLabelText = Component.translate(`labels.ui.alienevo.skills`).getString();
            let skillLabelTextWidth = Minecraft.getInstance().font.width(skillLabelText);
            e.guiGraphics.blit(new ResourceLocation('alienevo:textures/gui/power_screen/power_button.png'),
                (screenWidth / 2) - 203 + 8 + 95, (screenHeight / 2) - 88, 6, 0, skillLabelTextWidth, 14, 1, 14);
            e.guiGraphics.blit(new ResourceLocation('alienevo:textures/gui/power_screen/power_button.png'),
                (screenWidth / 2) - 203 + 8 - 5 + 95, (screenHeight / 2) - 88, 0, 0, 5, 14, 36, 14);
            e.guiGraphics.blit(new ResourceLocation('alienevo:textures/gui/power_screen/power_button.png'),
                (screenWidth / 2) - 203 + 8 - 2 + 121 - 26 + skillLabelTextWidth, (screenHeight / 2) - 88, 30, 0, 6, 14, 36, 14);
            palladium.gui.drawString(e.guiGraphics,
                Component.translate(`labels.ui.alienevo.skills`).getString(), (screenWidth / 2) - 100, (screenHeight / 2) - 85, 0xffffff);

            poseStack.popPose();

            // Draw omnitrix button
            let titleText;
            if (watchType === "prototype" && uniformType == "10k") {
                titleText = Component.translate(`watch_type.alienevo.10k`).getString();
            } else {
                titleText = Component.translate(`watch_type.alienevo.${watchType}`).getString();
            }
            let omnitrixTextWidth = Minecraft.getInstance().font.width(titleText);

            e.guiGraphics.blit(new ResourceLocation('alienevo:textures/gui/power_screen/power_button.png'),
                (screenWidth - omnitrixTextWidth) / 2, (screenHeight - 14) / 2 - 137 + 11, 6, 0, omnitrixTextWidth, 14, 1, 14);
            e.guiGraphics.blit(new ResourceLocation('alienevo:textures/gui/power_screen/power_button.png'),
                (screenWidth - omnitrixTextWidth) / 2 - 5, (screenHeight - 14) / 2 - 137 + 11, 0, 0, 5, 14, 36, 14);
            e.guiGraphics.blit(
                new ResourceLocation('alienevo:textures/gui/power_screen/power_button.png'),
                (screenWidth + omnitrixTextWidth) / 2 - 2, (screenHeight - 14) / 2 - 137 + 11, 30, 0, 6, 14, 36, 14);

            palladium.gui.drawString(e.guiGraphics,
                Component.string(titleText),
                (screenWidth / 2) - (omnitrixTextWidth / 2),
                (screenHeight / 2) - 141 + 11,
                0xffffff);

            // DRAW OMNITRIX ICON
            let omnitrixX = Math.floor((screenWidth) / 2 - 116 + 9);
            let omnitrixY = Math.floor((screenHeight) / 2 - 119 + 7);
            e.guiGraphics.blit(
                new ResourceLocation(`${watch_namespace}:textures/item/${omnitrixTexturePath}_omnitrix.png`),
                omnitrixX, omnitrixY,
                0, 0,
                16, 16,
                16, 16
            );

            let omnitrixColor1Red = ((omnitrixColorInt >> 16) & 0xFF) / 255.0;
            let omnitrixColor1Green = ((omnitrixColorInt >> 8) & 0xFF) / 255.0;
            let omnitrixColor1Blue = (omnitrixColorInt & 0xFF) / 255.0;
            let omnitrixColor2 = palladium.getProperty(player, `${watchType}_glow_color_3`);
            let omnitrixColor2Int = parseInt(omnitrixColor2, 16);
            let omnitrixColor2Red = ((omnitrixColor2Int >> 16) & 0xFF) / 255.0;
            let omnitrixColor2Green = ((omnitrixColor2Int >> 8) & 0xFF) / 255.0;
            let omnitrixColor2Blue = (omnitrixColor2Int & 0xFF) / 255.0;

            e.guiGraphics.setColor(omnitrixColor1Red, omnitrixColor1Green, omnitrixColor1Blue, 1.0);
            e.guiGraphics.blit(
                new ResourceLocation(`${watch_namespace}:textures/item/${omnitrixTexturePath}_omnitrix_glow_1.png`),
                omnitrixX, omnitrixY,
                0, 0,
                16, 16,
                16, 16
            );
            e.guiGraphics.setColor(omnitrixColor2Red, omnitrixColor2Green, omnitrixColor2Blue, 1.0);
            e.guiGraphics.blit(
                new ResourceLocation(`${watch_namespace}:textures/item/${omnitrixTexturePath}_omnitrix_glow_2.png`),
                omnitrixX, omnitrixY,
                0, 0,
                16, 16,
                16, 16
            );
            e.guiGraphics.setColor(1.0, 1.0, 1.0, 1.0);

            let omniPoints = palladium.scoreboard.getScore(player, `AlienEvo.PrototypeSkillP`, 0);
            let omniPointOffset = (omniPoints >= 100) ? -6 : (omniPoints >= 10) ? -3 : 0;

            palladium.gui.drawString(e.guiGraphics,
                Component.translate(`labels.ui.alienevo.skillpoints`).getString(), (screenWidth / 2) - 92 - 3 + 9, (screenHeight / 2) - 114 + 7, omnitrixColorInt);
            palladium.gui.drawString(e.guiGraphics,
                Component.string(`${omniPoints}`), (screenWidth / 2) - 94 - 3 + 63 + 9 + omniPointOffset, (screenHeight / 2) - 114 + 7, 0xffffff);

            poseStack.pushPose();
            poseStack.translate(0, 0, 201);
            if (mouseDetectX >= -113 && mouseDetectX <= -12 && mouseDetectY >= -113 && mouseDetectY <= -96) {
                let omniHelpText = Component.translate(`tooltip.ui.alienevo.omnipoints`).getString();
                poseStack.pushPose();
                poseStack.translate(0, 0, 1);
                let result = drawWrappedText(e.guiGraphics, omniHelpText, mouseX + 13, mouseY - 2, 160, 10, omnitrixColorInt, 0xffffff);
                poseStack.popPose();

                let numberOfWraps = result.wrapCount;

                RenderSystem.enableBlend();
                e.guiGraphics.blit(new ResourceLocation('alienevo:textures/gui/power_screen/power_tooltip_large.png'),
                    mouseX + 13 - 5, mouseY - 2 - 4, 0, 0, 164, 7, 164, 16);
                for (let i = 0; i < (numberOfWraps * 10) + 1; i++) {
                    e.guiGraphics.blit(new ResourceLocation('alienevo:textures/gui/power_screen/power_tooltip_large.png'),
                        mouseX + 13 - 5, mouseY - 2 - 4 + 7 + i, 0, 8, 164, 1, 164, 16);
                };
                e.guiGraphics.blit(new ResourceLocation('alienevo:textures/gui/power_screen/power_tooltip_large.png'),
                    mouseX + 13 - 5, mouseY - 2 - 4 + 8 + (numberOfWraps * 10), 0, 8, 164, 8, 164, 16);
                RenderSystem.disableBlend();
            };
            poseStack.popPose();
        }

        e.guiGraphics.blit(
            new ResourceLocation('alienevo:textures/gui/power_screen/power_interface_color.png'),
            iTexture, jTexture,
            0, 0,
            textureWidth, textureHeight,
            textureWidth, textureHeight
        );

        if (colorPalette.length === 0) {
            if (!loadPaletteFromProperties(player)) {
                generatePalette(baseColor.h, baseColor.s, baseColor.l);
            }
        }
        for (let sliderIdx = 0; sliderIdx < sliders.length; sliderIdx++) {
            updateSliderPosition(sliderIdx, i, j);
        }

        if (clicked) {
            let clickedOnSlider = false;
            for (let sliderIdx = 0; sliderIdx < sliders.length; sliderIdx++) {
                let slider = sliders[sliderIdx];
                if (
                    mouseX >= slider.x && mouseX <= slider.x + moduleSize &&
                    mouseY >= slider.y && mouseY <= slider.y + moduleSize
                ) {
                    dragging = true;
                    activeModule = sliderIdx;
                    dragOffsetX = mouseX - slider.x;
                    clickedOnSlider = true;
                    break;
                }
            }

            if (!clickedOnSlider) {
                for (let sliderIdx = 0; sliderIdx < sliders.length; sliderIdx++) {
                    let bounds = getTrackBounds(sliderIdx, i, j);
                    let trackKey = ['hue', 'saturation', 'lightness'][sliderIdx];
                    let trackY = j + trackOffsets[trackKey].y;

                    if (
                        mouseX >= bounds.minX && mouseX <= bounds.maxX &&
                        mouseY >= trackY - 3 && mouseY <= trackY + trackHeight + 2
                    ) {
                        let slider = sliders[sliderIdx];
                        let clampedMouseX = Math.max(bounds.minX, Math.min(bounds.maxX, mouseX));
                        let normalizedPosition = (clampedMouseX - bounds.trackStartX) / trackWidth;
                        normalizedPosition = Math.max(0, Math.min(1, normalizedPosition));
                        slider.value = Math.round(normalizedPosition * slider.max);

                        updateSliderPosition(sliderIdx, i, j);

                        dragging = true;
                        activeModule = sliderIdx;
                        dragOffsetX = moduleSize / 2;

                        baseColor.h = sliders[0].value;
                        baseColor.s = sliders[1].value;
                        baseColor.l = sliders[2].value;
                        generatePalette(baseColor.h, baseColor.s, baseColor.l);
                        break;
                    }
                }
            }
        }

        if (released) {
            if (dragging && activeModule !== -1) {
                player.playSound('minecraft:ui.button.click', 0.33, 1.0);
            }
            dragging = false;
            activeModule = -1;
        }

        if (dragging && activeModule !== -1) {
            let slider = sliders[activeModule];
            let bounds = getTrackBounds(activeModule, i, j);

            slider.x = mouseX - dragOffsetX;
            slider.x = Math.max(bounds.minX, Math.min(bounds.maxX, slider.x));

            let sliderCenterX = slider.x + (moduleSize / 2);
            let normalizedPosition = (sliderCenterX - bounds.trackStartX) / trackWidth;
            normalizedPosition = Math.max(0, Math.min(1, normalizedPosition));
            slider.value = Math.round(normalizedPosition * slider.max);

            baseColor.h = sliders[0].value;
            baseColor.s = sliders[1].value;
            baseColor.l = sliders[2].value;
            generatePalette(baseColor.h, baseColor.s, baseColor.l);

            // mirror sliders to hex box while editing
            if (editingHexCode && hexTextBox) {
                hexTextBox.setFocused(false);

                let rgbFromSliders = hslToRgb(baseColor.h, baseColor.s, baseColor.l);
                let hexFromSliders = rgbToHexString(rgbFromSliders[0], rgbFromSliders[1], rgbFromSliders[2]).toUpperCase();

                let currentValue = hexTextBox.getValue();
                if (!hexTextBox.isFocused() &&
                    currentValue !== hexFromSliders &&
                    /^[0-9A-Fa-f]{6}$/.test(currentValue)) {
                    hexTextBox.setValue(hexFromSliders);
                }
            }
        }

        if (!dragging) {
            baseColor.h = sliders[0].value;
            baseColor.s = sliders[1].value;
            baseColor.l = sliders[2].value;
            generatePalette(baseColor.h, baseColor.s, baseColor.l);
        }

        poseStack.pushPose();
        poseStack.translate(0, 0, 99);

        // Hue track
        let hueTrackX = i + trackOffsets.hue.x;
        let hueTrackY = j + trackOffsets.hue.y;
        for (let x = 0; x < trackWidth; x++) {
            let t = x / trackWidth;
            let hue = t * 360;
            let rgb = hslToRgb(hue, 100, 50);
            let color = rgbToHex(rgb[0], rgb[1], rgb[2]);
            e.guiGraphics.fill(hueTrackX + x, hueTrackY, hueTrackX + x + 1, hueTrackY + trackHeight, color);
        }

        // Saturation track
        let satTrackX = i + trackOffsets.saturation.x;
        let satTrackY = j + trackOffsets.saturation.y;
        let hueColor = hslToRgb(baseColor.h, 100, 50);
        for (let x = 0; x < trackWidth; x++) {
            let t = x / trackWidth;
            let r = Math.round(255 + (hueColor[0] - 255) * t);
            let g = Math.round(255 + (hueColor[1] - 255) * t);
            let b = Math.round(255 + (hueColor[2] - 255) * t);
            let color = rgbToHex(r, g, b);
            e.guiGraphics.fill(satTrackX + x, satTrackY, satTrackX + x + 1, satTrackY + trackHeight, color);
        }

        // Lightness track
        let lightTrackX = i + trackOffsets.lightness.x;
        let lightTrackY = j + trackOffsets.lightness.y;
        for (let x = 0; x < trackWidth; x++) {
            let t = x / trackWidth;
            let l = t * 100;
            let rgb = hslToRgb(0, 0, l);
            let color = rgbToHex(rgb[0], rgb[1], rgb[2]);
            e.guiGraphics.fill(lightTrackX + x, lightTrackY, lightTrackX + x + 1, lightTrackY + trackHeight, color);
        }

        poseStack.popPose();

        let boxWidth = 10;
        let boxHeight = 7;
        let startX = Math.floor(screenWidth / 2) + 179;
        let startY = Math.floor(screenHeight / 2) - 1;

        for (let i = 0; i < 5; i++) {
            let boxX = startX - (i * (boxWidth));
            let paletteIndex;
            if (colorPalette.length >= 5) {
                paletteIndex = i;
            } else if (colorPalette.length === 1) {
                paletteIndex = 0;
            } else {
                paletteIndex = Math.floor(i * (colorPalette.length - 1) / 4);
            }

            let paletteColor = rgbToHex(colorPalette[paletteIndex].r, colorPalette[paletteIndex].g, colorPalette[paletteIndex].b);
            e.guiGraphics.fill(boxX, startY, boxX + boxWidth, startY + boxHeight, paletteColor);
        }

        poseStack.pushPose();
        poseStack.translate(0, 0, 100);
        RenderSystem.enableBlend();

        e.guiGraphics.blit(
            new ResourceLocation('alienevo:textures/gui/power_screen/power_interface_color_shadows.png'),
            iTexture, jTexture,
            0, 0,
            textureWidth, textureHeight,
            textureWidth, textureHeight
        );

        poseStack.popPose();

        // Draw all slider handles
        poseStack.pushPose();
        poseStack.translate(0, 0, 101);
        for (let sliderIdx = 0; sliderIdx < sliders.length; sliderIdx++) {
            let slider = sliders[sliderIdx];
            let fillColor;
            let isHovered =
                mouseX >= slider.x && mouseX <= slider.x + moduleSize &&
                mouseY >= slider.y && mouseY <= slider.y + moduleSize;

            let isActive = (activeModule === sliderIdx);

            let sliderTextureHovered = (isHovered || isActive)
                ? 10
                : 0;

            if (sliderIdx === 0) {
                let rgb = hslToRgb(slider.value, 100, 50);
                fillColor = rgbToHex(rgb[0], rgb[1], rgb[2]);
            } else if (sliderIdx === 1) {
                let t = slider.value / 100;
                let hueColor = hslToRgb(baseColor.h, 100, 50);
                let r = Math.round(255 + (hueColor[0] - 255) * t);
                let g = Math.round(255 + (hueColor[1] - 255) * t);
                let b = Math.round(255 + (hueColor[2] - 255) * t);
                fillColor = rgbToHex(r, g, b);
            } else if (sliderIdx === 2) {
                let rgb = hslToRgb(0, 0, slider.value);
                fillColor = rgbToHex(rgb[0], rgb[1], rgb[2]);
            }

            e.guiGraphics.fill(
                Math.floor(slider.x), Math.floor(slider.y),
                Math.floor(slider.x + moduleSize), Math.floor(slider.y + moduleSize),
                fillColor
            );
            RenderSystem.enableBlend();
            e.guiGraphics.blit(
                new ResourceLocation('alienevo:textures/gui/power_screen/buttons.png'),
                Math.floor(slider.x), Math.floor(slider.y),
                sliderTextureHovered, 42,
                moduleSize, moduleSize,
                128, 128
            );
            RenderSystem.disableBlend();
        }
        RenderSystem.disableBlend();
        poseStack.popPose();


        if (editingHexCode === false) {

            let buttonEditHexX = (screenWidth / 2) + 191;
            let buttonEditHexY = (screenHeight / 2) - 4;
            let buttonEditHexOffset = (mouseX >= buttonEditHexX && mouseX <= buttonEditHexX + 67 && mouseY >= buttonEditHexY && mouseY <= buttonEditHexY + 13) ? 67 : 0;
            if (clicked) {
                if (mouseX >= buttonEditHexX && mouseX <= buttonEditHexX + 67 &&
                    mouseY >= buttonEditHexY && mouseY <= buttonEditHexY + 13) {
                    editingHexCode = true;
                    // editingNickname = false;
                    player.playSound('minecraft:ui.button.click', 0.33, 1.0);
                }
            };
            e.guiGraphics.blit(
                new ResourceLocation(`alienevo:textures/gui/power_screen/text_border.png`),
                Math.floor(screenWidth / 2 + 191), Math.floor(screenHeight / 2 - 4),
                0, 0,
                buttonEditHexOffset, 13,
                67, 13
            );

            // DRAW PREVIEW NUMBERS
            let hueFormatted = formatHSLNumber(baseColor.h, 3); // 3 digits for hue
            let satFormatted = formatHSLNumber(baseColor.s, 3); // 3 digits for saturation
            let lightFormatted = formatHSLNumber(baseColor.l, 3); // 3 digits for lightness
            let baseX = Math.floor(screenWidth / 2) + 194;
            let baseY = Math.floor(screenHeight / 2) - 1;
            let currentX = baseX;
            let font = Minecraft.getInstance().font;

            if (hueFormatted.padding) {
                palladium.gui.drawString(e.guiGraphics, hueFormatted.padding, currentX, baseY, 0x808080);
                currentX += font.width(hueFormatted.padding);
            }
            palladium.gui.drawString(e.guiGraphics, hueFormatted.number, currentX, baseY, 0xFFFFFF);
            currentX += font.width(hueFormatted.number);

            palladium.gui.drawString(e.guiGraphics, " ", currentX, baseY, 0xFFFFFF);
            currentX += font.width(" ");

            if (satFormatted.padding) {
                palladium.gui.drawString(e.guiGraphics, satFormatted.padding, currentX, baseY, 0x808080);
                currentX += font.width(satFormatted.padding);
            }
            palladium.gui.drawString(e.guiGraphics, satFormatted.number, currentX, baseY, 0xFFFFFF);
            currentX += font.width(satFormatted.number);

            palladium.gui.drawString(e.guiGraphics, " ", currentX, baseY, 0xFFFFFF);
            currentX += font.width(" ");

            if (lightFormatted.padding) {
                palladium.gui.drawString(e.guiGraphics, lightFormatted.padding, currentX, baseY, 0x808080);
                currentX += font.width(lightFormatted.padding);
            }
            palladium.gui.drawString(e.guiGraphics, lightFormatted.number, currentX, baseY, 0xFFFFFF);
            currentX += font.width(lightFormatted.number);

        } else if (editingHexCode === true) {
            let textboxBackgroundX = Math.floor(screenWidth / 2 + 193);
            let textboxBackgroundY = Math.floor(screenHeight / 2 - 5);
            let saveButtonX = Math.floor(screenWidth / 2 + 244);
            let saveButtonY = Math.floor(screenHeight / 2 - 4);

            // Draw textbox background
            e.guiGraphics.blit(
                new ResourceLocation("alienevo:textures/gui/power_screen/textbox_hex.png"),
                textboxBackgroundX, textboxBackgroundY,
                0, 0, 51, 16,
                51, 16
            );

            // Create textbox
            if (hexTextBox == null) {
                baseColor.h = sliders[0].value;
                baseColor.s = sliders[1].value;
                baseColor.l = sliders[2].value;

                let fontRenderer = Minecraft.getInstance().font;
                hexTextBox = new TextFieldWidget(
                    fontRenderer,
                    textboxBackgroundX + 4, textboxBackgroundY + 4,
                    43, 14,
                    Component.literal("")
                );
                hexTextBox.setMaxLength(6);
                hexTextBox.setBordered(false);
                hexTextBox.setEditable(true);
                hexTextBox.setVisible(true);
                e.screen.addRenderableWidget(hexTextBox);

                let seedRgbArray = hslToRgb(sliders[0].value, sliders[1].value, sliders[2].value);
                let seedHexString = rgbToHexString(seedRgbArray[0], seedRgbArray[1], seedRgbArray[2]).toUpperCase();
                hexTextBox.setValue(seedHexString);
            } else {
                hexTextBox.setPosition(textboxBackgroundX + 4, textboxBackgroundY + 4);
            }

            // Render
            hexTextBox.render(e.guiGraphics, mouseX, mouseY, e.partialTick);

            let currentTime = Date.now();
            if (currentTime - lastTickTime >= TICK_INTERVAL) {
                hexTextBox.tick();
                lastTickTime = currentTime;
            }

            // Draw save button
            let saveButtonHoverOffset = (mouseX >= saveButtonX && mouseX <= saveButtonX + 13 &&
                mouseY >= saveButtonY && mouseY <= saveButtonY + 14) ? 13 : 0;
            e.guiGraphics.blit(
                new ResourceLocation("alienevo:textures/gui/power_screen/buttons.png"),
                saveButtonX, saveButtonY,
                saveButtonHoverOffset + 52, 78,
                13, 14,
                128, 128
            );

            let rawTextboxValue = hexTextBox.getValue() || "";
            let cleanedHexString = rawTextboxValue.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6);
            if (cleanedHexString !== rawTextboxValue) {
                hexTextBox.setValue(cleanedHexString);
            }

            if (/^[0-9A-Fa-f]{6}$/.test(cleanedHexString)) {
                if (lastAppliedHex !== cleanedHexString) {
                    let rgbFromText = hexToRgb(cleanedHexString);
                    let hslFromText = rgbToHsl(rgbFromText.r, rgbFromText.g, rgbFromText.b);
                    baseColor.h = hslFromText[0];
                    baseColor.s = hslFromText[1];
                    baseColor.l = hslFromText[2];
                    sliders[0].value = baseColor.h;
                    sliders[1].value = baseColor.s;
                    sliders[2].value = baseColor.l;

                    lastAppliedHex = cleanedHexString;
                }
            }


            if (clicked &&
                mouseX >= saveButtonX && mouseX <= saveButtonX + 13 &&
                mouseY >= saveButtonY && mouseY <= saveButtonY + 14) {

                let textboxValueOnSave = (hexTextBox.getValue() || "").trim();
                if (!/^[0-9A-Fa-f]{6}$/.test(textboxValueOnSave)) {
                    console.log("addonpack_alienevo:kubejs_scripts/power_ui.js#1190: Invalid hex format. Use 6-digit hex (e.g., FF0000)");
                    let rgbFromBaseColor = hslToRgb(baseColor.h, baseColor.s, baseColor.l);
                    let hexFromBaseColor = rgbToHexString(rgbFromBaseColor[0], rgbFromBaseColor[1], rgbFromBaseColor[2]).toUpperCase();
                    hexTextBox.setValue(hexFromBaseColor);
                }

                editingHexCode = false;
                hexTextBox.setVisible(false);
                hexTextBox.setEditable(false);
                hexTextBox = null;

                player.playSound('minecraft:ui.button.click', 0.33, 1.0);
            }
        }

        let arrowWidth = 9;
        let arrowHeight = 15;
        let leftArrowX = (screenWidth / 2) + 144;
        let rightArrowX = (screenWidth / 2) + 240;
        let arrowY = (screenHeight / 2) - 77;

        if (clicked) {
            // Left arrow
            if (mouseX >= leftArrowX && mouseX <= leftArrowX + arrowWidth &&
                mouseY >= arrowY && mouseY <= arrowY + arrowHeight) {
                let totalSlots = getTotalColorSlots(currentAlienNumber, uniformType, e.tab);
                let newSlot = (selectedColorSlot - 1 + totalSlots) % totalSlots;
                changeColorSlot(newSlot, player, currentTab);
                editingHexCode = false;
                if (hexTextBox) {
                    hexTextBox.setVisible(false);
                    hexTextBox.setEditable(false);
                    hexTextBox = null;
                }
                player.playSound('minecraft:ui.button.click', 0.33, 1.0);
            }
            // Right arrow
            if (mouseX >= rightArrowX && mouseX <= rightArrowX + arrowWidth &&
                mouseY >= arrowY && mouseY <= arrowY + arrowHeight) {
                let totalSlots = getTotalColorSlots(currentAlienNumber, uniformType, e.tab);
                let newSlot = (selectedColorSlot + 1) % totalSlots;
                changeColorSlot(newSlot, player, currentTab);
                editingHexCode = false;
                if (hexTextBox) {
                    hexTextBox.setVisible(false);
                    hexTextBox.setEditable(false);
                    hexTextBox = null;
                }
                player.playSound('minecraft:ui.button.click', 0.33, 1.0);
            }
        }

        if (e.tab === omnitrixTab && selectedColorSlot != 0 && selectedColorSlot != 1 && selectedColorSlot != 2) {
            selectedColorSlot = 0
        }

        let leftArrowOffset = (mouseX >= leftArrowX && mouseX <= leftArrowX + arrowWidth && mouseY >= arrowY && mouseY <= arrowY + arrowHeight) ? 18 : 0;
        let rightArrowOffset = (mouseX >= rightArrowX && mouseX <= rightArrowX + arrowWidth && mouseY >= arrowY && mouseY <= arrowY + arrowHeight) ? 27 : 9;

        e.guiGraphics.blit(
            new ResourceLocation('alienevo:textures/gui/power_screen/buttons.png'),
            Math.floor(leftArrowX), Math.floor(arrowY),
            leftArrowOffset, 0,
            9, 15,
            128, 128
        );
        e.guiGraphics.blit(
            new ResourceLocation('alienevo:textures/gui/power_screen/buttons.png'),
            Math.floor(rightArrowX), Math.floor(arrowY),
            rightArrowOffset, 0,
            9, 15,
            128, 128
        );

        // Draw selected uniform text
        let slotInfo = getSlotInfo(selectedColorSlot, currentAlienNumber, uniformType, e.tab);
        let selectedUniform;

        if (slotInfo.type === 'uniform') {
            selectedUniform = Component.translate('colortype.ui.alienevo.' + slotInfo.index).getString();
        } else if (slotInfo.type === 'skin') {
            selectedUniform = Component.translate('colortype.ui.alienevo.skin').getString() + ' ' + slotInfo.index;
        }
        let selectedUniformWidth = Minecraft.getInstance().font.width(selectedUniform);

        palladium.gui.drawString(e.guiGraphics, Component.string(selectedUniform),
            (screenWidth / 2) - ((selectedUniformWidth + 9) / 2) + 196,
            (screenHeight / 2) - 74,
            0xffffff);

        let averageColor = "000000"; // fallback
        let uniformName;
        if (watchType === "prototype" && uniformType === "10k") {
            uniformName = "10k";
        } else {
            uniformName = watchType;
        }

        if (slotInfo && slotInfo.type === 'uniform') {
            if (slotInfo.index === 0) { // glow
                let tabString = String(e.tab);
                let useOmnitrixFallback = false;

                let hasAlienData = alienInfo && alienInfo[0] && currentAlienNumber != null;

                if (!tabString.toLowerCase().includes("omnitrix") && hasAlienData) {
                    let glowcolorKey = `alienevo_${currentAlienNumber}_${uniformType}_glowcolor_1`;
                    let originalGlowColors = global[glowcolorKey];
                    if (originalGlowColors && Array.isArray(originalGlowColors) && originalGlowColors.length > 0) {
                        let colorIndex = 0;
                        if (colorIndex < originalGlowColors.length) {
                            averageColor = originalGlowColors[colorIndex];
                        }
                    } else {
                        useOmnitrixFallback = true;
                    }
                } else {
                    useOmnitrixFallback = true;
                }

                if (useOmnitrixFallback) {
                    let watchPaletteKey = `watch_palette_${uniformName}`;
                    let watchPalette = global[watchPaletteKey];
                    if (watchPalette && Array.isArray(watchPalette) && watchPalette.length > 0) {
                        averageColor = watchPalette[0];
                    } else {
                        averageColor = "b3ff40";
                    }
                }
            } else if (slotInfo.index === 1) { // primary
                let defaultPrimaryColors = global["watch_palette_" + uniformName + "_uniform_primary"] || ["3a3333", "2c2828", "232020", "171515", "000000"];
                let colorIndex = 1;
                if (colorIndex < defaultPrimaryColors.length) {
                    averageColor = defaultPrimaryColors[colorIndex];
                }

            } else if (slotInfo.index === 2) { // secondary
                let defaultSecondaryColors = global["watch_palette_" + uniformName + "_uniform_secondary"] || ["ffffff", "edf4f4", "d6dfe1", "bdc7cf", "97a2b0"];
                let colorIndex = 1;
                if (colorIndex < defaultSecondaryColors.length) {
                    averageColor = defaultSecondaryColors[colorIndex];
                }
            }


        } else if (slotInfo && slotInfo.type === 'skin') {
            let originalKey = `alienevo_${currentAlienNumber}_${uniformType}_skincolor_palette_${slotInfo.index}`;
            let originalColors = global[originalKey];

            if (originalColors && Array.isArray(originalColors) && originalColors.length > 0) {
                let colorIndex = originalColors.length > 1 ? 1 : 0;
                averageColor = originalColors[colorIndex];
            }
        }

        let colorInt = parseInt(averageColor, 16);
        colorInt = 0xFF000000 | colorInt;

        let squareX = (screenWidth / 2) - ((selectedUniformWidth + 9) / 2) + 196 + 4 + selectedUniformWidth;
        let squareY = (screenHeight / 2) - 74;

        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 8; y++) {
                e.guiGraphics.fill(
                    squareX + x,
                    squareY + y,
                    squareX + x + 1,
                    squareY + y + 1,
                    colorInt
                );
            }
        }
        RenderSystem.enableBlend();
        e.guiGraphics.blit(
            new ResourceLocation('alienevo:textures/gui/power_screen/buttons.png'),
            Math.floor(squareX), Math.floor(squareY),
            20, 42,
            9, 8,
            128, 128
        );
        RenderSystem.disableBlend();

        let buttonConfirmWidth = 55;
        let buttonConfirmHeight = 15;
        let buttonResetX = (screenWidth / 2) + 137;
        let buttonApplyX = (screenWidth / 2) + 201;
        let buttonConfirmY = (screenHeight / 2) + 14;

        if (clicked) {
            if (mouseX >= buttonResetX && mouseX <= buttonResetX + buttonConfirmWidth &&
                mouseY >= buttonConfirmY && mouseY <= buttonConfirmY + buttonConfirmHeight) {
                resetColorSlotToDefaults(player);
                editingHexCode = false;
                if (hexTextBox) {
                    hexTextBox.setVisible(false);
                    hexTextBox.setEditable(false);
                    hexTextBox = null;
                }
                player.playSound('minecraft:ui.button.click', 0.33, 1.0);
            }
            if (mouseX >= buttonApplyX && mouseX <= buttonApplyX + buttonConfirmWidth &&
                mouseY >= buttonConfirmY && mouseY <= buttonConfirmY + buttonConfirmHeight) {
                savePaletteToProperties(player);
                editingHexCode = false;
                if (hexTextBox) {
                    hexTextBox.setVisible(false);
                    hexTextBox.setEditable(false);
                    hexTextBox = null;
                }
                player.playSound('minecraft:ui.button.click', 0.33, 1.0);
            }
        }

        let buttonResetOffset = (mouseX >= buttonResetX && mouseX <= buttonResetX + buttonConfirmWidth && mouseY >= buttonConfirmY && mouseY <= buttonConfirmY + buttonConfirmHeight) ? 55 : 0;
        let buttonApplyOffset = (mouseX >= buttonApplyX && mouseX <= buttonApplyX + buttonConfirmWidth && mouseY >= buttonConfirmY && mouseY <= buttonConfirmY + buttonConfirmHeight) ? 55 : 0;

        e.guiGraphics.blit(
            new ResourceLocation('alienevo:textures/gui/power_screen/buttons.png'),
            Math.floor(buttonResetX), Math.floor(buttonConfirmY),
            buttonResetOffset, 15,
            55, 15,
            128, 128
        );

        let buttonResetText = Component.translate(`buttons.ui.alienevo.reset`).getString();
        let resetTextWidth = Minecraft.getInstance().font.width(buttonResetText);
        palladium.gui.drawString(e.guiGraphics, Component.string(buttonResetText),
            (screenWidth / 2) - (resetTextWidth / 2) + 137 + 27 + 1,
            buttonConfirmY + 3,
            0xffffff);
        e.guiGraphics.blit(
            new ResourceLocation('alienevo:textures/gui/power_screen/buttons.png'),
            Math.floor(buttonApplyX), Math.floor(buttonConfirmY),
            buttonApplyOffset, 15,
            55, 15,
            128, 128
        );

        let buttonApplyText = Component.translate(`buttons.ui.alienevo.apply`).getString();
        let applyTextWidth = Minecraft.getInstance().font.width(buttonApplyText);
        palladium.gui.drawString(e.guiGraphics, Component.string(buttonApplyText),
            (screenWidth / 2) - (applyTextWidth / 2) + 201 + 27 + 1,
            buttonConfirmY + 3,
            0xffffff);

    }
    poseStack.popPose();

    poseStack.pushPose();
    poseStack.translate(0, 0, 501);
    // Draw Close Screen Button
    if (isPowerScreenClosed === false && e.tab === omnitrixTab || isPowerScreenClosed === false && allowedPowers.includes(e.tab.toString())) {
        let buttonShiftY = 5;
        if (e.tab === omnitrixTab) {
            buttonShiftY = 0;
        };
        let buttonCloseMenuX = (screenWidth / 2) + 118;
        let buttonCloseMenuY = (screenHeight / 2) - 124 - buttonShiftY;
        let buttonCloseMenuOffset = (mouseX >= buttonCloseMenuX && mouseX <= buttonCloseMenuX + 11 && mouseY >= buttonCloseMenuY && mouseY <= buttonCloseMenuY + 12) ? 11 : 0;

        if (clicked) {
            if (mouseX >= buttonCloseMenuX && mouseX <= buttonCloseMenuX + 11 &&
                mouseY >= buttonCloseMenuY && mouseY <= buttonCloseMenuY + 12) {
                isPowerScreenClosed = true;
                player.playSound('minecraft:ui.button.click', 0.33, 1.0);
            }
        };

        e.guiGraphics.blit(
            new ResourceLocation(`alienevo:textures/gui/power_screen/buttons.png`),
            Math.floor(screenWidth / 2 + 118), Math.floor(screenHeight / 2 - 124 - buttonShiftY),
            buttonCloseMenuOffset, 30,
            11, 12,
            128, 128
        );
    }
    poseStack.popPose();
});