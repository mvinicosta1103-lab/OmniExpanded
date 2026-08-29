tag @e[type=armor_stand, tag=SpikeRayStart] remove SpikeRayStart 
execute as @e[tag=SpikeRay] at @s rotated ~ 0 if block ^ ^1 ^ air run tp @s ^ ^0.5 ^1.5
execute as @e[tag=SpikeRay] at @s run function alienevo:aliens/petrosapien/spike_raycast_down 
execute as @e[tag=SpikeRay] at @s run scoreboard players add @s AlienEvo.SpikeRay 1
execute as @e[tag=SpikeRay, scores={AlienEvo.SpikeRay=10..}] at @s run kill @s
execute as @e[tag=SpikeRay] at @s run execute if block ~ ~ ~ air run function alienevo:aliens/petrosapien/spike_raycast_down 
