import BaseNode from "$lib/BaseNode"
import { create_fx, create_graphics, create_point, create_sprite, create_text, create_vector } from "$lib/create_things"
import make_draggable from "$lib/make_draggable"
import { random_choice, random_int } from "$lib/random"
import { isPointInCircle, rad2sector } from "$lib/utility"
import { IPoint } from "$lib/Vector"
import { Easing } from "@tweenjs/tween.js"
import { Container, DestroyOptions, FederatedEvent, FederatedPointerEvent, Graphics, Sprite, Text, Ticker } from "pixi.js"
import Pole from "../components/battle/Pole"
import registerKeypress from "$lib/dev/registerKeypress"
import microManage from "$lib/dev/microManage"
import { Spine } from "@esotericsoftware/spine-pixi-v8"
import colors from "../colors"
import ButtonSettings from "../components/ButtonSettings"

const char_z = [30, 10, 20]

class PlacementsFriends extends Container<Graphics> {
    p1: Graphics
    p2: Graphics
    p3: Graphics

    constructor() {
        super()

        this.p1 = create_graphics()
            .circle(0, 0, 10)
            .fill('red')
        this.p2 = create_graphics()
            .circle(0, 0, 10)
            .fill('blue')
        this.p3 = create_graphics()
            .circle(0, 0, 10)
            .fill('green')

        this.addChild(this.p1)
        this.addChild(this.p2)
        this.addChild(this.p3)

        this.p1.position.set(80, 548)
        this.p2.position.set(179, 518)
        this.p3.position.set(260, 548)

    }
}


class PlacementsEnemies extends Container<Graphics> {
    p1: Graphics
    p2: Graphics
    p3: Graphics

    constructor() {
        super()

        this.p1 = create_graphics()
            .circle(0, 0, 10)
            .fill('red')
        this.p2 = create_graphics()
            .circle(0, 0, 10)
            .fill('blue')
        this.p3 = create_graphics()
            .circle(0, 0, 10)
            .fill('green')

        this.addChild(this.p1)
        this.addChild(this.p2)
        this.addChild(this.p3)
    }

    resize() {
        const { width } = window.screen_size

        this.p1.position.set(width / this.parent.scale.x - 80, 548)
        this.p2.position.set(width / this.parent.scale.x - 179, 518)
        this.p3.position.set(width / this.parent.scale.x - 260, 548)
    }
}

class ScrollHeader extends BaseNode {
    bg: Sprite
    lbl: Text
    constructor() {
        super()
        this.bg = create_sprite('battle/header')
        this.lbl = create_text({text: 'Wave 0/2', style: {fill:colors.dark, fontSize: 48}})
        this.addChild(this.bg)
        this.addChild(this.lbl)
    }
}

class HpProgressBar extends BaseNode {
    bg: Sprite
    top: Sprite
    msk: Graphics
    constructor() {
        super()
        this.bg = create_sprite('battle/hp_pb')
        this.top = create_sprite('battle/hp_pb_top')
        this.msk = create_graphics()
            .rect(0, 0, this.bg.width, this.bg.height)
            .fill('white')

        this.msk.position.x = -this.bg.width / 2
        this.msk.position.y = -this.bg.height / 2

        this.addChild(this.bg)
        this.addChild(this.top)
        this.addChild(this.msk)
        this.top.mask = this.msk

        this.setValue(0.6)
    }

    setValue(n: number) {
        if (n < 0 || n > 1) throw new Error('incorrect value for progressbar')
        const start_x = -this.width / 2
        const start_y = -this.height / 2
        const height = this.height

        const width = this.width * n

        this.msk
            .clear()
            .rect(0, 0, width, height)
            .fill('white')

    }
}

class Character extends BaseNode {
    spine: Spine
    hp_pb: HpProgressBar
    spine_name: string

    constructor(spine_name: string) {
        super()

        this.spine_name = spine_name
        this.hp_pb = new HpProgressBar()

        let scale = 1
        if (spine_name === 'leonard') scale = 0.6
        this.spine = Spine.from({ skeleton: `spine/${spine_name}-data`, atlas: `spine/${spine_name}-atlas`, scale })

        this.addChild(this.spine)
        this.addChild(this.hp_pb)

        this.hp_pb.position.y = -this.spine.height 
    }

    setAnimation(name:string, loop=false) {
        if (this.spine_name === 'leonard') {
            if (name === 'idle') this.spine.state.timeScale = 0.6
            if (name === 'run') this.spine.state.timeScale = 3
            if (name === 'attack') this.spine.state.timeScale = 1.7
        }
        this.spine.state.setAnimation(0, name, loop)
    }
    
    addAnimation(name:string, loop=false) {
        this.spine.state.addAnimation(0, name, loop)
    }
}

class Battlefield extends BaseNode {
    bg: Sprite
    place_friends = new PlacementsFriends()
    place_enemies = new PlacementsEnemies()

    spines: Container<Character> = new Container()
    friends: Character[] = []
    enemies: Character[] = []
    // enemies: Container<Spine> = new Container()

    constructor() {
        super()

        this.bg = create_sprite('battle/bgs/hills')
        this.bg.anchor.set(0, 0)
        this.addChild(this.bg)
        this.addChild(this.place_friends)
        this.addChild(this.place_enemies)
        this.addChild(this.spines)

        for (let i = 0; i < 3; i++) {
            const character = new Character('leonard')
            this.friends.push(character)
            this.spines.addChild(character)

            character.setAnimation('idle', true)
        }


        for (let i = 0; i < 3; i++) {
            const enemy = new Character('skeleton')
            this.enemies.push(enemy)
            this.spines.addChild(enemy)

            enemy.setAnimation('idle', true)
            enemy.spine.scale.x = -1
        }

        registerKeypress('r', () => this.anim_character_hit())
        registerKeypress('t', () => this.anim_walk_in())
    }

    anim_walk_in() {
        for (let i = 0; i < 3; i++) {
            const character = this.friends[i]
            character.position.copyFrom(this.place_friends.getChildAt(i)! as any)
            character.position.x -= 500
            character.zIndex = char_z[i]

            const point_to = create_point().copyFrom(this.place_friends.getChildAt(i)! as any)

            character.setAnimation('run', true)

            this.tween(character)
                .to(point_to, 2000)
                .easing(Easing.Sinusoidal.Out)
                .start()

            this.set_timeout(1900, () => {
                character.setAnimation('idle', true)
            })
        }
    }

    anim_character_hit() {
        // this.characters.zIndex = 100

        for (let i = 0; i < 3; i++) {
            const delay = random_int(0, 300)

            this.set_timeout(delay, () => {

                const point_a = create_point().copyFrom(this.place_enemies.getChildAt(i)! as any)
                point_a.x -= 60
                const point_b = create_point().copyFrom(this.place_friends.getChildAt(i)! as any)

                const character: Character = this.friends[i]
                character.setAnimation('attack', false)
                character.addAnimation('idle', true)



                this.tween(character.position)
                    .to(point_a, 600)
                    .easing(Easing.Quadratic.In)
                    .onStart(() => {
                        character.zIndex = char_z[i] + 2
                    })
                    .start()

                this.set_timeout(700, () => {
                    const fx = create_fx('splash', this.spines, character)
                    fx.scale.set(6)
                    fx.zIndex = char_z[i] + 2
                    fx.position.copyFrom(point_a)
                    fx.position.x + 60
                })

                this.set_timeout(810, () => {
                    character.spine.state.timeScale = 3
                    this.tween(character.position)
                        .to(point_b, 200)
                        .easing(Easing.Quadratic.Out)
                        .start()
                        .onComplete(() => {
                            character.spine.state.timeScale = 0.6
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
            const character = this.friends[i]
            character.position.copyFrom(this.place_friends.getChildAt(i)! as any)
            character.zIndex = char_z[i]
        }

        for (let i = 0; i < 3; i++) {
            const enemy = this.enemies[i]
            enemy.position.copyFrom(this.place_enemies.getChildAt(i)! as any)
            enemy.zIndex = char_z[i]
        }
    }
}




export default class S_Battle extends BaseNode {
    button_settings = new ButtonSettings()
    rune_helper = create_sprite('battle/runehelp')
    header = new ScrollHeader()
    pole: Pole
    battlefield: Battlefield

    update_hook!: OmitThisParameter<any>

    constructor() {
        super()

        this.pole = new Pole()
        this.battlefield = new Battlefield()

        this.addChild(this.pole)
        this.addChild(this.battlefield)
        this.addChild(this.header)
        this.addChild(this.rune_helper)
        this.addChild(this.button_settings)

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

        // header
        this.header.scale.set(
            (this.bw / 4) / (this.header.width / this.header.scale.x)
        )
        this.header.position.y = -this.bh/2  + this.header.height/2 + 5

        // rune_helper
        this.rune_helper.scale.set(
            (this.header.height) / (this.rune_helper.height / this.rune_helper.scale.y)
        )
        this.rune_helper.position.y = -this.bh/2  + this.rune_helper.height/2 + 5
        this.rune_helper.position.x = -this.bw/2  + this.rune_helper.width/2 + 5

        // button_settings
        this.button_settings.scale.set(
            (this.header.height) / (this.button_settings.height / this.button_settings.scale.y)
        )
        this.button_settings.position.y = -this.bh/2  + this.button_settings.height/2 + 5
        this.button_settings.position.x = this.bw/2  - this.button_settings.width/2 - 5
    }
}
