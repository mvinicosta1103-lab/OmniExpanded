StartupEvents.registry("palladium:abilities", event => {
    const MotionPacket = Java.loadClass("net.minecraft.network.protocol.game.ClientboundSetEntityMotionPacket")
    const PROP_BOUNCE_POWER = "bounce_power"
    const PROP_MIN_FALL_DISTANCE = "min_fall_distance"
    const PROP_MAX_BOUNCES = "max_bounces"
    const PROP_ENERGY_LOSS = "energy_loss"
    const PROP_FORWARD_BOOST = "forward_boost"
    const PROP_MAINTAIN_MOMENTUM = "maintain_momentum"

    event
        .create("alienevo:bounce")
        .addProperty(PROP_BOUNCE_POWER, "float", 0.8, "How much of the fall velocity is converted to upward bounce (0.0 - 1.0)")
        .addProperty(PROP_MIN_FALL_DISTANCE, "float", 2.0, "Minimum fall distance required to trigger a bounce")
        .addProperty(PROP_MAX_BOUNCES, "integer", 5, "Maximum number of consecutive bounces before stopping")
        .addProperty(PROP_ENERGY_LOSS, "float", 0.9, "Energy retained after each bounce (0.0 - 1.0)")
        .addProperty(PROP_FORWARD_BOOST, "float", 0.3, "Forward momentum boost on bounce (0.0 - 1.0)")
        .addProperty(PROP_MAINTAIN_MOMENTUM, "boolean", true, "Whether to maintain horizontal momentum through bounces")
        .tick((entity, entry, holder, enabled) => {
            if (!enabled) return
            if (!entity.isPlayer() || !entity.tags.contains("AlienEvo.Bounce")) {
                if (entity.persistentData) {
                    delete entity.persistentData.bounceCount
                    delete entity.persistentData.lastBounceVelocity
                    delete entity.persistentData.trackedFallDistance
                    delete entity.persistentData.lastY
                    delete entity.persistentData.wasFalling
                    delete entity.persistentData.groundTicks
                    delete entity.persistentData.pendingMotion
                    delete entity.persistentData.motionDelay
                }
                return
            }

            const bouncePower = entry.getPropertyByName(PROP_BOUNCE_POWER)
            const minFallDistance = entry.getPropertyByName(PROP_MIN_FALL_DISTANCE)
            const maxBounces = entry.getPropertyByName(PROP_MAX_BOUNCES)
            const energyLoss = entry.getPropertyByName(PROP_ENERGY_LOSS)
            const forwardBoost = entry.getPropertyByName(PROP_FORWARD_BOOST)
            const maintainMomentum = entry.getPropertyByName(PROP_MAINTAIN_MOMENTUM)

            if (!entity.persistentData) entity.persistentData = {}
            if (entity.persistentData.bounceCount === undefined) entity.persistentData.bounceCount = 0
            if (entity.persistentData.lastBounceVelocity === undefined) entity.persistentData.lastBounceVelocity = 0
            if (entity.persistentData.trackedFallDistance === undefined) entity.persistentData.trackedFallDistance = 0
            if (entity.persistentData.lastY === undefined) entity.persistentData.lastY = entity.getY()
            if (entity.persistentData.motionDelay === undefined) entity.persistentData.motionDelay = 0

            if (entity.persistentData.motionDelay > 0) {
                entity.persistentData.motionDelay--
                if (entity.persistentData.motionDelay === 0 && entity.persistentData.pendingMotion) {
                    const pendingMotion = entity.persistentData.pendingMotion
                    const motion = new Vec3d(pendingMotion.x, pendingMotion.y, pendingMotion.z)
                    entity.setDeltaMovement(motion)
                    entity.connection.send(new MotionPacket(entity))
                    delete entity.persistentData.pendingMotion
                }
            }

            let motion = entity.getDeltaMovement()
            const currentY = entity.getY()

            if (!entity.onGround() && motion.y() < 0) {
                const fallThisTick = entity.persistentData.lastY - currentY
                if (fallThisTick > 0) {
                    entity.persistentData.trackedFallDistance += fallThisTick
                }
            }

            if (entity.onGround() && entity.persistentData.wasFalling) {
                if (entity.isCrouching()) {
                    entity.removeTag("AlienEvo.Bounce")
                    entity.persistentData.bounceCount = 0
                    entity.persistentData.trackedFallDistance = 0
                    delete entity.persistentData.wasFalling
                    delete entity.persistentData.groundTicks
                    delete entity.persistentData.pendingMotion
                    delete entity.persistentData.motionDelay
                    return
                }

                const fallDistance = entity.persistentData.trackedFallDistance

                if (fallDistance >= minFallDistance && entity.persistentData.bounceCount < maxBounces) {

                    let bounceVelocity = JavaMath.sqrt(fallDistance * 0.1) * bouncePower

                    const energyMultiplier = JavaMath.pow(energyLoss, entity.persistentData.bounceCount)
                    const originalVelocity = bounceVelocity
                    bounceVelocity *= energyMultiplier

                    if (bounceVelocity > 0.1) {
                        let xMotion = motion.x()
                        let zMotion = motion.z()
                        const yawRadians = (entity.yaw + 90) * (JavaMath.PI / 180)
                        const forwardX = JavaMath.cos(yawRadians)
                        const forwardZ = JavaMath.sin(yawRadians)

                        if (maintainMomentum) {
                            xMotion *= energyMultiplier
                            zMotion *= energyMultiplier
                        }

                        const boostAmount = forwardBoost * bounceVelocity * 0.5 // Scale with bounce height
                        xMotion += forwardX * boostAmount
                        zMotion += forwardZ * boostAmount

                        entity.persistentData.pendingMotion = {
                            x: xMotion,
                            y: bounceVelocity,
                            z: zMotion
                        }
                       const delay = JavaMath.max(1, 2 - entity.persistentData.bounceCount)
                        entity.persistentData.motionDelay = delay
                        entity.fallDistance = 0
                        entity.persistentData.trackedFallDistance = 0
                        entity.persistentData.bounceCount++
                        entity.persistentData.lastBounceVelocity = bounceVelocity

                    } else {
                        entity.removeTag("AlienEvo.Bounce")
                        entity.persistentData.bounceCount = 0
                        delete entity.persistentData.wasFalling
                        delete entity.persistentData.groundTicks
                        delete entity.persistentData.trackedFallDistance
                        delete entity.persistentData.pendingMotion
                        delete entity.persistentData.motionDelay
                    }
                } else {
                    entity.removeTag("AlienEvo.Bounce")
                    entity.persistentData.bounceCount = 0
                    entity.persistentData.trackedFallDistance = 0
                    delete entity.persistentData.wasFalling
                    delete entity.persistentData.groundTicks
                    delete entity.persistentData.pendingMotion
                    delete entity.persistentData.motionDelay
                }
            }
            if (entity.onGround() && motion.y() <= 0 && motion.y() > -0.1) {
                if (entity.persistentData.groundTicks === undefined) entity.persistentData.groundTicks = 0
                entity.persistentData.groundTicks++

                if (entity.persistentData.groundTicks > 10) {
                    entity.removeTag("AlienEvo.Bounce")
                    entity.persistentData.bounceCount = 0
                    entity.persistentData.groundTicks = 0
                    entity.persistentData.trackedFallDistance = 0
                    delete entity.persistentData.wasFalling
                    delete entity.persistentData.pendingMotion
                    delete entity.persistentData.motionDelay
                }
            } else {
                entity.persistentData.groundTicks = 0
            }

            const wasFallingBefore = entity.persistentData.wasFalling
            entity.persistentData.wasFalling = !entity.onGround() && motion.y() < 0

            if (!wasFallingBefore && entity.persistentData.wasFalling) {
                entity.persistentData.trackedFallDistance = 0
            }

            entity.persistentData.lastY = currentY
        })
})