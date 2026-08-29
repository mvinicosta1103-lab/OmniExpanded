fill ~ ~1 ~ ~ ~-1 ~ minecraft:air replace minecraft:command_block
summon armor_stand ~ ~ ~ {Invisible:1b,Invulnerable:1b,NoBasePlate:1b,NoGravity:1b,Tags:["Pyronite.Absorb"]}
setblock ~ ~ ~ fire
superpower set alienevo_aliens:pyronite_absorb @e[type=minecraft:armor_stand,tag=Pyronite.Absorb]