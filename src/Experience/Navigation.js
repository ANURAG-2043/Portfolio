import * as THREE from 'three'
import Experience from './Experience.js'
import normalizeWheel from 'normalize-wheel'

export default class Navigation
{
    constructor()
    {
        this.experience = new Experience()
        this.targetElement = this.experience.targetElement
        this.camera = this.experience.camera
        this.config = this.experience.config
        this.time = this.experience.time

        this.setView()
    }

    setView()
    {
        this.view = {}

        this.view.spherical = {}
        this.view.spherical.value = new THREE.Spherical(30, Math.PI * 0.35, - Math.PI * 0.25)
        // this.view.spherical.value.radius = 5
        this.view.spherical.smoothed = this.view.spherical.value.clone()
        this.view.spherical.smoothing = 0.005
        this.view.spherical.limits = {}
        this.view.spherical.limits.radius = { min: 10, max: 50 }
        this.view.spherical.limits.phi = { min: 0.01, max: Math.PI * 0.5 }
        this.view.spherical.limits.theta = { min: - Math.PI * 0.5, max: 0 }

        this.view.target = {}
        this.view.target.value = new THREE.Vector3(0, 2, 0)
        // this.view.target.value.set(0, 3, -3)
        this.view.target.smoothed = this.view.target.value.clone()
        this.view.target.smoothing = 0.005
        this.view.target.limits = {}
        this.view.target.limits.x = { min: - 4, max: 4 }
        this.view.target.limits.y = { min: 1, max: 6 }
        this.view.target.limits.z = { min: - 4, max: 4 }

        this.view.drag = {}
        this.view.drag.delta = {}
        this.view.drag.delta.x = 0
        this.view.drag.delta.y = 0
        this.view.drag.previous = {}
        this.view.drag.previous.x = 0
        this.view.drag.previous.y = 0
        this.view.drag.sensitivity = 1
        this.view.drag.alternative = false

        this.view.zoom = {}
        this.view.zoom.sensitivity = 0.01
        this.view.zoom.delta = 0

        /**
         * Methods
         */
        this.view.down = (_x, _y) =>
        {
            this.view.drag.previous.x = _x
            this.view.drag.previous.y = _y
        }

        this.view.move = (_x, _y) =>
        {
            this.view.drag.delta.x += _x - this.view.drag.previous.x
            this.view.drag.delta.y += _y - this.view.drag.previous.y

            this.view.drag.previous.x = _x
            this.view.drag.previous.y = _y
        }

        this.view.up = () =>
        {

        }

        this.view.zoomIn = (_delta) =>
        {
            this.view.zoom.delta += _delta
        }

        // Keep gestures on the room surface; normal links retain native touch behavior.
        const pointers = new Map()
        this.targetElement.addEventListener('pointerdown', (event) => {
            pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
            this.targetElement.setPointerCapture(event.pointerId)
            this.view.drag.alternative = pointers.size > 1 || event.button === 2 || event.button === 1 || event.ctrlKey || event.shiftKey
            this.view.down(event.clientX, event.clientY)
        })
        this.targetElement.addEventListener('pointermove', (event) => {
            if (!pointers.has(event.pointerId)) return
            pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
            this.view.move(event.clientX, event.clientY)
        })
        const endPointer = (event) => {
            pointers.delete(event.pointerId)
            this.view.up()
            const remaining = pointers.values().next().value
            if (remaining) this.view.down(remaining.x, remaining.y)
            this.view.drag.alternative = pointers.size > 1
        }
        this.targetElement.addEventListener('pointerup', endPointer)
        this.targetElement.addEventListener('pointercancel', endPointer)
        this.targetElement.addEventListener('lostpointercapture', endPointer)
        this.targetElement.addEventListener('contextmenu', (event) => event.preventDefault())
        this.targetElement.addEventListener('wheel', (event) => {
            event.preventDefault()
            this.view.zoomIn(normalizeWheel(event).pixelY)
        }, { passive: false })
    }

    update()
    {
        /**
         * View
         */
        // Zoom
        this.view.spherical.value.radius += this.view.zoom.delta * this.view.zoom.sensitivity

        // Apply limits
        this.view.spherical.value.radius = Math.min(Math.max(this.view.spherical.value.radius, this.view.spherical.limits.radius.min), this.view.spherical.limits.radius.max)

        // Drag
        if(this.view.drag.alternative)
        {
            const up = new THREE.Vector3(0, 1, 0)
            const right = new THREE.Vector3(- 1, 0, 0)

            up.applyQuaternion(this.camera.modes.default.instance.quaternion)
            right.applyQuaternion(this.camera.modes.default.instance.quaternion)

            up.multiplyScalar(this.view.drag.delta.y * 0.01)
            right.multiplyScalar(this.view.drag.delta.x * 0.01)

            this.view.target.value.add(up)
            this.view.target.value.add(right)

            // Apply limits
            this.view.target.value.x = Math.min(Math.max(this.view.target.value.x, this.view.target.limits.x.min), this.view.target.limits.x.max)
            this.view.target.value.y = Math.min(Math.max(this.view.target.value.y, this.view.target.limits.y.min), this.view.target.limits.y.max)
            this.view.target.value.z = Math.min(Math.max(this.view.target.value.z, this.view.target.limits.z.min), this.view.target.limits.z.max)
        }
        else
        {
            this.view.spherical.value.theta -= this.view.drag.delta.x * this.view.drag.sensitivity / this.config.smallestSide
            this.view.spherical.value.phi -= this.view.drag.delta.y * this.view.drag.sensitivity / this.config.smallestSide    
        
            // Apply limits
            this.view.spherical.value.theta = Math.min(Math.max(this.view.spherical.value.theta, this.view.spherical.limits.theta.min), this.view.spherical.limits.theta.max)
            this.view.spherical.value.phi = Math.min(Math.max(this.view.spherical.value.phi, this.view.spherical.limits.phi.min), this.view.spherical.limits.phi.max)
        }

        this.view.drag.delta.x = 0
        this.view.drag.delta.y = 0
        this.view.zoom.delta = 0

        // Smoothing
        this.view.spherical.smoothed.radius += (this.view.spherical.value.radius - this.view.spherical.smoothed.radius) * this.view.spherical.smoothing * this.time.delta
        this.view.spherical.smoothed.phi += (this.view.spherical.value.phi - this.view.spherical.smoothed.phi) * this.view.spherical.smoothing * this.time.delta
        this.view.spherical.smoothed.theta += (this.view.spherical.value.theta - this.view.spherical.smoothed.theta) * this.view.spherical.smoothing * this.time.delta

        this.view.target.smoothed.x += (this.view.target.value.x - this.view.target.smoothed.x) * this.view.target.smoothing * this.time.delta
        this.view.target.smoothed.y += (this.view.target.value.y - this.view.target.smoothed.y) * this.view.target.smoothing * this.time.delta
        this.view.target.smoothed.z += (this.view.target.value.z - this.view.target.smoothed.z) * this.view.target.smoothing * this.time.delta

        const viewPosition = new THREE.Vector3()
        viewPosition.setFromSpherical(this.view.spherical.smoothed)
        viewPosition.add(this.view.target.smoothed)

        this.camera.modes.default.instance.position.copy(viewPosition)
        this.camera.modes.default.instance.lookAt(this.view.target.smoothed)
    }
}
