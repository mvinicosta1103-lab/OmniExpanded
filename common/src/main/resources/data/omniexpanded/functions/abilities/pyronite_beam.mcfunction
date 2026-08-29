particle alienevo:pyronite_flame ~ ~ ~ 0.1 0.2 0.1 0.1 3
fill ~ ~1 ~ ~ ~-1 ~ fire replace minecraft:air
execute if block ~ ~ ~ minecraft:grass run setblock ~ ~ ~ minecraft:fire destroy
execute if block ~ ~ ~ minecraft:snow run setblock ~ ~ ~ minecraft:fire destroy
execute if block ~ ~ ~ minecraft:dead_bush run setblock ~ ~ ~ minecraft:fire destroy
execute if block ~ ~ ~ #minecraft:flowers run setblock ~ ~ ~ minecraft:fire destroy
execute if block ~ ~ ~ minecraft:tall_grass[half=lower] run setblock ~ ~ ~ minecraft:fire destroy
execute if block ~ ~ ~ minecraft:tall_grass[half=upper] run setblock ~ ~ ~ minecraft:fire destroy
data merge block ~ ~ ~ {BurnTime:100s}
data merge block ~ ~ ~ {CookTime:199s}
data merge block ~ ~ ~ {lit:1b}
