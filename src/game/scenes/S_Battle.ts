import BaseNode from "$lib/BaseNode"
import { create_fx, create_graphics, create_point, create_sprite, create_text, create_vector } from "$lib/create_things"
import make_draggable from "$lib/make_draggable"
import { random_choice, random_int } from "$lib/random"
import { isPointInCircle, loading_circle, map_interval, rad2sector, sum } from "$lib/utility"
import { IPoint } from "$lib/Vector"
import { Easing } from "@tweenjs/tween.js"
import { Container, DestroyOptions, FederatedEvent, FederatedPointerEvent, Graphics, Sprite, Text, Texture, Ticker } from "pixi.js"
import Pole from "../components/battle/Pole"
import registerKeypress from "$lib/dev/registerKeypress"
import microManage from "$lib/dev/microManage"
import { Spine } from "@esotericsoftware/spine-pixi-v8"
import colors from "../colors"
import ButtonSettings from "../components/ButtonSettings"
import store from "$lib/store"
import Battlefield from "../components/battle/Battlefield"
import ModalVictory from "../components/battle/ModalVictory"
import ModalDefeat from "../components/battle/ModalDefeat"
import ModalPause from "../components/battle/ModalPause"
import { GlowFilter } from "pixi-filters"


class ScrollHeader extends BaseNode {
    bg: Sprite
    lbl: Text
    max_wave = 0
    wave = 1
    constructor() {
        super()
        this.bg = create_sprite('battle/header')
        this.lbl = create_text({ text: 'Wave 1/1', style: { fill: colors.dark, fontSize: 48 } })
        this.addChild(this.bg)
        this.addChild(this.lbl)
    }
    set_max_wave(n: number) {
        this.max_wave = n
        this.lbl.text = `Wave ${this.wave}/${this.max_wave}`
    }
    set_wave(n: number) {
        this.wave = n
        this.lbl.text = `Wave ${this.wave}/${this.max_wave}`
    }
}



class Spellbox extends BaseNode {
    img: Sprite
    border: Sprite
    border_loaded: Sprite
    overlay = create_graphics().rect(-80, -80, 160, 160).fill({ color: 0, alpha: 0.2 })
    msk = loading_circle(0)
    skill_label: string
    level = 1
    rune: string
    runes_current = 0
    runes_needed = 0

    constructor(skill_label: string, rune: string) {
        super()
        this.img = skill_label ? create_sprite('spells/' + skill_label) : create_sprite()
        this.border = create_sprite('battle/skill_border')
        this.border_loaded = rune ? create_sprite('battle/skill_loaded_' + rune) : create_sprite()
        this.rune = rune
        this.skill_label = skill_label
        this.addChild(this.img)
        this.addChild(this.overlay)
        this.addChild(this.border)
        this.addChild(this.border_loaded)
        this.addChild(this.msk)

        this.msk.scale.set(1.3)
        this.msk.scale.y = -1.3
        this.msk.rotation = Math.PI - Math.PI / 4

        this.border_loaded.mask = this.msk

        this.img.scale.set(0.3)


        this.set_load(0.25)
    }

    set_load(n: number) {
        console.log(n)
        loading_circle(n, this.msk)
        const n2 = map_interval(0, 1, 0.25, 1, n)

        if (n2 >= 1) {
            this.border.filters = [new GlowFilter({ distance: 5, outerStrength: 2, color: 0xbbeafd })]
            this.overlay.visible = false
        } else {
            this.border.filters = []
            this.overlay.visible = true
        }
    }

    add_runes(amount: number) {
        for (let i = 0; i < amount; i++) {
            if (this.runes_current < this.runes_needed) this.set_timeout(i * 150, () => {
                this.runes_current = this.runes_current + 1

                if (this.runes_current > this.runes_needed) this.runes_current = this.runes_needed

                this.set_load(this.runes_current / this.runes_needed)
            })
        }
    }

    resize() {

    }
}


export default class S_Battle extends BaseNode {
    button_settings = new ButtonSettings()
    rune_helper = create_sprite('battle/runehelp')
    header = new ScrollHeader()
    pole: Pole
    battlefield: Battlefield
    spells = new Container<Spellbox>()

    update_hook!: OmitThisParameter<any>
    modal?: BaseNode

    constructor() {
        super()

        this.pole = new Pole()
        this.battlefield = new Battlefield()

        this.addChild(this.pole)
        this.addChild(this.battlefield)
        this.addChild(this.header)
        this.addChild(this.rune_helper)
        this.addChild(this.button_settings)
        this.addChild(this.spells)

        for (let spell_data of store.spells_equipped) {
            if (!spell_data) {
                const spell = new Spellbox('', '')
                this.spells.addChild(spell)
                spell.visible = false
            } else {
                const spell = new Spellbox(spell_data.label, spell_data.rune)
                this.spells.addChild(spell)
                spell.level = spell_data.level
                spell.runes_needed = spell_data.runes_needed
            }
        }


        registerKeypress('e', () => {
            this.pole.match_all_manual()
        })

        registerKeypress('z', () => this.battlefield.anim_hero_hit(1, {}))
        registerKeypress('x', () => this.battlefield.anim_enemies_hit())
        registerKeypress('b', () => this.battlefield.anim_walk_in())
        registerKeypress('n', () => {
            this.battlefield.next_wave()
            this.battlefield.anim_next_wave()
        })

        this.pole.on('runes_destroyed', (stats) => {
            for (let [key, value] of Object.entries(stats)) {
                store.battle.runes[key] += value

                for (let spell of this.spells.children) {
                    if (spell.rune !== key) continue
                    spell.add_runes(value as any)
                }
            }
        })

        this.pole.on('match_completed', (stats) => {
            

            const total = sum(Object.values(stats))

            let delay = 0
            if (total > 0) {
                this.battlefield.anim_hero_hit(total, stats)
                delay = 1000
            }

            this.set_timeout(delay, () => {
                const enemies = this.battlefield.mobs.filter(e => e !== null)

                if (enemies.length) {
                    this.battlefield.anim_enemies_hit()
                } else {
                    if (this.header.wave === this.header.max_wave) {
                        this.show_victory()
                        return
                    }
                    this.battlefield.next_wave()
                    this.battlefield.anim_next_wave()
                    this.header.set_wave(this.header.wave + 1)
                }

                this.battlefield.next_mob_turn()
                console.log('turn', this.battlefield.mob_turn)
            })
        })

        this.button_settings.on('pointerup', () => {
            this.show_pause()
        })

        this.battlefield.on('lost', () => {
            this.show_defeat()
        })

        this.on('pause_off', () => {
            if (!this.modal) return

            this.modal.destroy()
            this.modal = undefined
        })

        this.on('surrender', () => {
            if (!this.modal) return

            this.modal.destroy()
            this.modal = undefined

            this.trigger('set_scene', 'main')
        })

        store.init_battle()
    }

    show_victory() {
        this.modal = new ModalVictory()
        this.modal.alpha = 0
        this.addChild(this.modal)
        this.modal.resize()

        this.tween(this.modal)
            .to({ alpha: 1 }, 400)
            .start()
    }


    show_defeat() {
        this.modal = new ModalDefeat()
        this.modal.alpha = 0
        this.addChild(this.modal)
        this.modal.resize()

        this.tween(this.modal)
            .to({ alpha: 1 }, 400)
            .start()
    }

    show_pause() {
        this.modal = new ModalPause()
        this.modal.alpha = 0
        this.addChild(this.modal)
        this.modal.resize()

        this.tween(this.modal)
            .to({ alpha: 1 }, 400)
            .start()
    }

    start() {
        this.update_hook = this.update.bind(this)
        window.app.ticker.add(this.update_hook)

        this.pole.anim_intial_drop(true)
        this.battlefield.draw_enemies()

        const e_battle = store.battles[store.current_battle]
        this.header.set_max_wave(e_battle.waves.length)
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

        if (this.modal) this.modal.resize()

        for (let i = 0; i < this.spells.children.length; i++) {
            const spell = this.spells.children[i]

            spell.scale.set(
                (this.bw * 0.25) / (spell.width / spell.scale.x)
            )

            if (i == 1) {
                spell.position.x = -this.bw / 3
            }
            if (i == 2) {
                spell.position.x = this.bw / 3
            }
        }

        this.spells.position.y = this.pole.position.y - this.pole.height / 2 - this.spells.height / 2 + this.spells.height * 0.28
    }
}
