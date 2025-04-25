import * as THREE from 'three'
import { Pane } from 'tweakpane'

import Time from './Utils/Time.js'
import Sizes from './Utils/Sizes.js'
import Stats from './Utils/Stats.js'

import Resources from './Resources.js'
import Renderer from './Renderer.js'
import Camera from './Camera.js'
import World from './World.js'
import Navigation from './Navigation.js'

import assets from './assets.js'

export default class Experience
{
    static instance

    constructor(_options = {})
    {
        if(Experience.instance)
        {
            return Experience.instance
        }
        Experience.instance = this

        // Options
        this.targetElement = _options.targetElement

        if(!this.targetElement)
        {
            console.warn('Missing \'targetElement\' property')
            return
        }

        this.time = new Time()
        this.sizes = new Sizes()
        this.setConfig()
        this.setStats()
        this.setDebug()
        this.setScene()
        this.setCamera()
        this.setRenderer()
        this.setResources()
        this.setWorld()
        this.setNavigation()
        
        this.sizes.on('resize', () =>
        {
            this.resize()
        })

        this.update()
    }

    // static getInstance(_options = {})
    // {
    //     console.log(Experience.instance)
    //     if(Experience.instance)
    //     {
    //         return Experience.instance
    //     }
        
    //     console.log('create')
    //     Experience.instance = new Experience(_options)
        
    //     return Experience.instance
    // }

    setConfig()
    {
        this.config = {}
    
        // Pixel ratio
        this.config.pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), 2)

        // Width and height
        const boundings = this.targetElement.getBoundingClientRect()
        this.config.width = boundings.width
        this.config.height = boundings.height || window.innerHeight
        this.config.smallestSide = Math.min(this.config.width, this.config.height)
        this.config.largestSide = Math.max(this.config.width, this.config.height)
        
        // Debug
        // this.config.debug = window.location.hash === '#debug'
        this.config.debug = this.config.width > 420
    }

    setStats()
    {
        if(this.config.debug)
        {
            this.stats = new Stats(true)
        }
    }

    setDebug()
    {
        if(this.config.debug)
        {
            this.debug = new Pane()
            this.debug.containerElem_.style.width = '320px'
        }
    }
    
    setScene()
    {
        this.scene = new THREE.Scene()
    }

    setCamera()
    {
        this.camera = new Camera()
    }

    setRenderer()
    {
        this.renderer = new Renderer({ rendererInstance: this.rendererInstance })

        this.targetElement.appendChild(this.renderer.instance.domElement)
    }

    setResources()
    {
        this.resources = new Resources(assets)
        this.resources.on('ready', () => {
            // Hide loading screen when all resources are loaded
            document.querySelector('.loading-screen').classList.add('hidden');
        })
    }

    setWorld()
    {
        this.world = new World()
    }

    setNavigation()
    {
        this.navigation = new Navigation()
    }

    update()
    {
        if(this.stats)
            this.stats.update()
        
        this.camera.update()

        // Updated camera distance calculation
        if(this.camera && this.camera.instance) {
            const cameraPosition = this.camera.instance.position;
            const distance = Math.sqrt(
                cameraPosition.x * cameraPosition.x +
                cameraPosition.y * cameraPosition.y +
                cameraPosition.z * cameraPosition.z
            );
            this.handleUIVisibility(distance);
        }
        
        if(this.renderer)
            this.renderer.update()

        if(this.world)
            this.world.update()

        if(this.navigation)
            this.navigation.update()

        window.requestAnimationFrame(() => {
            this.update()
        })
    }

    handleUIVisibility(distance) {
        const uiElements = [
            document.querySelector('.projects-section'),
            document.querySelector('.contact-info'),
            document.querySelector('.control-buttons'),
            document.querySelector('.screen-instructions')
        ];
        
        const threshold = 25; // Increased threshold value
        
        uiElements.forEach(element => {
            if (element) {
                element.style.opacity = distance <= threshold ? '0' : '1';
                element.style.pointerEvents = distance <= threshold ? 'none' : 'auto';
                element.style.transition = 'opacity 0.3s ease-in-out'; // Added smooth transition
            }
        });
    }

    resize()
    {
        // Config
        const boundings = this.targetElement.getBoundingClientRect()
        this.config.width = boundings.width
        this.config.height = boundings.height
        this.config.smallestSide = Math.min(this.config.width, this.config.height)
        this.config.largestSide = Math.max(this.config.width, this.config.height)

        this.config.pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), 2)

        if(this.camera)
            this.camera.resize()

        if(this.renderer)
            this.renderer.resize()

        if(this.world)
            this.world.resize()
    }

    destroy()
    {
        
    }
}
