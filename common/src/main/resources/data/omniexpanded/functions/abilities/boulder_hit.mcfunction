particle block stone ~ ~1 ~ 1 1 1 0 30 normal
particle block dirt ~ ~1 ~ 1 1 1 0 30 normal
particle block sandstone ~ ~1 ~ 1 1 1 0 30 normal
particle minecraft:explosion ~ ~1 ~ 1 1 1 0 6 normal
playsound minecraft:block.stone.break neutral @a ~ ~ ~ 0.8 0.5
playsound minecraft:entity.generic.big_fall neutral @a ~ ~ ~ 1.0 0.7
summon falling_block ~ ~ ~ {BlockState:{Name:"minecraft:dirt"},Motion:[0.2d,0.3d,0.15d]}
summon falling_block ~ ~ ~ {BlockState:{Name:"minecraft:dirt"},Motion:[-0.15d,0.3d,0.2d]}
summon falling_block ~ ~ ~ {BlockState:{Name:"minecraft:dirt"},Motion:[0.25d,0.2d,-0.15d]}
summon falling_block ~ ~ ~ {BlockState:{Name:"minecraft:dirt"},Motion:[-0.2d,0.25d,-0.2d]}
summon falling_block ~ ~ ~ {BlockState:{Name:"minecraft:dirt"},Motion:[0.15d,0.35d,0.0d]}
summon falling_block ~ ~ ~ {BlockState:{Name:"minecraft:dirt"},Motion:[-0.15d,0.35d,0.0d]}
tag @e[palladium.power=alienevo_aliens:tetramand,distance=0..30,sort=nearest] add AlienEvo.ScreenShake