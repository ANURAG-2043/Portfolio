import * as THREE from 'three'

import Experience from './Experience.js'

export default class Screen {
    constructor(mesh, sourcePath, mediaType = 'video', linkUrl = null) {
        this.experience = new Experience()
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.camera = this.experience.camera
        
        // Store mesh and media source
        this.mesh = mesh
        this.sourcePath = sourcePath
        this.mediaType = mediaType
        this.linkUrl = linkUrl

        this.setModel()
        this.setInteraction()
    }

    setModel() {
        this.model = {}

        if (this.mediaType === 'image') {
            this.model.texture = new THREE.TextureLoader().load(this.sourcePath)
        } else {
            this.model.element = document.createElement('video')
            this.model.element.muted = true
            this.model.element.loop = true
            this.model.element.playsInline = true
            this.model.element.autoplay = true
            this.model.element.src = this.sourcePath
            this.model.element.play()
            this.model.texture = new THREE.VideoTexture(this.model.element)
        }

        this.model.texture.encoding = THREE.sRGBEncoding

        // Material
        this.model.material = new THREE.MeshBasicMaterial({
            map: this.model.texture
        })

        // Mesh
        this.model.mesh = this.mesh
        this.model.mesh.material = this.model.material
        this.scene.add(this.model.mesh)
    }

    update()
    {
        // this.model.group.rotation.y = Math.sin(this.time.elapsed * 0.0005) * 0.5
    }

    setInteraction() {
        if (!this.linkUrl) {
            return
        }

        this.mesh.userData.clickable = true
        window.addEventListener('click', (event) => this.onClick(event))
    }

    onClick(event) {
        const mouse = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        )
        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(mouse, this.camera.instance)

        if (raycaster.intersectObject(this.mesh).length > 0) {
            window.open(this.linkUrl, '_blank')
        }
    }

}
