import BaseNode from '$lib/BaseNode.ts'
import {create_graphics} from '$lib/create_things.ts'
import WoodenHeader from '$src/game/components/WoodenHeader.ts'
import {Reward} from '$src/game/data/store.ts'
import {Particle, ParticleContainer, Texture, Ticker} from 'pixi.js'
import {random_choice} from '$lib/random.ts'

export default class ModalSalute extends BaseNode {
    pcontainer = new ParticleContainer()

    constructor() {
        super()
        this.addChild(this.pcontainer)
    }

    salute() {
        const texture = Texture.from('particle')
        const particlesData: any[] = []
        const totalParticles = 1000

        // const startX = -this.bw / 2
        // const startY = this.bh / 1.2
        const startPoints = [
            {x: -this.bw / 2, y:this.bh / 1.2},
            {x: this.bw/ 2, y: this.bh / 1.2}
        ]

        for (let i = 0; i < totalParticles; ++i) {
            const start = random_choice(startPoints)
            const particle = new Particle({
                texture,
                x: start.x,
                y: start.y,
                tint: random_choice([
                    0xed5845, 0x74ed45,0x45cfed,0x6545ed,0xed45e3,0xed4584,0xedd345,0xed8845
                ])
            })

            particle.anchorX = 0.5
            particle.anchorY = 0.5
            const scale = 0.3 + Math.random() * 0.4
            particle.scaleX = scale / 2
            particle.scaleY = scale / 2
            particle.alpha = 1

            this.pcontainer.addParticle(particle)

            const angleSpread = Math.PI / 1.5
            particlesData.push({
                particle,
                direction: -Math.PI / 2 + (Math.random() - 0.5) * angleSpread,
                speed: 12 + Math.random() * 20,
                turningSpeed: Math.random() - 0.55,
                gravity: 0.1 + Math.random() * 0.1,
                life: 1,
                offset: Math.random() * 100,
            })
        }

        let tick = 0

        const animationLoop = (ticker: Ticker) => {
            const delta = ticker.deltaTime

            console.log(particlesData.length, tick)

            for (let i = particlesData.length - 1; i >= 0; i--) {
                const data = particlesData[i]
                const p = data.particle

                data.direction += data.turningSpeed * 0.01 * delta

                let vx = Math.cos(data.direction) * data.speed
                let vy = Math.sin(data.direction) * data.speed

                vy += data.gravity

                data.speed = Math.sqrt(vx * vx + vy * vy) * 0.985
                data.direction = Math.atan2(vy, vx)

                p.x += vx * delta
                p.y += vy * delta
                p.rotation = -data.direction - Math.PI / 2

                if (tick > 40) {
                    this.pcontainer.removeParticle(p)
                    particlesData.splice(i, 1)
                }
            }

            tick += 0.1 * delta

            if (particlesData.length === 0) {
                window.app.ticker.remove(animationLoop)
            }
        }

        window.app.ticker.add(animationLoop)
    }


    resize() {
        super.resize()
        this.bw = window.screen_size.width
        this.bh = window.screen_size.height
    }

}
