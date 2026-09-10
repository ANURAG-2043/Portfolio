import * as THREE from 'three'
import Experience from './Experience.js'

export default class Starfield {
    constructor() {
        this.experience = new Experience()
        this.camera = this.experience.camera
        this.time = this.experience.time

        this.setParticles()
    }

    setParticles() {
        const count = 6500
        const branches = 3
        const positions = new Float32Array(count * 3)
        const colors = new Float32Array(count * 3)
        this.radii = new Float32Array(count)
        this.radiusRatios = new Float32Array(count)
        this.branchAngles = new Float32Array(count)
        this.offsets = new Float32Array(count * 3)
        this.dissolveOffsets = new Float32Array(count * 3)
        const cyan = new THREE.Color('#59dfff')
        const coral = new THREE.Color('#ff916d')
        const core = new THREE.Color('#ffffff')
        const color = new THREE.Color()

        for (let index = 0; index < count; index++) {
            const point = index * 3
            const radiusRatio = Math.random()
            const radius = Math.pow(radiusRatio, 1.5) * 43
            const branchAngle = Math.floor(Math.random() * branches) * (Math.PI * 2 / branches)
            const randomSpread = Math.pow(Math.random(), 3) * (0.65 + radiusRatio * 5)
            const randomAngle = Math.random() * Math.PI * 2

            this.radii[index] = radius
            this.radiusRatios[index] = radiusRatio
            this.branchAngles[index] = branchAngle
            this.offsets[point] = Math.cos(randomAngle) * randomSpread
            this.offsets[point + 1] = Math.sin(randomAngle) * randomSpread * 0.65
            this.offsets[point + 2] = -44 - Math.random() * 24
            this.dissolveOffsets[point] = (Math.random() - 0.5) * (12 + radiusRatio * 42)
            this.dissolveOffsets[point + 1] = (Math.random() - 0.5) * (8 + radiusRatio * 28)
            this.dissolveOffsets[point + 2] = (Math.random() - 0.5) * 14

            positions[point] = Math.cos(branchAngle) * radius + this.offsets[point]
            positions[point + 1] = Math.sin(branchAngle) * radius * 0.63 + this.offsets[point + 1]
            positions[point + 2] = this.offsets[point + 2]

            const tone = Math.random()
            color.copy(tone > 0.91 ? coral : tone > 0.32 ? cyan : core)
            color.lerp(core, Math.max(0, 0.33 - radius / 115))
            colors[point] = color.r
            colors[point + 1] = color.g
            colors[point + 2] = color.b
        }

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

        const material = new THREE.PointsMaterial({
            map: this.createParticleTexture(),
            size: 0.68,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.9,
            vertexColors: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        })

        this.points = new THREE.Points(geometry, material)
        this.points.name = 'ambient-starfield'
        this.points.frustumCulled = false
        this.camera.instance.add(this.points)
        this.positionAttribute = geometry.getAttribute('position')
    }

    createParticleTexture() {
        const canvas = document.createElement('canvas')
        canvas.width = 64
        canvas.height = 64
        const context = canvas.getContext('2d')
        const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32)
        gradient.addColorStop(0, 'rgba(255,255,255,1)')
        gradient.addColorStop(0.18, 'rgba(212,246,255,0.98)')
        gradient.addColorStop(0.45, 'rgba(107,220,255,0.33)')
        gradient.addColorStop(1, 'rgba(107,220,255,0)')
        context.fillStyle = gradient
        context.fillRect(0, 0, 64, 64)

        const texture = new THREE.CanvasTexture(canvas)
        texture.encoding = THREE.sRGBEncoding
        return texture
    }

    update() {
        // Like the reference galaxy, inner stars orbit faster than outer stars.
        const seconds = this.time.elapsed * 0.001
        const positions = this.positionAttribute.array
        const loopProgress = (seconds % 18) / 18
        const rawDissolve = loopProgress < 0.5 ? loopProgress * 2 : (1 - loopProgress) * 2
        const dissolve = rawDissolve * rawDissolve * (3 - 2 * rawDissolve)

        for (let index = 0; index < this.radii.length; index++) {
            const point = index * 3
            const angle = this.branchAngles[index] + seconds * (1 - this.radiusRatios[index]) * 0.85
            const radius = this.radii[index]

            const galaxyX = Math.cos(angle) * radius + this.offsets[point]
            const galaxyY = Math.sin(angle) * radius * 0.63 + this.offsets[point + 1]
            const galaxyZ = this.offsets[point + 2] + Math.sin(seconds + this.radiusRatios[index] * 8) * 1.5

            positions[point] = galaxyX + this.dissolveOffsets[point] * dissolve
            positions[point + 1] = galaxyY + this.dissolveOffsets[point + 1] * dissolve
            positions[point + 2] = galaxyZ + this.dissolveOffsets[point + 2] * dissolve
        }

        this.positionAttribute.needsUpdate = true
    }
}
