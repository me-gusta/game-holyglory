import BaseNode from "$lib/BaseNode"
import { create_fx, create_graphics, create_point, create_sprite, create_vector } from "$lib/create_things"
import make_draggable from "$lib/make_draggable"
import { random_choice, random_int } from "$lib/random"
import { isPointInCircle, rad2sector } from "$lib/utility"
import { IPoint } from "$lib/Vector"
import { Easing } from "@tweenjs/tween.js"
import { Container, DestroyOptions, FederatedEvent, FederatedPointerEvent, Graphics, Sprite, Ticker } from "pixi.js"
import Pole from "../components/battle/Pole"
import registerKeypress from "$lib/dev/registerKeypress"
import microManage from "$lib/dev/microManage"
import { Spine } from "@esotericsoftware/spine-pixi-v8"

class PlacementsCharacter extends Container<Graphics> {
    p1: Graphics
    p2: Graphics
    p3: Graphics

    constructor() {
        super()

        this.p1 = create_graphics()
            .circle(0, 0, 5)
            .fill('red')
        this.p2 = create_graphics()
            .circle(0, 0, 5)
            .fill('blue')
        this.p3 = create_graphics()
            .circle(0, 0, 5)
            .fill('green')

        this.addChild(this.p1)
        this.addChild(this.p2)
        this.addChild(this.p3)

        this.p1.position.set(80, 448)
        this.p2.position.set(179, 418)
        this.p3.position.set(260, 448)

    }
}


class PlacementsEnemies extends Container<Graphics> {
    p1: Graphics
    p2: Graphics
    p3: Graphics

    constructor() {
        super()

        this.p1 = create_graphics()
            .circle(0, 0, 50)
            .fill('red')
        this.p2 = create_graphics()
            .circle(0, 0, 50)
            .fill('blue')
        this.p3 = create_graphics()
            .circle(0, 0, 50)
            .fill('green')

        this.addChild(this.p1)
        this.addChild(this.p2)
        this.addChild(this.p3)


    }

    resize() {
        const { width } = window.screen_size

        this.p1.position.set(width / this.parent.scale.x - 80, 448)
        this.p2.position.set(width / this.parent.scale.x - 179, 418)
        this.p3.position.set(width / this.parent.scale.x - 260, 448)
    }
}

class Battlefield extends BaseNode {
    bg: Sprite
    place_characters = new PlacementsCharacter()
    place_enemies = new PlacementsEnemies()

    characters: Container<Spine> = new Container()
    enemies: Container<Spine> = new Container()

    constructor() {
        super()

        this.bg = create_sprite('battle/bgs/hills')
        this.bg.anchor.set(0, 0)
        this.addChild(this.bg)
        this.addChild(this.place_characters)
        this.addChild(this.place_enemies)

        for (let i = 0; i < 3; i++) {
            const character = Spine.from({ skeleton: "spine/leonard-data", atlas: "spine/leonard-atlas", scale: 0.5 })
            this.characters.addChild(character)

            character.state.setAnimation(0, 'idle2', true)
            character.state.timeScale = 0.6
        }
        this.addChild(this.characters)


        for (let i = 0; i < 3; i++) {
            const enemy = Spine.from({ skeleton: "spine/skeleton-data", atlas: "spine/skeleton-atlas", scale: 0.5 })
            this.enemies.addChild(enemy)

            enemy.state.setAnimation(0, 'idle2', true)
            enemy.scale.x = -1
            enemy.state.timeScale = 0.6
        }
        this.addChild(this.enemies)

        registerKeypress('r', () => this.anim_character_hit())
    }

    anim_character_hit() {
        // this.characters.zIndex = 100

        for (let i = 0; i < 3; i++) {
            const delay = random_int(0, 500)

            this.set_timeout(delay, () => {
                
                const point_a = create_point().copyFrom(this.place_enemies.getChildAt(i)! as any)
                point_a.x -= 60
                const point_b = create_point().copyFrom(this.place_characters.getChildAt(i)! as any)

                const char: Spine = this.characters.getChildAt(i)!
                char.state.setAnimation(0, 'attack', false)
                char.state.timeScale = 1.7
                char.state.addAnimation(0, 'idle2', true)

                this.tween(char.position)
                    .to(point_a, 600)
                    .easing(Easing.Quadratic.In)
                    .start()

                this.set_timeout(810, () => {
                    char.state.timeScale = 3
                    this.tween(char.position)
                        .to(point_b, 200)
                        .easing(Easing.Quadratic.Out)
                        .start()
                        .onComplete(() => {
                            char.state.timeScale = 0.6
                        })
                })
            })
        }
    }

    resize() {
        const s = (this.bh) / (this.bg.height / this.bg.scale.y)
        this.scale.set(s)

        this.bw = this.bg.width * s

        this.place_enemies.resize()

        for (let i = 0; i < 3; i++) {
            const character = this.characters.getChildAt(i)! as Spine
            character.position.copyFrom(this.place_characters.getChildAt(i)! as any)
            if (i === 0) character.zIndex = 10
            if (i === 1) character.zIndex = 0
            if (i === 2) character.zIndex = 20
        }

        for (let i = 0; i < 3; i++) {
            const enemy = this.enemies.getChildAt(i)! as Spine
            enemy.position.copyFrom(this.place_enemies.getChildAt(i)! as any)
            if (i === 0) enemy.zIndex = 10
            if (i === 1) enemy.zIndex = 0
            if (i === 2) enemy.zIndex = 20
        }
    }
}



export default class S_Battle extends BaseNode {
    pole: Pole
    battlefield: Battlefield

    update_hook!: OmitThisParameter<any>

    constructor() {
        super()

        this.pole = new Pole()
        this.battlefield = new Battlefield()

        this.addChild(this.pole)
        this.addChild(this.battlefield)

        registerKeypress('e', () => {
            this.pole.match_all_manual()
        })

        // const leonard = Spine.from({ skeleton: "spine/leonard-data", atlas: "spine/leonard-atlas", scale: 0.525})
        // this.addChild(leonard)
        // leonard.state.setAnimation(0, 'attack', true)
    }

    start() {
        this.update_hook = this.update.bind(this)
        window.app.ticker.add(this.update_hook)

        this.pole.anim_intial_drop(true)

        this.set_timeout(1500, () => {
            // this.pole.match_all_manual()
        })
    }

    update(ticker: Ticker) {
    }

    destroy(options?: DestroyOptions) {
        window.app.ticker.remove(this.update_hook)
        super.destroy(options)
    }

    resize() {
        super.resize()
        this.bw = window.screen_size.width
        this.bh = window.screen_size.height

        this.pole.bw = this.bw
        this.pole.resize()

        this.pole.position.y = this.bh / 2 - (this.pole.bh * 0.5)

        this.battlefield.bh = this.bh - this.pole.bh
        this.battlefield.resize()

        this.battlefield.position.y = -this.bh / 2
        this.battlefield.position.x = -this.bw / 2


    }
}
