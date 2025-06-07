import BaseNode from "$lib/BaseNode"
import { Container, Sprite, Text, Texture, TilingSprite } from "pixi.js"
import WoodenHeader from "../WoodenHeader"
import VRow from "../VRow"
import { create_graphics, create_sprite, create_text } from "$lib/create_things"
import colors from "$src/game/colors"
import { Easing } from "@tweenjs/tween.js"
import ButtonBack from "../ButtonBack"

class ButtonToggle extends BaseNode {
    bg = create_sprite('button_card_on')
    lbl: Text
    state = true
    constructor() {
        super()
        this.lbl = create_text({ text: 'ON', style: { fontSize: 64, fill: colors.dark } })
        this.addChild(this.bg)
        this.addChild(this.lbl)

        this.interactive = true
    }

    disable() {
        this.state = false
        this.lbl.text = 'OFF'
        this.bg.texture = Texture.from('button_card_off')
    }

    enable() {
        this.state = true
        this.lbl.text = 'ON'
        this.bg.texture = Texture.from('button_card_on')
    }

    toggle() {
        if (this.state) this.disable()
        else this.enable()
    }
}

class CardToggle extends BaseNode {
    bg = create_sprite('card_small')
    button = new ButtonToggle()
    icon: Sprite
    lbl: Text

    constructor(icon_sprite: string, lbl_text: string) {
        super()
        this.icon = create_sprite(icon_sprite)
        this.lbl = create_text({ text: lbl_text, style: { fontSize: 84, fill: colors.dark } })
        this.lbl.anchor.x = 0

        this.addChild(this.bg)
        this.addChild(this.icon)
        this.addChild(this.button)
        this.addChild(this.lbl)


        this.button.on('pointerup', () => {
            this.button.toggle()
        })
    }

    resize() {
        this.scale.set(
            (this.bw * 0.8) / (this.bg.width / this.scale.x)
        )

        this.icon.position.x = -this.bg.width / 2 + this.icon.width / 2 + 40
        this.lbl.position.x = this.icon.position.x + this.icon.width / 2 + 40

        this.button.position.x = this.bg.width / 2 - this.button.width / 2 - 40
    }
}

export default class ModalSettings extends BaseNode {
    bg: TilingSprite
    header = new WoodenHeader('Settings')
    vrow = new VRow()
    card_sound = new CardToggle('icons/sound', 'Sound')
    card_music = new CardToggle('icons/music', 'Music')
    button_back = new ButtonBack()

    constructor() {
        super()
        this.bg = new TilingSprite({ texture: Texture.from('seamlessbg') })

        this.addChild(this.bg)
        this.addChild(this.header)
        this.addChild(this.vrow)

        this.vrow.add(this.card_sound)
        this.vrow.add(this.card_music)

        this.addChild(this.button_back)

        this.bg.interactive = true

        this.button_back.on('pointerup', () => {
            this.trigger('pause_off')
        })
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

        // bg
        this.bg.width = this.bw
        this.bg.height = this.bh

        this.bg.position.x = -this.bw / 2
        this.bg.position.y = -this.bh / 2


        // button_back
        this.button_back.scale.set(
            (this.bw / 10) / (this.button_back.width / this.button_back.scale.x)
        )
        this.button_back.position.x = -this.bw / 2 + this.button_back.width / 2 + this.bw * 0.02
        this.button_back.position.y = this.bh / 2 - this.button_back.height / 2 - this.bw * 0.02

    }

}
