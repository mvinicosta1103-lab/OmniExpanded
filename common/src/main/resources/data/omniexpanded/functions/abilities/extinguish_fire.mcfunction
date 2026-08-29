# Extinguish nearby fire with larger radius
tag @e[distance=..10,tag=slime_puddle] add extinguished
scoreboard players set @e[distance=..12,tag=extinguished] slime_puddle_extinguished 100
fill ~-4 ~-2 ~-4 ~4 ~2 ~4 minecraft:air replace minecraft:fire
fill ~-4 ~-2 ~-4 ~4 ~2 ~4 minecraft:air replace minecraft:soul_fire
# Particle effect for extinguishing (increased particle count and spread)
particle minecraft:smoke ~ ~ ~ 2 2 2 0.1 100 force
playsound minecraft:block.fire.extinguish neutral @a ~ ~ ~ 1.5 0.7
