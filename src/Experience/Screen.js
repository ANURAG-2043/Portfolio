import * as THREE from 'three'

import Experience from './Experience.js'

export default class Screen {
    constructor(mesh, videoPath) {
        this.experience = new Experience()
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.camera = this.experience.camera
        
        // Store mesh and video path
        this.mesh = mesh
        this.sourcePath = videoPath

        // Add click event listener for portfolio screen
        if (videoPath === './assets/videoPortfolio.mp4') {
            this.mesh.userData.isPortfolioScreen = true
            window.addEventListener('click', (event) => this.onClick(event))
        }

        // Add click event listener for TV screen
        if (videoPath === './assets/videoStream.mp4') {
            this.mesh.userData.isTVScreen = true
            window.addEventListener('click', (event) => this.onClick(event))
        }

        this.setModel()
    }

    setModel() {
        this.model = {}

        // Element
        this.model.element = document.createElement('video')
        this.model.element.muted = true
        this.model.element.loop = true
        this.model.element.controls = true
        this.model.element.playsInline = true
        this.model.element.autoplay = true
        this.model.element.src = this.sourcePath
        this.model.element.play()

        // Add cursor style
        if (this.mesh.userData.isPortfolioScreen) {
            document.body.style.cursor = 'pointer'
        }

        // Texture
        this.model.texture = new THREE.VideoTexture(this.model.element)
        this.model.texture.encoding = THREE.sRGBEncoding

        // Material
        this.model.material = new THREE.MeshBasicMaterial({
            map: this.model.texture
        })

        // Make mesh interactive
        this.mesh.userData.clickable = true

        // Mesh
        this.model.mesh = this.mesh
        this.model.mesh.material = this.model.material
        this.scene.add(this.model.mesh)
    }

    update()
    {
        // this.model.group.rotation.y = Math.sin(this.time.elapsed * 0.0005) * 0.5
    }

    onClick(event) {
        // Get mouse position and check if clicked on PC screen
        const mouse = new THREE.Vector2()
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(mouse, this.camera.instance)

        const intersects = raycaster.intersectObject(this.mesh)

        if (intersects.length > 0) {
            if (this.mesh.userData.isPortfolioScreen) {
                window.open('/portfolio.html', '_blank')
            } else if (this.mesh.userData.isTVScreen) {
                window.open('/TVscreen.html', '_blank')
            }
        }
    }
}