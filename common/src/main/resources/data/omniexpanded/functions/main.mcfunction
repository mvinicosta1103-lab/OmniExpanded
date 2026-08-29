### DIAMOND SPIKES ###
execute as @a[scores={carrot=1..}, nbt={SelectedItem:{id:"minecraft:carrot_on_a_stick",tag:{CustomModelData:2}}}] at @s run execute at @s run summon armor_stand ~ ~ ~ {Tags:[DiamondSpikeRay, DiamondSpikeRayStart], NoGravity:1,Invulnerable:1,Small:1,Invisible:1, Marker:1b}
execute as @a[scores={carrot=1..}, nbt={SelectedItem:{id:"minecraft:carrot_on_a_stick",tag:{CustomModelData:2}}}] at @s run tp @e[tag=DiamondSpikeRayStart] @s
scoreboard players add @e[type=armor_stand,tag=DiamondSpikes] AlienEvo.SpikesStart 1
execute as @e[scores={AlienEvo.SpikesStart=100..}, type=armor_stand] run kill @s
function alienevo:aliens/petrosapien/diamond_spike_raycast
function alienevo:aliens/petrosapien/diamond_spikes 