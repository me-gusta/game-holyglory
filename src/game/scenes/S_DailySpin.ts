import BaseNode from '$lib/BaseNode.ts'
import {create_sprite} from '$lib/create_things.ts'
import {Sprite} from 'pixi.js'
import WoodenHeader from '$src/game/components/WoodenHeader.ts'
import ButtonBack from '$src/game/components/ButtonBack.ts'
import microManage from '$lib/dev/microManage.ts'
import registerKeypress from '$lib/dev/registerKeypress.ts'
import {Easing} from '@tweenjs/tween.js'

class Wheel extends BaseNode {
    bg = create_sprite('daily_spin/wheel')
    constructor() {
        super()
        this.addChild(this.bg)

        registerKeypress('e', () => {
            this.tween(this)
                .to({rotation: Math.PI * 8}, 7200)
                .easing(Easing.Quartic.Out)
                .start()
        })
    }
}


export default class S_DailySpin extends BaseNode {
    header = new WoodenHeader('Try Your Luck')
    button_back = new ButtonBack()
    bg: Sprite
    wheel: Wheel
    node: Sprite
    constructor() {
        super()

        this.bg = create_sprite('daily_spin/bg')
        this.wheel = new Wheel()
        this.node = create_sprite('daily_spin/node')

        this.addChild(this.bg)
        this.addChild(this.header)
        this.addChild(this.button_back)
        this.addChild(this.wheel)
        this.addChild(this.node)

        this.button_back.on('pointerup', () => {
            this.trigger('set_scene', 'main')
        })
    }

    start() {

    }

    resize() {
        this.bh = window.screen_size.height
        this.bw = window.screen_size.width

        this.bg.scale.set(
            (this.bh) / (this.bg.height / this.bg.scale.y)
        )

        // header
        this.header.bw = this.bw * 0.75
        this.header.resize()
        this.header.position.y = -this.bh / 2 + this.header.height / 2 + this.bh * 0.01

        // button_back
        this.button_back.scale.set(
            (this.bw / 10) / (this.button_back.width / this.button_back.scale.x)
        )
        this.button_back.position.x = -this.bw / 2 + this.button_back.width / 2 + this.bw * 0.02
        this.button_back.position.y = this.bh / 2 - this.button_back.height / 2 - this.bw * 0.02

        this.wheel.scale.set(
            (this.bw * 0.9) / (this.wheel.width / this.wheel.scale.x)
        )
        this.node.scale.set(this.wheel.scale.x)

        this.node.position.y = -this.wheel.height/2
    }
}

