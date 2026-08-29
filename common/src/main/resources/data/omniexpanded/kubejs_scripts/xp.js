EntityEvents.death(event => {
    let target = event.entity;
    let source = event.source;
    
    if (source && source.player) {
        let player = source.player;
        let entityMaxHealth = target.maxHealth;
        
        let currentAlienNumber = palladium.getProperty(player, 'omnitrix_cycle');
        
        if (currentAlienNumber && currentAlienNumber > 0) {
            let alienInfo = global[`alienevo_alien_${currentAlienNumber}`];
            if (!alienInfo) return;
            
            let alienFullName = alienInfo[0];
            let alienNamespace = 'alienevo_aliens';
            let alienPath = alienFullName;
            
            if (alienFullName.includes(':')) {
                const parts = alienFullName.split(':');
                alienNamespace = parts[0];
                alienPath = parts[1];
            }
            
            const powerName = `${alienNamespace}:${alienPath}`;
            
            const hasPower = abilityUtil.hasPower(player, powerName);
            
            if (hasPower) {
                let username = player.getGameProfile().getName();
                
                let scoreboard = Utils.server.scoreboard;
                
                let simpleName = alienPath.charAt(0).toUpperCase() + alienPath.slice(1);
                
                let levelObj = scoreboard.getObjective(`${simpleName}.Level`);
                let xpObj = scoreboard.getObjective(`${simpleName}.XP`);
                let skillPointsObj = scoreboard.getObjective(`${simpleName}.SkillPoint`);
                let prototypeSkillObj = scoreboard.getObjective(`AlienEvo.PrototypeSkillP`);
                
                if (levelObj && xpObj) {
                    let playerScore = scoreboard.getOrCreatePlayerScore(username, xpObj);
                    let currentXp = playerScore.getScore();
                    let levelScore = scoreboard.getOrCreatePlayerScore(username, levelObj);
                    let currentLevel = levelScore.getScore();
                    
                    if (currentLevel >= 10) {
                        playerScore.setScore(0);
                        return;
                    }
                    
                    let xpToAdd = Math.round(entityMaxHealth * 0.425); 
                    
                    playerScore.setScore(currentXp + xpToAdd);
                    
                    let maxXp = currentLevel === 0 ? 100 : 100 * currentLevel;
                    
                    if (currentXp + xpToAdd >= maxXp) {
                        let newLevel = currentLevel + 1;
                        
                        if (newLevel >= 10) {
                            levelScore.setScore(10);
                            playerScore.setScore(0);
                            
                            if (skillPointsObj) {
                                let skillPointsScore = scoreboard.getOrCreatePlayerScore(username, skillPointsObj);
                                skillPointsScore.setScore(skillPointsScore.getScore() + 1);
                            }
                            
                            if (prototypeSkillObj) {
                                let prototypeSkillScore = scoreboard.getOrCreatePlayerScore(username, prototypeSkillObj);
                                prototypeSkillScore.setScore(prototypeSkillScore.getScore() + 1);
                            }
                            
                            event.level.playSound(null, player.x, player.y, player.z, "minecraft:entity.player.levelup", "ambient", 2, 1);
                        } else {
                            levelScore.setScore(newLevel);
                            
                            playerScore.setScore((currentXp + xpToAdd) - maxXp);
                            
                            if (skillPointsObj) {
                                let skillPointsScore = scoreboard.getOrCreatePlayerScore(username, skillPointsObj);
                                skillPointsScore.setScore(skillPointsScore.getScore() + 1);
                            }
                            
                            event.level.playSound(null, player.x, player.y, player.z, "minecraft:entity.player.levelup", "ambient", 2, 1);
                        }
                    }
                }
            }
        }
    }
});