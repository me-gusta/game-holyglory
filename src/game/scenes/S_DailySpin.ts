import BaseNode from '$lib/BaseNode.ts'
import {create_sprite, create_text} from '$lib/create_things.ts'
import {Container, Sprite, Text} from 'pixi.js'
import WoodenHeader from '$src/game/components/WoodenHeader.ts'
import ButtonBack from '$src/game/components/ButtonBack.ts'
import microManage from '$lib/dev/microManage.ts'
import registerKeypress from '$lib/dev/registerKeypress.ts'
import {Easing} from '@tweenjs/tween.js'
import Item from '$src/game/components/Item.ts'
import {random_float, random_int} from '$lib/random.ts'
import colors from '$src/game/colors.ts'
import {GlowFilter} from 'pixi-filters'
import ModalVictory from '$src/game/components/battle/ModalVictory.ts'

class Wheel extends BaseNode {
    bg = create_sprite('daily_spin/wheel')
    items = new Container<Item>()

    constructor() {
        super()
        this.addChild(this.bg)
        this.addChild(this.items)
        const es_item = [
            {
                icon: 'icons/coin',
                amount: 300,
            },
            {
                icon: 'icons/gem',
                amount: 11,
            },
            {
                icon: 'icons/coin',
                amount: 222,
            },
            {
                icon: 'icons/gem',
                amount: 45,
            },
            {
                icon: 'icons/coin',
                amount: 14,
            },
            {
                icon: 'icons/coin',
                amount: 54,
            },
            {
                icon: 'icons/coin',
                amount: 12,
            },
            {
                icon: 'icons/coin',
                amount: 555,
            },
        ]

        for (let i = 0; i < es_item.length; i++) {
            const e = es_item[i]
            const item = new Item(e.icon, e.amount)
            this.items.addChild(item)
        }
    }

    spin() {
        const item_n = random_int(0, 7)
        const bias = random_float(-Math.PI / 9, Math.PI / 9)
        this.tween(this)
            .to({rotation: Math.PI * 8 + (item_n * Math.PI / 4) + bias}, 7200)
            .easing(Easing.Quartic.Out)
            .start()
    }

    resize() {
        const w = this.bg.width

        for (let i = 0; i < this.items.children.length; i++) {
            const item = this.items.children[i]
            item.bw = w / 6
            item.bh = w / 6
            item.resize()
            if (i === 0) {
                item.position.set(0, -286)
            } else if (i === 1) {
                item.position.set(192, -210)
            } else if (i === 2) {
                item.position.set(291, 0)
            } else if (i === 3) {
                item.position.set(198, 208)
            } else if (i === 4) {
                item.position.set(0, 287)
            } else if (i === 5) {
                item.position.set(-209, 209)
            } else if (i === 6) {
                item.position.set(-288, 0)
            } else if (i === 7) {
                item.position.set(-208, -224)
            }
        }
    }
}

class ButtonSpin extends BaseNode {
    bg: Sprite
    bg_pressed: Sprite
    lbl: Text

    constructor() {
        super()
        this.bg = create_sprite(`main/ButtonStory`)
        this.bg_pressed = create_sprite(`main/ButtonStory_pressed`)
        this.lbl = create_text({
            text: 'SPIN', style: {
                align: 'center',
                fill: colors.dark,
                stroke: {width: 4, color: '0xbbeafd'},
                fontSize: 64,

            },
        })

        this.addChild(this.bg)
        this.addChild(this.bg_pressed)
        this.addChild(this.lbl)
        this.bg_pressed.visible = false

        this.interactive = true
        this.lbl.position.set(0, -20)
        this.bg.filters = [new GlowFilter({distance: 5, outerStrength: 1, color: 0xbbeafd})]
        this.cursor = 'pointer'
    }

    set_pressed() {
        this.bg.visible = false
        this.bg_pressed.visible = true
        this.lbl.position.set(0, 15)
    }

    set_default() {
        this.bg.visible = true
        this.bg_pressed.visible = false
        this.lbl.position.set(0, -20)
    }
}

export default class S_DailySpin extends BaseNode {
    header = new WoodenHeader('Try Your Luck')
    button_back = new ButtonBack()
    button_spin = new ButtonSpin()
    bg: Sprite
    wheel: Wheel
    node: Sprite
    note: Text

    constructor() {
        super()

        this.bg = create_sprite('daily_spin/bg')
        this.wheel = new Wheel()
        this.node = create_sprite('daily_spin/node')

        this.note = create_text({
            text: 'You have 3 spins',
            style: {
                fill: colors.bright,
                fontSize: 14,
                stroke: {color: colors.dark, width: 2}
            }
        })

        this.addChild(this.bg)
        this.addChild(this.header)
        this.addChild(this.button_back)
        this.addChild(this.wheel)
        this.addChild(this.node)
        this.addChild(this.button_spin)
        this.addChild(this.note)

        this.button_back.on('pointerup', () => {
            this.trigger('set_scene', 'main')
        })

        let can_spin = true
        this.button_spin.on('pointerup', () => {
            if (!can_spin) return
            can_spin = false
            this.wheel.spin()
            this.button_spin.set_pressed()
            this.set_timeout(7400, () => {
                this.button_spin.set_default()

                const modal = new ModalVictory()
                this.addChild(modal)
                modal.resize()
                modal.card.button.on('pointerup', () => {
                    modal.destroy()
                    can_spin = true
                })
            })
        })
    }

    start() {

    }

    resize() {
        this.bh = window.screen_size.height
        this.bw = window.screen_size.width

        this.bg.scale.set(
            (this.bh) / (this.bg.height / this.bg.scale.y),
        )

        // header
        this.header.bw = this.bw * 0.75
        this.header.resize()
        this.header.position.y = -this.bh / 2 + this.header.height / 2 + this.bh * 0.01

        // button_back
        this.button_back.scale.set(
            (this.bw / 10) / (this.button_back.width / this.button_back.scale.x),
        )
        this.button_back.position.x = -this.bw / 2 + this.button_back.width / 2 + this.bw * 0.02
        this.button_back.position.y = this.bh / 2 - this.button_back.height / 2 - this.bw * 0.02

        // wheel
        this.wheel.scale.set(
            (this.bw * 0.9) / (this.wheel.width / this.wheel.scale.x),
        )
        this.wheel.resize()

        // node
        this.node.scale.set(this.wheel.scale.x)
        this.node.position.y = -this.wheel.height / 2

        // button_spin
        this.button_spin.scale.set(
            (this.bw / 2.2) / (this.button_spin.width / this.button_spin.scale.x),
        )
        this.button_spin.position.y = this.wheel.y + this.wheel.height / 2 + this.button_spin.height / 2 + 20

        // note
        this.note.position.y = this.button_spin.position.y + this.button_spin.height /2 + this.note.height

    }
}

