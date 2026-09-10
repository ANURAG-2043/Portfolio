import * as THREE from 'three'
import Experience from './Experience.js'

export default class MonitorCallout {
    constructor(mesh) {
        this.experience = new Experience()
        this.camera = this.experience.camera
        this.mesh = mesh
        this.element = document.querySelector('.monitor-callout')
        this.copy = this.element?.querySelector('.monitor-callout-copy')
        this.path = this.element?.querySelector('path')
        this.dot = this.element?.querySelector('circle')
        this.position = new THREE.Vector3()

        if (this.element) {
            this.element.hidden = false
        }
    }

    update() {
        if (!this.element || !this.copy || !this.path || !this.dot) {
            return
        }

        this.mesh.getWorldPosition(this.position)
        this.position.project(this.camera.instance)

        const targetX = (this.position.x * 0.5 + 0.5) * window.innerWidth
        const targetY = (-this.position.y * 0.5 + 0.5) * window.innerHeight
        const visible = this.position.z < 1 && targetX > 0 && targetX < window.innerWidth && targetY > 0 && targetY < window.innerHeight
        this.element.style.display = visible ? 'block' : 'none'

        if (!visible) {
            return
        }

        const copyWidth = 228
        const copyHeight = 68
        const copyX = Math.min(Math.max(targetX - 250, 28), window.innerWidth - copyWidth - 28)
        const copyY = Math.max(76, targetY - 185)
        const startX = copyX + copyWidth * 0.72
        const startY = copyY + copyHeight
        const controlX = startX + (targetX - startX) * 0.1
        const controlY = startY + 105

        this.copy.style.left = `${copyX}px`
        this.copy.style.top = `${copyY}px`
        this.path.setAttribute('d', `M ${startX} ${startY} Q ${controlX} ${controlY} ${targetX} ${targetY}`)
        this.dot.setAttribute('cx', targetX)
        this.dot.setAttribute('cy', targetY)
    }
}
