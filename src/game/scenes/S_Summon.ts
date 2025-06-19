import BaseNode from "$lib/BaseNode"
import { create_graphics, create_point, create_sprite, create_text, create_vector } from "$lib/create_things"
import { Container, FederatedPointerEvent, Sprite, Text, Texture, TilingSprite } from "pixi.js"
import colors from "../colors"
import WoodenHeader from "../components/WoodenHeader"
import VRowScrollable from "../components/VRowScrollable.ts"
import ButtonBack from "../components/ButtonBack"
import store from "$src/game/data/store"
import Item from '$src/game/components/Item.ts'
import HeaderTop from '$src/game/components/HeaderTop.ts'
import ModalVictory from '$src/game/components/battle/ModalVictory.ts'
import ModalItemDrop from '$src/game/components/ModalItemDrop.ts'
import ModalSalute from '$src/game/components/ModalSalute.ts'
import {Easing} from '@tweenjs/tween.js'

type ButtonWithPriceInfo = {
    color:string,
    amount: number,
    icon: string,
    text: string,
}

class ButtonWithPrice extends BaseNode {
    bg: Sprite
    lbl: Text
    lbl2: Text
    icon: Sprite

    constructor(e: ButtonWithPriceInfo) {
        super()
        this.bg  = create_sprite('button_large')
        this.lbl = create_text({text: e.text, style: {fontSize: 64, fill: colors.dark}})
        this.lbl2 = create_text({text: e.amount, style: {fontSize: 44, fill: colors.dark}})
        this.icon = create_sprite(e.icon)

        this.addChild(this.bg)
        this.addChild(this.lbl)
        this.addChild(this.lbl2)
        this.addChild(this.icon)

        this.lbl.position.y = -30
        this.lbl2.position.y = 25

        this.icon.scale.set(
            (this.lbl2.height * 0.8) / (this.icon.height / this.icon.scale.y)
        )
        this.lbl2.position.x = - this.icon.width / 2

        this.icon.position.y = this.lbl2.position.y
        this.icon.position.x =  this.icon.width + 20


        this.interactive = true
        this.cursor = 'pointer'
    }
}


class CardSummon extends BaseNode {
    bg: Sprite
    img: Sprite
    lbl: Text
    button: ButtonWithPrice
    constructor() {
        super()

        this.bg = create_sprite('card_large')
        this.lbl = create_text({
            text: "Hello, my dear Friend!\nClick the button to see how I can\noperate with my magic wand!" ,
            style: {
                fontSize: 48,
                fill: colors.dark,
                align: 'center',
            }
        })
        this.img = create_sprite('summon/merlin')

        this.button = new ButtonWithPrice({
            color: 'any',
            amount: 100,
            icon: 'icons/gem',
            text: 'Summon a new character',
        })

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
        this.button.position.y = this.bg.height/2 - this.button.height/2 - 30
    }
}



export default class S_Summon extends BaseNode {
    bg: TilingSprite
    header_top = new HeaderTop()
    header = new WoodenHeader('Merlin\'s Lab')
    vrow = new VRowScrollable()
    button_back = new ButtonBack()
    modal?: ModalItemDrop
    modal_salute = new ModalSalute()

    constructor() {
        super()
        this.bg = new TilingSprite({ texture: Texture.from('seamlessbg') })
        this.addChild(this.bg)
        this.addChild(this.header_top)
        this.addChild(this.header)
        this.addChild(this.vrow)
        this.addChild(this.button_back)

        this.vrow.add(
            new CardSummon()
        )

        this.button_back.on('pointerup', () => this.trigger('set_scene', 'main'))

        ;(this.vrow.container.children[0] as CardSummon).button.on('pointerup', () => {
            this.modal = new ModalItemDrop()
            this.addChild(this.modal)
            this.addChild(this.modal_salute)

            this.modal.add_reward({
                label: 'hero/maiden',
                amount: 15
            })

            this.modal.alpha = 0

            this.tween(this.modal)
                .to({alpha: 1}, 1200)
                .easing(Easing.Linear.None)
                .start()

            this.modal.resize()

            this.modal_salute.salute()
        })


    }

    start() {
    }


    resize() {
        super.resize()
        this.bw = window.screen_size.width
        this.bh = window.screen_size.height

        this.modal_salute.resize()

        // header_top
        this.header_top.bw = this.bw
        this.header_top.resize()
        this.header_top.position.x = -this.bw / 2
        this.header_top.position.y = -this.bh / 2

        // header
        this.header.bw = this.bw * 0.75
        this.header.resize()
        this.header.position.y = -this.bh / 2 + this.header.height / 2 + this.bh * 0.01 + this.header_top.height

        // vrow
        this.vrow.bw = this.bw * 0.9
        this.vrow.bh = this.bh - (this.header.height + this.header_top.height + this.bh * 0.04)
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
