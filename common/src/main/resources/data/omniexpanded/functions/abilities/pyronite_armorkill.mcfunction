execute as @s run scoreboard players add @s Pyronite.Absorb 1
execute if score @s Pyronite.Absorb matches 20 run gamerule sendCommandFeedback true
execute if score @s Pyronite.Absorb matches 20 run fill ~6 ~6 ~6 ~-6 ~-6 ~-6 minecraft:air replace #minecraft:fire
execute if score @s Pyronite.Absorb matches 20 run scoreboard players add @p[palladium.power=alienevo_aliens:pyronite,limit=1,sort=nearest] Pyronite.Release 1
execute if score @s Pyronite.Absorb matches 20 run effect give @p[palladium.power=alienevo_aliens:pyronite,limit=1,sort=nearest] minecraft:regeneration 2 1 true
execute if score @s Pyronite.Absorb matches 20 run scoreboard players set @p[palladium.power=alienevo_aliens:pyronite,tag=Pyronite.Extinguish,limit=1,sort=nearest] Pyronite.Extinguish 245
execute if score @s Pyronite.Absorb matches 20 run kill @s
