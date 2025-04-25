import * as THREE from 'three'
import Experience from './Experience.js'
import Baked from './Baked.js'
import GoogleLeds from './GoogleLeds.js'
import LoupedeckButtons from './LoupedeckButtons.js'
import CoffeeSteam from './CoffeeSteam.js'
import TopChair from './TopChair.js'
import ElgatoLight from './ElgatoLight.js'
import Screen from './Screen.js'

export default class World
{
    constructor(_options)
    {
        this.experience = new Experience()
        this.config = this.experience.config
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        
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

    setBouncingLogo()
    {
        // Create video screen at the bouncing logo position
        const videoPlane = new THREE.PlaneGeometry(4.2, 2.37, 2, 2)
        videoPlane.rotateY(-Math.PI * 0.5)
        const videoMesh = new THREE.Mesh(videoPlane)
        videoMesh.position.set(4.188, 2.667, 1.830)
        
        this.streamScreen = new Screen(
            videoMesh,
            './assets/videoStream.mp4'  // Updated path
        )
    }

    setScreens()
    {
        // TV Screen
        this.pcScreen = new Screen(
            this.resources.items.pcScreenModel.scene.children[0],
            './assets/videoPortfolio.mp4'  // Updated path
        )

        // Mac Screen
        const macScreenMesh = this.resources.items.macScreenModel.scene.children[0]
        this.macScreen = new Screen(
            macScreenMesh,
            './assets/videoMACscreen.mp4'  // Updated path
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
    }

    resize()
    {
    }

    destroy()
    {
    }
}