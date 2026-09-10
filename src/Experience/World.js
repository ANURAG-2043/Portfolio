import * as THREE from 'three'
import Experience from './Experience.js'
import Baked from './Baked.js'
import GoogleLeds from './GoogleLeds.js'
import LoupedeckButtons from './LoupedeckButtons.js'
import CoffeeSteam from './CoffeeSteam.js'
import TopChair from './TopChair.js'
import ElgatoLight from './ElgatoLight.js'
import Screen from './Screen.js'
import Starfield from './Starfield.js'
import MonitorCallout from './MonitorCallout.js'

export default class World
{
    constructor(_options)
    {
        this.experience = new Experience()
        this.config = this.experience.config
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.setStarfield()
        
        this.resources.on('groupEnd', (_group) =>
        {
            if(_group.name === 'base')
            {
                this.setBaked()
                this.setGoogleLeds()
                this.setLoupedeckButtons()
                this.setCoffeeSteam()
                this.setTopChair()
                this.setElgatoLight()
                this.setBouncingLogo()
                this.setScreens()
            }
        })
    }

    setBaked()
    {
        this.baked = new Baked()
    }

    setGoogleLeds()
    {
        this.googleLeds = new GoogleLeds()
    }

    setLoupedeckButtons()
    {
        this.loupedeckButtons = new LoupedeckButtons()
    }

    setCoffeeSteam()
    {
        this.coffeeSteam = new CoffeeSteam()
    }

    setTopChair()
    {
        this.topChair = new TopChair()
    }

    setElgatoLight()
    {
        this.elgatoLight = new ElgatoLight()
    }

    setStarfield()
    {
        this.starfield = new Starfield()
    }

    setBouncingLogo()
    {
        // Large TV: static development artwork with no click-through page.
        const tvPlane = new THREE.PlaneGeometry(4.2, 2.37, 2, 2)
        tvPlane.rotateY(-Math.PI * 0.5)
        const tvMesh = new THREE.Mesh(tvPlane)
        tvMesh.position.set(4.188, 2.667, 1.830)
        
        this.streamScreen = new Screen(
            tvMesh,
            './assets/developer-cloud-architecture.png',
            'image'
        )
    }

    setScreens()
    {
        // Monitor: restore the portfolio video and its dedicated portfolio-page link.
        this.pcScreen = new Screen(
            this.resources.items.pcScreenModel.scene.children[0],
            './assets/videoPortfolio.mp4',
            'video',
            '/portfolio.html'
        )
        this.monitorCallout = new MonitorCallout(this.pcScreen.mesh)

        // Laptop screen: dedicated ANURAG WORKSPACE artwork.
        const macScreenMesh = this.resources.items.macScreenModel.scene.children[0]
        this.macScreen = new Screen(
            macScreenMesh,
            './assets/anurag-workspace.png',
            'image'
        )
    }

    update()
    {
        if(this.googleLeds)
            this.googleLeds.update()

        if(this.loupedeckButtons)
            this.loupedeckButtons.update()

        if(this.coffeeSteam)
            this.coffeeSteam.update()

        if(this.topChair)
            this.topChair.update()

        if(this.bouncingLogo)
            this.bouncingLogo.update()

        if(this.macScreen)
            this.macScreen.update()

        if(this.streamScreen)
            this.streamScreen.update()

        if(this.starfield)
            this.starfield.update()

        if(this.monitorCallout)
            this.monitorCallout.update()
    }

    resize()
    {
    }

    destroy()
    {
    }
}
