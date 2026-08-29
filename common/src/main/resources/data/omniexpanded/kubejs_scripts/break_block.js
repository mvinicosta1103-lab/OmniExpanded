BlockEvents.leftClicked(event => {
  let player = event.player;
  
  if (player && abilityUtil.hasPower(player, "alienevo_aliens:petrosapien")) {
    let block = event.block;
    
    if (block.id == 'alienevo:smooth_crystal_block' || block.id == 'alienevo:crystal_block') {
      let x = block.x;
      let y = block.y;
      let z = block.z;
      
      try {
        event.level.setBlockAndUpdate(new BlockPos(x, y, z), Blocks.AIR.defaultBlockState());
        event.level.playSound(null, x, y, z, "minecraft:block.amethyst_block.break", "ambient", 1.0, 1.0);
      } catch (e) {
      }
    }
  }
});