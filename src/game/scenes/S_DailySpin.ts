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
import HeaderTop from '$src/game/components/HeaderTop.ts'
import store, {save} from '$src/game/data/store.ts'
import {get_reward_icon} from '$src/game/other.ts'
import awe from '$src/game/data/awe.ts'

class Wheel extends BaseNode {
    bg = create_sprite('daily_spin/wheel')
    items = new Container<Item>()
    rotation_base = 0

    constructor() {
        super()
        this.addChild(this.bg)
        this.addChild(this.items)
        const es_item = store.spin_data.rewards

        for (let i = 0; i < es_item.length; i++) {
            const e = es_item[i]
            const icon = get_reward_icon(e)
            const item = new Item(icon, e.amount)
            this.items.addChild(item)
        }
    }

    spin() {
        const item_n = random_int(0, 7)
        const bias = random_float(-Math.PI / 9, Math.PI / 9)
        this.tween(this)
            .to({rotation: this.rotation_base + Math.PI * 8 - (item_n * Math.PI / 4) + bias}, 7200)
            .easing(Easing.Quartic.Out)
            .start()
            .onComplete(() => {
                this.rotation_base += Math.PI * 8
            })

        return item_n
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
    lbl2: Text
    icon: Sprite
    is_payment = false

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

        this.lbl2 = create_text({text: 50, style: {fontSize: 44, fill: colors.dark}})
        this.icon = create_sprite('icons/gem')


        this.addChild(this.bg)
        this.addChild(this.bg_pressed)
        this.addChild(this.lbl)
        this.addChild(this.lbl2)
        this.addChild(this.icon)
        this.bg_pressed.visible = false

        this.interactive = true
        this.lbl.position.set(0, -20)
        this.bg.filters = [new GlowFilter({distance: 5, outerStrength: 1, color: 0xbbeafd})]
        this.cursor = 'pointer'
        this.lbl2.visible = false
        this.icon.visible = false
    }

    set_pressed() {
        this.bg.visible = false
        this.bg_pressed.visible = true
        this.lbl.position.set(0, 15)

        if (this.is_payment) {
            this.lbl.position.y = -15
            this.lbl2.position.y = 50
            this.icon.position.y = this.lbl2.position.y
        }
    }

    set_default() {
        this.bg.visible = true
        this.bg_pressed.visible = false
        this.lbl.position.set(0, -20)

        if (this.is_payment) {
            this.lbl.position.y = -50
            this.lbl2.position.y = 15
            this.icon.position.y = this.lbl2.position.y
        }
    }

    set_payment() {
        this.lbl.position.y = -50
        this.lbl2.position.y = 15

        this.icon.scale.set(
            (this.lbl2.height * 0.8) / (this.icon.height / this.icon.scale.y)
        )
        this.lbl2.position.x = - this.icon.width / 2
        this.icon.position.y = this.lbl2.position.y
        this.icon.position.x =  this.icon.width
        this.lbl2.visible = true
        this.icon.visible = true
        this.is_payment = true
    }
}

export default class S_DailySpin extends BaseNode {
    header_top = new HeaderTop()
    header: WoodenHeader
    button_back = new ButtonBack()
    button_spin = new ButtonSpin()
    bg: Sprite
    wheel: Wheel
    node: Sprite
    note: Text

    constructor() {
        super()
        this.header = new WoodenHeader('Try Your Luck')
        this.bg = create_sprite('daily_spin/bg')
        this.wheel = new Wheel()
        this.node = create_sprite('daily_spin/node')

        const spins_amount = store.spin_data.spins
        this.note = create_text({
            text: `You have ${spins_amount} free spins`,
            style: {
                fill: colors.bright,
                fontSize: 14,
                stroke: {color: colors.dark, width: 2}
            }
        })
        if (spins_amount <= 0) this.note.text = `You'll get a free spin tomorrow!`

        this.addChild(this.bg)
        this.addChild(this.header_top)
        this.addChild(this.header)
        this.addChild(this.button_back)
        this.addChild(this.wheel)
        this.addChild(this.node)
        this.addChild(this.button_spin)
        this.addChild(this.note)

        this.button_back.on('pointerup', () => {
            this.trigger('set_scene', 'main')
        })

        this.awe_listen('spin_data.spins', (upd) => {
            this.note.text = `You have ${upd.current} free spins`
            if (Number(upd.current) <= 0 ) this.note.text = `You'll get a free spin tomorrow!`
        })

        if (store.spin_data.spins <= 0) {
            this.button_spin.set_payment()
        }

        let can_spin = true
        this.button_spin.on('pointerup', () => {
            if (!can_spin) return
            if (store.spin_data.spins <= 0) {
                if (store.stats.gems <= 50) return
                awe.sub('stats.gems', 50)
            }
            can_spin = false
            const item_n = this.wheel.spin()
            const reward = store.spin_data.rewards[item_n]
            this.button_spin.set_pressed()

            this.set_timeout(7400, () => {
                this.button_spin.set_default()

                const modal = new ModalVictory()
                modal.add_reward(reward)
                this.addChild(modal)
                modal.resize()
                modal.card.button.on('pointerup', () => {
                    for (let reward of modal.rewards) {
                        if (reward.label === 'coins') awe.add('stats.coins', reward.amount)
                        if (reward.label === 'gems') awe.add('stats.gems', reward.amount)
                        if (reward.label === 'energy') awe.add('stats.energy', reward.amount)
                    }
                    if (store.spin_data.spins >= 1) awe.sub('spin_data.spins', 1)
                    save()
                    modal.destroy()
                    can_spin = true
                    if (store.spin_data.spins <= 0) {
                        this.button_spin.set_payment()
                    }
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

        // header_top
        this.header_top.bw = this.bw
        this.header_top.resize()
        this.header_top.position.x = -this.bw / 2
        this.header_top.position.y = -this.bh / 2

        // header
        this.header.bw = this.bw * 0.75
        this.header.resize()
        this.header.position.y = -this.bh / 2 + this.header.height / 2 + this.bh * 0.01 + this.header_top.height

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

