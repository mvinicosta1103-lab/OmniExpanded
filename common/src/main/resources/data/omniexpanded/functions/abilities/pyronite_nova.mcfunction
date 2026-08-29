execute as @s run scoreboard players add @s Pyronite.Nova 1
execute if score @s Pyronite.Nova matches 1 run effect give @s minecraft:levitation 2 1 true
execute if score @s Pyronite.Nova matches 35 run particle alienevo:pyronite_flame ^ ^2 ^ 0 0 0 0.3 6500
execute if score @s Pyronite.Nova matches 40 run playsound minecraft:entity.generic.explode master @a ~ ~ ~ 5
execute if score @s Pyronite.Nova matches 40 run playsound minecraft:entity.generic.extinguish_fire master @a ~ ~ ~ 5 0.1
execute if score @s Pyronite.Nova matches 40 run fill ~-6 ~-6 ~-6 ~6 ~6 ~6 fire replace minecraft:air
execute if score @s Pyronite.Nova matches 40 run scoreboard players set @s Pyronite.Release 0