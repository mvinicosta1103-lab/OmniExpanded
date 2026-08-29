
execute align xyz run particle minecraft:dust 0.7 1 18000000 2 ~0.5 ~0.5 ~0.5 0.4 0.2 0.4 0 1
playsound minecraft:block.glass.break block @a[distance=..20] ~ ~ ~ 0.75 1.4 0.025
fill ~ ~ ~ ~ ~ ~ minecraft:air replace fire
execute if block ~ ~ ~ minecraft:water run setblock ~ ~ ~ minecraft:ice
execute if block ~ ~ ~ alienevo:ice14 run setblock ~ ~ ~ alienevo:ice_block replace
execute if block ~ ~ ~ alienevo:ice12 run setblock ~ ~ ~ alienevo:ice14 replace
execute if block ~ ~ ~ alienevo:ice10 run setblock ~ ~ ~ alienevo:ice12 replace
execute if block ~ ~ ~ alienevo:ice8 run setblock ~ ~ ~ alienevo:ice10 replace
execute if block ~ ~ ~ alienevo:ice6 run setblock ~ ~ ~ alienevo:ice8 replace
execute if block ~ ~ ~ alienevo:ice4 run setblock ~ ~ ~ alienevo:ice6 replace
execute if block ~ ~ ~ alienevo:ice run setblock ~ ~ ~ alienevo:ice4 replace
execute if block ~ ~ ~ #afomni:no_hitbox_2 run setblock ~ ~ ~ alienevo:ice

