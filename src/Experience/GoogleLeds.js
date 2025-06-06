import Experience from './Experience.js'
import * as THREE from 'three'

export default class GoogleLeds
{
    constructor()
    {
        this.experience = new Experience()
        this.resources = this.experience.resources
        this.scene = this.experience.scene
        this.time = this.experience.time

        this.setModel()
    }

    setModel()
    {
        this.model = {}
        this.model.items = []

        // Fixed colors - no longer configurable
        const colors = ['#196aff', '#ff0000', '#ff5d00', '#7db81b']

        this.model.texture = this.resources.items.googleHomeLedMaskTexture

        const children = [...this.resources.items.googleHomeLedsModel.scene.children]
        children.sort((_a, _b) =>
        {
            if(_a.name < _b.name)
                return -1
            if(_a.name > _b.name)
                return 1
            return 0
        })
        
        let i = 0
        for(const _child of children)
        {
            const item = {}
            item.index = i
            item.color = colors[item.index]

            item.material = new THREE.MeshBasicMaterial({
                color: item.color,
                transparent: true,
                alphaMap: this.model.texture
            })

            item.mesh = _child
            item.mesh.material = item.material
            this.scene.add(item.mesh)
            this.model.items.push(item)
            i++
        }
    }

    update()
    {
        for(const _item of this.model.items)
        {
            _item.material.opacity = Math.sin(this.time.elapsed * 0.002 - _item.index * 0.5) * 0.5 + 0.5
        }
    }
}