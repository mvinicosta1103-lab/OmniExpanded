execute if block ~ ~ ~ #minecraft:fire run scoreboard players set @s Pyronite.Extinguish 249
execute if block ~ ~ ~ minecraft:lava run scoreboard players set @s Pyronite.Extinguish 249
execute if block ~ ~ ~ minecraft:lava_cauldron run scoreboard players set @s Pyronite.Extinguish 249
execute as @s run scoreboard players add @s Pyronite.Extinguish 1
execute if score @s Pyronite.Extinguish matches 250 run playsound minecraft:item.firecharge.use master @a ~ ~ ~
execute if score @s Pyronite.Extinguish matches 250 run particle alienevo:pyronite_flame ~ ~0.5 ~ 0.3 0.7 0.3 0.1 10
execute if score @s Pyronite.Extinguish matches 250 run tag @s remove Pyronite.Extinguish
execute if score @s Pyronite.Extinguish matches 250 run scoreboard players set @s Pyronite.Extinguish 0
