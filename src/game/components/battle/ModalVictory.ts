import BaseNode from "$lib/BaseNode"
import { Container, Sprite, Text, Texture, TilingSprite } from "pixi.js"
import WoodenHeader from "../WoodenHeader"
import VRow from "../VRow"
import { create_graphics, create_sprite, create_text } from "$lib/create_things"
import colors from "$src/game/colors"

class GILoot extends BaseNode {
    icon: Sprite
    lbl: Text
    constructor() {
        super()
        this.icon = create_sprite('icons/coin')
        this.lbl = create_text({ text: 'x300', style: { fontSize: 42, fill: colors.dark, stroke: {width: 7, color: colors.bright} } })
        this.lbl.anchor.x = 1

        this.addChild(this.icon)
        this.addChild(this.lbl)
    }

    resize(): void {
        this.icon.position.x = this.bw / 2
        this.icon.position.y = this.bh / 2

        this.lbl.position.x = this.bw
        this.lbl.position.y = this.bh - this.lbl.height/2 - 10
    }
}

class Grid extends BaseNode {
    cover = create_graphics()
    container = new Container<BaseNode>()
    wsize: number

    constructor(wsize: number) {
        super()
        this.wsize = wsize

        this.addChild(this.cover)
        this.addChild(this.container)
    }

    add(node: BaseNode) {
        this.container.addChild(node)
    }

    resize(): void {
        // this.cover.clear().rect(0, 0, this.bw, this.bh).fill({ color: 0xe322f4, alpha: 0.3 })

        const itemw = this.bw / this.wsize

        for (let i = 0; i < this.container.children.length; i++) {
            const child = this.container.children[i]
            const rowi = Math.floor(i / this.wsize)
            const coli = i % this.wsize

            child.bw = itemw
            child.bh = itemw
            child.resize()
            child.position.x = itemw * coli
            child.position.y = itemw * rowi
        }
    }
}

class ButtonLarge extends BaseNode {
    bg = create_sprite('button_large')
    lbl: Text
    constructor(lbl_text: string) {
        super()
        this.lbl = create_text({ text: lbl_text, style: { fontSize: 94, fill: colors.dark } })
        this.addChild(this.bg)
        this.addChild(this.lbl)
        this.interactive = true
        this.cursor = 'pointer'
    }
}

class Card extends BaseNode {
    bg = create_sprite('card_large')
    button = new ButtonLarge('Claim')
    grid = new Grid(5)

    constructor() {
        super()
        this.addChild(this.bg)
        this.addChild(this.button)
        this.addChild(this.grid)

        this.grid.add(new GILoot())
        this.grid.add(new GILoot())
        this.grid.add(new GILoot())
        this.grid.add(new GILoot())
        this.grid.add(new GILoot())
        this.grid.add(new GILoot())
        this.grid.add(new GILoot())
        this.grid.add(new GILoot())
    }

    resize() {
        this.button.position.y = this.bg.height / 2 - this.button.height / 2 - 40

        // grid
        this.grid.bw = this.bg.width * 0.8
        this.grid.bh = this.bg.height * 0.7
        this.grid.position.x = -this.grid.bw / 2
        this.grid.position.y = -this.bg.height / 2 + 10
        this.grid.resize()
    }
}

export default class ModalVictory extends BaseNode {
    bg = create_graphics().rect(0, 0, 100, 100).fill({ color: 'black', alpha: 0.6 })
    header = new WoodenHeader('Victory!')
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
