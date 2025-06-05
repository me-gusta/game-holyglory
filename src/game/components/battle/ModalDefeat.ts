import BaseNode from "$lib/BaseNode"
import { Container, Sprite, Text, Texture, TilingSprite } from "pixi.js"
import WoodenHeader from "../WoodenHeader"
import VRow from "../VRow"
import { create_graphics, create_sprite, create_text } from "$lib/create_things"
import colors from "$src/game/colors"
import { Easing } from "@tweenjs/tween.js"

class ButtonLarge extends BaseNode {
    bg = create_sprite('button_large')
    lbl: Text
    constructor(lbl_text: string) {
        super()
        this.lbl = create_text({ text: lbl_text, style: { fontSize: 94, fill: colors.dark } })
        this.addChild(this.bg)
        this.addChild(this.lbl)

        this.interactive = true
    }
}

class SnakeWidget extends BaseNode {
    bg = create_sprite('snake/skull')
    snake = create_sprite('snake/snake')

    constructor() {
        super()
        this.addChild(this.bg)
        this.addChild(this.snake)
        // this.bg.anchor.set(0)
        this.snake.anchor.set(0)
        this.snake.anchor.x = 0.1
        this.snake.anchor.y = 1

        // this.snake.position.x = 229
        this.snake.position.y = 14

        let prev = 0
        this.tween({rotation: 0})
            .to({rotation: Math.PI / 24}, 1500)
            .easing(Easing.Linear.In)
            .yoyo(true)
            .repeat(100)
            .onUpdate(({rotation}) => {
                if (Math.abs(prev - rotation) > 0.1) return
                prev = rotation
                this.snake.rotation = rotation
            })
            .start()
    }
}

class Card extends BaseNode {
    bg = create_sprite('card_large')
    snake = new SnakeWidget()
    button = new ButtonLarge('OK')

    constructor() {
        super()
        this.addChild(this.bg)
        this.addChild(this.button)
        this.addChild(this.snake)

        this.snake.scale.set(1.5)
        this.snake.position.y = -130

        this.button.on('pointerup', () => {
            this.trigger('set_scene', 'main')
        })
    }

    resize() {
        this.button.position.y = this.bg.height / 2 - this.button.height / 2 - 40
    }
}

export default class ModalDefeat extends BaseNode {
    bg = create_graphics().rect(0, 0, 100, 100).fill({ color: 'black', alpha: 0.6 })
    header = new WoodenHeader('You Lost!')
    card = new Card()

    constructor() {
        super()
        this.addChild(this.bg)
        this.addChild(this.header)
        this.addChild(this.card)

        this.bg.interactive = true
    }

    resize() {
        super.resize()
        this.bw = window.screen_size.width
        this.bh = window.screen_size.height

        // header
        this.header.bw = this.bw * 0.75
        this.header.resize()
        this.header.position.y = -this.bh / 2 + this.header.height / 2 + this.bh * 0.1


        // card
        this.card.scale.set(
            (this.bw * 0.8) / (this.card.width / this.card.scale.x)
        )
        this.card.position.y = this.header.position.y + this.card.height / 2 + this.header.height / 2 + 10
        this.card.resize()


        // bg
        this.bg.width = this.bw
        this.bg.height = this.bh

        this.bg.position.x = -this.bw / 2
        this.bg.position.y = -this.bh / 2



    }

}