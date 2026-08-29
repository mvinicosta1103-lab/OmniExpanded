execute as @s run scoreboard players add @s AlienEvo.Possession 1
execute if score @s AlienEvo.Possession matches 1 run execute at @s run playsound minecraft:entity.illusioner.mirror_move master @a[distance=..4] ~ ~ ~ 1 1.4
execute if score @s AlienEvo.Possession matches 1 run execute at @s run tag @e[limit=1,tag=!Ectonurite,distance=..4.5] add possessTarget
execute if score @s AlienEvo.Possession matches 1 run execute at @s run data merge entity @e[tag=possessTarget,limit=1,distance=..6.5] {NoAI:1,Silent:1,Invulnerable:1}
execute if score @s AlienEvo.Possession matches 1 run execute as @s run team join ghost
execute if score @s AlienEvo.Possession matches 1 run execute as @e[tag=possessTarget,limit=1,distance=..8] run team join ghost
execute if score @s AlienEvo.Possession matches 1 run execute as @s run tp @e[tag=possessTarget,limit=1,distance=..6.5] ~ ~ ~ ~ ~
execute if score @s AlienEvo.Possession matches 3.. run scoreboard players remove @s AlienEvo.Possession 1