fill ~ ~ ~ ~ ~-1 ~ fire replace air
fill ~ ~ ~ ~ ~-1 ~ fire replace air
fill ~ ~ ~ ~ ~-1 ~ fire replace air
fill ~1 ~1 ~1 ~-1 ~-1 ~-1 fire replace air
fill ~1 ~1 ~1 ~-1 ~-1 ~-1 fire replace air
fill ~1 ~1 ~1 ~-1 ~-1 ~-1 fire replace air
execute if block ~ ~ ~ minecraft:grass run setblock ~ ~ ~ minecraft:fire destroy
execute if block ~ ~ ~ minecraft:snow run setblock ~ ~ ~ minecraft:fire destroy
execute if block ~ ~ ~ minecraft:dead_bush run setblock ~ ~ ~ minecraft:fire destroy
execute if block ~ ~ ~ #minecraft:flowers run setblock ~ ~ ~ minecraft:fire destroy
execute if block ~ ~ ~ minecraft:tall_grass[half=lower] run setblock ~ ~ ~ minecraft:fire destroy
execute if block ~ ~ ~ minecraft:tall_grass[half=upper] run setblock ~ ~ ~ minecraft:fire destroy