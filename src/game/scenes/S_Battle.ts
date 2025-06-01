import BaseNode from "$lib/BaseNode"
import { create_fx, create_graphics, create_point, create_sprite, create_text, create_vector } from "$lib/create_things"
import make_draggable from "$lib/make_draggable"
import { random_choice, random_int } from "$lib/random"
import { isPointInCircle, rad2sector, sum } from "$lib/utility"
import { IPoint } from "$lib/Vector"
import { Easing } from "@tweenjs/tween.js"
import { Container, DestroyOptions, FederatedEvent, FederatedPointerEvent, Graphics, Sprite, Text, Ticker } from "pixi.js"
import Pole from "../components/battle/Pole"
import registerKeypress from "$lib/dev/registerKeypress"
import microManage from "$lib/dev/microManage"
import { Spine } from "@esotericsoftware/spine-pixi-v8"
import colors from "../colors"
import ButtonSettings from "../components/ButtonSettings"
import store from "$lib/store"
import Battlefield from "../components/battle/Battlefield"


class ScrollHeader extends BaseNode {
    bg: Sprite
    lbl: Text
    constructor() {
        super()
        this.bg = create_sprite('battle/header')
        this.lbl = create_text({ text: 'Wave 0/2', style: { fill: colors.dark, fontSize: 48 } })
        this.addChild(this.bg)
        this.addChild(this.lbl)
    }
}


type E_Battle = {
    eid: string
    location: string
    number: string
}

type E_Wave = {
    eid: string
    location: string
    number: string
}

type E_Mob = {
    eid: string
    wave: string,
    label: string,
    max_hp: number,
    damage_scale: [number, number]
}

export default class S_Battle extends BaseNode {
    button_settings = new ButtonSettings()
    rune_helper = create_sprite('battle/runehelp')
    header = new ScrollHeader()
    pole: Pole
    battlefield: Battlefield

    update_hook!: OmitThisParameter<any>

    store = {
        "friends": [
            null,
            {
                "label": "leonard",
                "level": 3,
            }
        ],
        "skills": [
            {
                "label": "sun_sneeze",
                "level": 4
            }
        ],
        "waves": [
            [
                null,
                {
                    "label": "skeleton",
                    "level": 1
                },
                {
                    "label": "wolf",
                    "level": 2
                }
            ]
        ],
        "rng_key": "683caf997a03d422bf4205b8",
        "grid": null
    }

    // e_battle: E_Battle
    // es_wave: E_Wave[]

    constructor() {
        super()


        store.current_wave_number = 1

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

        registerKeypress('z', () => this.battlefield.anim_friends_hit(1))
        registerKeypress('x', () => this.battlefield.anim_enemies_hit())
        registerKeypress('b', () => this.battlefield.anim_walk_in())
        registerKeypress('n', () => {
            this.battlefield.next_wave()
            this.battlefield.anim_next_wave()
        })

        this.pole.on('match_completed', (stats) => {
            const total = sum(Object.values(stats))
            
            let delay = 0
            if (total > 0) {
                this.battlefield.anim_friends_hit(total)
                delay = 1000
            }

            this.set_timeout(delay, () => {
                const enemies = this.battlefield.enemies.filter(e => e !== null)

                if (enemies.length) {
                    this.battlefield.anim_enemies_hit()
                } else {
                    this.battlefield.next_wave()
                    this.battlefield.anim_next_wave()
                }
            })
        })
    }

    start() {
        this.update_hook = this.update.bind(this)
        window.app.ticker.add(this.update_hook)

        this.pole.anim_intial_drop(true)
        this.battlefield.draw_friends()
        this.battlefield.draw_enemies()

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
        this.header.position.y = -this.bh / 2 + this.header.height / 2 + 5

        // rune_helper
        this.rune_helper.scale.set(
            (this.header.height) / (this.rune_helper.height / this.rune_helper.scale.y)
        )
        this.rune_helper.position.y = -this.bh / 2 + this.rune_helper.height / 2 + 5
        this.rune_helper.position.x = -this.bw / 2 + this.rune_helper.width / 2 + 5

        // button_settings
        this.button_settings.scale.set(
            (this.header.height) / (this.button_settings.height / this.button_settings.scale.y)
        )
        this.button_settings.position.y = -this.bh / 2 + this.button_settings.height / 2 + 5
        this.button_settings.position.x = this.bw / 2 - this.button_settings.width / 2 - 5
    }
}
