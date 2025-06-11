import BaseNode from "$lib/BaseNode"
import { create_graphics, create_point, create_sprite, create_text, create_vector } from "$lib/create_things"
import { Container, FederatedPointerEvent, Sprite, Text, Texture, TilingSprite } from "pixi.js"
import colors from "../colors"
import WoodenHeader from "../components/WoodenHeader"
import VRowScrollable from "../components/VRowScrollable.ts"
import ButtonBack from "../components/ButtonBack"
import store from "$lib/store"
import Item from '$src/game/components/Item.ts'

type Quest = {
    task: string
    amount_max: number
    amount_current: number
    reward: {
        item: string
        icon: string
        amount: number
    }
}

class ButtonSummon extends BaseNode {
    bg = create_sprite('button_large')
    lbl: Text
    constructor(lbl_text: string) {
        super()
        this.lbl = create_text({
            text: lbl_text, style: {
                fontSize: 48,
                fill: colors.dark,
            }
        })

        this.addChild(this.bg)
        this.addChild(this.lbl)
        this.interactive = true
        this.cursor = 'pointer'
    }
}

class CardSummon extends BaseNode {
    bg: Sprite
    img: Sprite
    lbl: Text
    button: ButtonSummon
    constructor() {
        super()

        this.bg = create_sprite('card_large')
        this.lbl = create_text({
            text: "Summon a New Character.\n Can be any of: Elf, Gnome..." ,
            style: {
                fontSize: 48,
                fill: colors.dark,
                align: 'center',
            }
        })
        this.img = create_sprite('summon/merlin')

        this.button = new ButtonSummon('Summon')

        this.addChild(this.bg)
        this.addChild(this.lbl)
        this.addChild(this.img)
        this.addChild(this.button)
    }

    resize() {
        const s = this.bw / (this.bg.width / this.bg.scale.x)
        this.scale.set(s)

        this.img.position.y = -this.bg.height/2 + this.img.height/2 + 60

        this.lbl.position.y = this.img.position.y + this.img.height / 2 + this.lbl.height/2

        this.button.position.x = this.bg.width / 2 - this.button.width / 2 - 30
        this.button.position.y = this.bg.height/2 - this.button.height/2 - 60
    }
}



export default class S_Summon extends BaseNode {
    bg: TilingSprite
    header = new WoodenHeader('Merlin\'s Lab')
    vrow = new VRowScrollable()
    button_back = new ButtonBack()

    constructor() {
        super()
        this.bg = new TilingSprite({ texture: Texture.from('seamlessbg') })
        this.addChild(this.bg)
        this.addChild(this.header)
        this.addChild(this.vrow)
        this.addChild(this.button_back)

        this.vrow.add(
            new CardSummon()
        )

        this.button_back.on('pointerup', () => this.trigger('set_scene', 'main'))
    }

    start() {
    }


    resize() {
        super.resize()
        this.bw = window.screen_size.width
        this.bh = window.screen_size.height

        // header
        this.header.bw = this.bw * 0.75
        this.header.resize()
        this.header.position.y = -this.bh / 2 + this.header.height / 2 + this.bh * 0.01

        // vrow
        this.vrow.bw = this.bw * 0.9
        this.vrow.bh = this.bh - (this.header.height + this.bh * 0.04)
        this.vrow.resize()
        this.vrow.position.y = -this.bh / 2 + (this.bh - this.vrow.bh)

        // button_back
        this.button_back.scale.set(
            (this.bw / 10) / (this.button_back.width / this.button_back.scale.x)
        )
        this.button_back.position.x = -this.bw / 2 + this.button_back.width / 2 + this.bw * 0.02
        this.button_back.position.y = this.bh / 2 - this.button_back.height / 2 - this.bw * 0.02

        // bg
        this.bg.width = this.bw
        this.bg.height = this.bh

        this.bg.position.x = -this.bw / 2
        this.bg.position.y = -this.bh / 2

        const bg_scale = (this.bw / 256) / 5
        this.bg.tileScale.set(bg_scale)

    }
}
