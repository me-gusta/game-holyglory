import BaseNode from "$lib/BaseNode"
import {Container, Sprite, Text, Texture, TilingSprite} from "pixi.js"
import WoodenHeader from "../WoodenHeader"
import VRowScrollable from "../VRowScrollable.ts"
import {create_graphics, create_sprite, create_text} from "$lib/create_things"
import colors from "$src/game/colors"
import Grid from '$src/game/components/Grid.ts'
import {Reward} from '$src/game/data/store.ts'
import {get_reward_icon} from '$src/game/other.ts'

class GILoot extends BaseNode {
    icon: Sprite
    lbl: Text

    constructor(r: Reward) {
        super()
        this.icon = create_sprite(get_reward_icon(r))
        this.lbl = create_text({
            text: 'x' + r.amount,
            style: {fontSize: 42, fill: colors.dark, stroke: {width: 7, color: colors.bright}},
        })
        this.lbl.anchor.x = 1

        this.addChild(this.icon)
        this.addChild(this.lbl)
    }

    resize(): void {
        this.icon.position.x = this.bw / 2
        this.icon.position.y = this.bh / 2

        this.lbl.position.x = this.bw
        this.lbl.position.y = this.bh - this.lbl.height / 2 - 10
    }
}


class ButtonLarge extends BaseNode {
    bg = create_sprite('button_large')
    lbl: Text

    constructor(lbl_text: string) {
        super()
        this.lbl = create_text({text: lbl_text, style: {fontSize: 94, fill: colors.dark}})
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
    bg = create_graphics().rect(0, 0, 100, 100).fill({color: 'black', alpha: 0.6})
    header = new WoodenHeader('Victory!')
    card = new Card()
    rewards: Reward[] = []

    constructor() {
        super()
        this.addChild(this.bg)
        this.addChild(this.header)
        this.addChild(this.card)

        this.bg.interactive = true
    }

    add_reward(r: Reward) {
        this.rewards.push(r)
        this.card.grid.add(new GILoot(r))
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
            (this.bw * 0.8) / (this.card.width / this.card.scale.x),
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
