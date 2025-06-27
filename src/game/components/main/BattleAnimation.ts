import BaseNode from '$lib/BaseNode.ts'
import {create_fx, create_point, create_sprite} from '$lib/create_things.ts'
import {Container, FederatedPointerEvent, Texture, TilingSprite} from 'pixi.js'
import {Spine} from "@esotericsoftware/spine-pixi-v8";
import {Easing} from "@tweenjs/tween.js";
import registerKeypress from "$lib/dev/registerKeypress.ts";
import awe from '$src/game/data/awe.ts'
import {random_int} from '$lib/random.ts'
import store, {save} from '$src/game/data/store.ts'

export default class BattleAnimation extends BaseNode {
    bg: TilingSprite
    hero: Spine
    mob?: Spine
    count = 0

    constructor() {
        super()
        const bg_texture = Texture.from('battle/bgs/forest')
        this.bg = new TilingSprite({texture: bg_texture})

        const spine_name = store.hero_selected
        let scale = 1
        if (spine_name === 'leonard') scale = 0.6
        if (spine_name === 'wolf') scale = 0.8
        if (spine_name === 'maximus') scale = 1.1
        this.hero = Spine.from(
            {skeleton: `spine/${spine_name}-data`, atlas: `spine/${spine_name}-atlas`, scale}
        )

        this.addChild(this.bg)
        this.addChild(this.hero)

        this.hero.position.y = this.bg.height / 2 - 20
        this.hero.position.x = window.screen_size.width / 2
        this.hero.state.setAnimation(0, 'idle', true)
        this.hero.state.timeScale = 0.6

        this.on('pointerup', (e: FederatedPointerEvent) => {
            this.interactive = false
            this.kill()
            this.set_timeout(400, () => {
                if (!this.mob) return

                const pos = this.toGlobal(create_point().copyFrom(this.mob))
                pos.y += 50

                const amount = random_int(2, 5)
                this.trigger('drop_items', {
                    label: 'coins',
                    global: pos,
                    amount: [amount],
                    radius: 60
                })

                this.set_timeout(500, () => {
                    awe.add('stats.coins', amount)
                    save()
                })
            })

            this.set_timeout(900, () => {
                this.next()
                this.set_timeout(1500, () => {
                    this.interactive = true
                })
            })
        })

        this.interactive = true
    }

    next(instant = false) {
        this.count++

        const spine_name = 'wolf'
        this.mob = this.mob || Spine.from(
            {skeleton: `spine/${spine_name}-data`, atlas: `spine/${spine_name}-atlas`, scale: 0.8}
        )

        this.addChild(this.mob)
        this.mob.scale.x = -1
        this.mob.state.setAnimation(0, 'idle', true)

        this.hero.state.setAnimation(0, 'run', true)
        this.hero.state.timeScale = 3


        this.mob.y = this.hero.y - this.mob.height + 35
        this.mob.x = window.screen_size.width * 2 + this.mob.width

        this.bg.width = this.bg.texture.width + 700 * this.count

        if (instant) {
            this.hero.state.setAnimation(0, 'idle', true)
            this.hero.state.timeScale = 0.6
            this.mob.position.x = this.hero.x + this.mob.width
            this.bg.position.x = window.screen_size.width / 2 - 700 * this.count
        } else {
            this.tween(this.bg.position)
                .to({x: window.screen_size.width / 2 - 700 * this.count, y: this.bg.position.y}, 1200)
                .easing(Easing.Quadratic.InOut)
                .start()

            this.set_timeout(1300, () => {
                this.hero.state.setAnimation(0, 'idle', true)
                this.hero.state.timeScale = 0.6
            })
            this.tween(this.mob.position)
                .to({x: this.hero.x + this.mob.width, y: this.mob.position.y}, 1200)
                .easing(Easing.Quadratic.InOut)
                .start()
        }


    }

    kill() {
        if (!this.mob) return

        this.hero.state.setAnimation(0, 'attack', false)
        this.hero.state.timeScale = 3
        this.set_timeout(480, () => {
            this.hero.state.setAnimation(0, 'idle', true)
            this.hero.state.timeScale = 0.6
        })
        this.set_timeout(380, () => {
            if (!this.mob) return

            const pos = this.toGlobal(create_point().copyFrom(this.mob))
            pos.y += 50
            const fx = create_fx('splash', this, pos)
            fx.scale.set(8)
        })

        this.set_timeout(390, () => {
            if (!this.mob) return

            this.tween(this.mob)
                .to({rotation: Math.PI / 6}, 200)
                .easing(Easing.Linear.None)
                .start()


            this.tween(this.mob.scale)
                .to({x: -0.4, y: 0.4}, 200)
                .easing(Easing.Quadratic.In)
                .start()

            this.set_timeout(201, () => {
                if (!this.mob) return

                this.mob.destroy()
                this.mob = undefined
            })
        })


    }

    resize() {
        this.hero.position.y = this.bg.height / 2 + 280
        this.hero.position.x = window.screen_size.width / 2
        this.next(true)

    }
}
