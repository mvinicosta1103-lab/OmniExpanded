# Particle effect
particle alienevo:slime ~ ~-0.05 ~ 1 0 1 0 1000 force

# Check if fire is nearby
execute if block ~ ~ ~ minecraft:fire run function alienevo:abilities/extinguish_fire
execute if block ~1 ~ ~ minecraft:fire run function alienevo:abilities/extinguish_fire
execute if block ~-1 ~ ~ minecraft:fire run function alienevo:abilities/extinguish_fire
execute if block ~ ~ ~1 minecraft:fire run function alienevo:abilities/extinguish_fire
execute if block ~ ~ ~-1 minecraft:fire run function alienevo:abilities/extinguish_fire

# Summon armor stand and add a scoreboard value to it
execute unless block ~ ~ ~ minecraft:fire unless block ~1 ~ ~ minecraft:fire unless block ~-1 ~ ~ minecraft:fire unless block ~ ~ ~1 minecraft:fire unless block ~ ~ ~-1 minecraft:fire unless entity @e[type=armor_stand,tag=slime_puddle,distance=..1.5] run summon armor_stand ~ ~ ~ {Invisible:1b,NoGravity:1b,Marker:1b,Tags:["slime_puddle"],Palladium:{Powers:{"alienevo:slime_puddle":{}},Properties:{superpowers:["alienevo:slime_puddle"]}},ActiveEffects:[{Id:14b,Amplifier:0b,Duration:2147483647,ShowParticles:0b}]}
execute as @e[type=armor_stand,tag=slime_puddle,sort=nearest,limit=4] run scoreboard players set @s slime_puddle_extinguished 50
