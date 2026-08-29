StartupEvents.registry("palladium:abilities", event => {
    const MotionPacket = Java.loadClass("net.minecraft.network.protocol.game.ClientboundSetEntityMotionPacket")

    const PROP_SPEED_GLIDE = "glide_speed"
    const PROP_SPEED_DROP = "drop_speed"
    const PROP_GRAVITY = "gravity"
    const PROP_ELYTRA_GLIDE = "elytra_glide"

    event
        .create("alienevo:elytra_flight")
        .addProperty(PROP_ELYTRA_GLIDE, "boolean", true, "To use elytra-style gliding or not. If false, it will simply be gliding, you cannot regain altitude by dive bombing.")
        .addProperty(PROP_SPEED_GLIDE, "float", 0.99, "How fast you glide horizontally, acts as a multiplier")
        .addProperty(PROP_SPEED_DROP, "float", 0.98, "How fast you fall. If elytra_glide is enabled, it is a multiplier. Otherwise, it is the minimum force of gravity if you look straight ahead.")
        .addProperty(PROP_GRAVITY, "float", 0.08, "Base gravity.")
        .tick((entity, entry, holder, enabled) => {
            if (!enabled || entity.onGround()) return

            const elytra_glide = entry.getPropertyByName(PROP_ELYTRA_GLIDE)
            const speed_glide = entry.getPropertyByName(PROP_SPEED_GLIDE)
            const speed_drop = entry.getPropertyByName(PROP_SPEED_DROP)
            const gravity = entry.getPropertyByName(PROP_GRAVITY)
            const lookVec = entity.getLookAngle()
            let deltaMoveVec = entity.getDeltaMovement()

            if (!entity.persistentData) entity.persistentData = {}
            const prevPitch = entity.persistentData.prevPitch || 0
            
            if (elytra_glide) {
                const pitchRad = (entity.getPitch() * KMath.PI) / 180
                const pitchLength = JavaMath.cos(pitchRad)
                const lookMagnitude = lookVec.horizontalDistance()
                const moveMagnitude = deltaMoveVec.horizontalDistance()
                const lookLength = lookVec.length()

                pitchLength = pitchLength * pitchLength * JavaMath.min(1, lookLength / 0.4)
                deltaMoveVec = entity.getDeltaMovement().add(0, gravity * (-1 + pitchLength * 0.75), 0)

                if (deltaMoveVec.y() < 0 && lookMagnitude > 0) {
                    const newY = deltaMoveVec.y() * -pitchLength
                    deltaMoveVec = deltaMoveVec.add((lookVec.x() * newY) / lookMagnitude, newY, (lookVec.z() * newY) / lookMagnitude)
                }

                if (pitchRad < 0 && lookMagnitude > 0) {
                    const newY = moveMagnitude * -JavaMath.sin(pitchRad) * 0.04
                    deltaMoveVec = deltaMoveVec.add((-lookVec.x() * newY) / lookMagnitude, newY * 3.2, (lookVec.z() * newY) / lookMagnitude)
                }

                if (lookMagnitude > 0) {
                    deltaMoveVec = deltaMoveVec.add(((lookVec.x() / lookMagnitude) * moveMagnitude - deltaMoveVec.x()) * 0.1, 0, ((lookVec.z() / lookMagnitude) * moveMagnitude - deltaMoveVec.z()) * 0.1)
                }

                deltaMoveVec = deltaMoveVec.multiply(speed_glide, speed_drop, speed_glide)

                const horizontalSpeed = JavaMath.sqrt(deltaMoveVec.x() * deltaMoveVec.x() + deltaMoveVec.z() * deltaMoveVec.z())

                let isPullingUp = false
                let shouldBoost = false

                const justStartedPullUp = pitchRad < -0.3 && prevPitch >= -0.3

                if (pitchRad < -0.3 && horizontalSpeed > 0.8) {
                    isPullingUp = true

                    if (justStartedPullUp) {
                        shouldBoost = true
                        const pullUpStrength = -pitchRad / (KMath.PI / 2)
                        const liftBoost = horizontalSpeed * pullUpStrength * 0.3
                        deltaMoveVec = deltaMoveVec.add(0, liftBoost, 0)
                    }
                }

                if (isPullingUp) {
                    deltaMoveVec = deltaMoveVec.add(0, -gravity * 0.1, 0)
                } else {
                    deltaMoveVec = deltaMoveVec.add(0, -gravity, 0)
                }

                const minDropSpeed = -gravity * 2
                if (deltaMoveVec.y() > minDropSpeed && deltaMoveVec.y() < 0.1 && !isPullingUp) {
                    deltaMoveVec = new Vec3d(deltaMoveVec.x(), minDropSpeed, deltaMoveVec.z())
                }
            } else {

                const addMoveVec = lookVec.scale(speed_glide)

                let verticalVelocity = deltaMoveVec.y() - gravity

                if (lookVec.y() < 0) {
                    verticalVelocity += lookVec.y() * speed_drop
                }

                deltaMoveVec = new Vec3d(
                    deltaMoveVec.x() + addMoveVec.x(), 
                    verticalVelocity, 
                    deltaMoveVec.z() + addMoveVec.z()
                )
            }

            entity.fallDistance = 0
            entity.setDeltaMovement(deltaMoveVec)

            entity.persistentData.prevPitch = entity.getPitch() * KMath.PI / 180

            if (entity.isPlayer()) {
                entity.connection.send(new MotionPacket(entity))
            }
        })
})