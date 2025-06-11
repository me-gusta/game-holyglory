import BaseNode from "$lib/BaseNode"
import {Container, Sprite, Text, Texture, TilingSprite} from "pixi.js"
import WoodenHeader from "../WoodenHeader"
import VRowScrollable from "../VRowScrollable.ts"
import {create_graphics, create_sprite, create_text} from "$lib/create_things"
import colors from "$src/game/colors"
import {Easing} from "@tweenjs/tween.js"
import {Hero} from "$src/game/types.ts";
import ScrollableContainer from "$src/game/components/ScrollableContainer.ts";


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
        this.bg  = create_sprite('button_md_' + e.color)
        this.lbl = create_text({text: e.text, style: {fontSize: 44, fill: colors.dark}})
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


class Button extends BaseNode {
    bg: Sprite
    lbl: Text

    constructor(color: string, text: string) {
        super()
        this.bg  = create_sprite('button_md_' + color)
        this.lbl = create_text({text: text, style: {fontSize: 44, fill: colors.dark}})

        this.addChild(this.bg)
        this.addChild(this.lbl)

        this.lbl.position.y = -5

        this.interactive = true
        this.cursor = 'pointer'
    }
}


class Card extends BaseNode {
    bg = create_sprite('card_large')
    avatar: Sprite
    text1: Text
    text2: Text
    text3: Text
    text4: Text
    text5: Text
    scrollable = new ScrollableContainer()
    text6: Text
    text7: Text
    button1: ButtonWithPrice
    button2: ButtonWithPrice|Button

    constructor(e: Hero) {
        super()

        const text_style = {
            fill: colors.dark,
            fontSize: 52,
        }
        this.text1 = create_text({text: 'Codex', style: {fill: colors.dark, fontSize: 86}})
        this.text2 = create_text({text: 'Name:', style: {...text_style, stroke: {width: 5, color: colors.bright}}})
        this.text3 = create_text({text: e.name, style: text_style})
        this.text4 = create_text({text: 'Level:', style: {...text_style, stroke: {width: 5, color: colors.bright}}})
        this.text5 = create_text({text: e.level, style: text_style})
        this.text6 = create_text({text: 'Bio:', style: {...text_style, stroke: {width: 5, color: colors.bright}}})
        this.text7 = create_text({text: e.bio, style: {...text_style, fontSize: 36, wordWrap: true, wordWrapWidth: 10}})

        this.button1 = new ButtonWithPrice({
            color: 'yellow',
            amount: 7000,
            icon: 'icons/coin',
            text: 'Upgrade'
        })

        if (e.is_unlocked) {
            this.avatar = create_sprite('character_icons/' + e.label)
            this.button2 = new Button('green', 'Select')
        } else {
            this.button1.visible = false
            this.avatar = create_sprite('character_icons_hidden/' + e.label)
            this.button2 = new ButtonWithPrice({
                color: 'blue',
                amount: 700,
                icon: 'icons/gem',
                text: 'Buy'
            })
            this.text3.text = 'UNKNOWN'
            this.text5.text = 'UNKNOWN'
            this.text7.text = '? '.repeat(1000)
        }

        this.addChild(this.bg)
        this.addChild(this.button1)
        this.addChild(this.button2)
        this.addChild(this.avatar)
        this.addChild(this.text1)
        this.addChild(this.text2)
        this.addChild(this.text3)
        this.addChild(this.text4)
        this.addChild(this.text5)
        this.addChild(this.scrollable)
        this.scrollable.add(this.text6)
        this.scrollable.add(this.text7)

        this.button1.on('pointerup', () => {
            this.trigger('set_scene', 'main')
        })
    }

    resize() {
        this.button1.position.x = - this.button1.width / 2 - 20
        this.button1.position.y = this.bg.height / 2 - this.button1.height / 2 - 20

        this.button2.position.x = this.button1.width / 2 + 20
        this.button2.position.y = this.bg.height / 2 - this.button1.height / 2 - 20

        this.avatar.position.x = -this.bg.width / 2 + this.avatar.width / 2 + 20
        this.avatar.position.y = -this.bg.height / 2 + this.avatar.height / 2 + 20

        const space = this.bg.width - (this.avatar.width + 40)

        // heading
        this.text1.position.x = this.avatar.position.x + this.avatar.width / 2 + 20 + space / 2
        this.text1.position.y = -this.bg.height / 2 + this.text1.height / 2 + 20

        // "Name"
        this.text2.anchor.x = 0
        this.text2.position.x = this.avatar.position.x + this.avatar.width / 2 + 20
        this.text2.position.y = this.text1.position.y + this.text2.height / 2 + 60

        // e.name
        this.text3.anchor.x = 1
        this.text3.position.x = this.bg.width / 2 - 20
        this.text3.position.y = this.text2.position.y

        if (this.text3.width >= space - this.text2.width - 40) {
            const w = Math.abs(space - this.text2.width - 40)
            this.text3.scale.set(
                w / (this.text3.width / this.text3.scale.x)
            )
        }

        // "Born"
        this.text4.anchor.x = 0
        this.text4.position.x = this.text2.position.x
        this.text4.position.y = this.text2.position.y + this.text4.height / 2 + 40

        // e.born
        this.text5.anchor.x = 1
        this.text5.position.x = this.bg.width / 2 - 20
        this.text5.position.y = this.text4.position.y


        // "Bio"
        this.text6.anchor.y = 0
        this.text6.anchor.x = 0
        this.text6.position.x = -this.bg.width / 2 + 40
        this.text6.position.y = 0


        this.text7.anchor.y = 0

        this.text7.position.y = this.text6.height + 20
        this.text7.style.wordWrapWidth = this.bg.width - 80

        // scrollable
        this.scrollable.bw = this.bg.width - 40
        this.scrollable.bh = this.bg.height - 75 - this.avatar.height - this.button1.height
        this.scrollable.position.y = -this.bg.height / 2 + 40 + this.avatar.height
        this.scrollable.resize()
    }
}

export default class ModalHero extends BaseNode {
    bg = create_graphics()
        .rect(0, 0, 100, 100)
        .fill({color: 'black', alpha: 0.6})
    card: Card

    constructor(e: Hero) {
        super()

        this.card = new Card(e)
        this.card.interactive = true
        this.addChild(this.bg)
        this.addChild(this.card)

        this.bg.interactive = true
        this.bg.on('pointerup', () => {
            this.trigger('close_modal')
        })
    }

    resize() {
        super.resize()
        this.bw = window.screen_size.width
        this.bh = window.screen_size.height

        // card
        this.card.scale.set(
            (this.bw * 0.9) / (this.card.width / this.card.scale.x),
        )
        this.card.resize()


        // bg
        this.bg.width = this.bw
        this.bg.height = this.bh

        this.bg.position.x = -this.bw / 2
        this.bg.position.y = -this.bh / 2
    }

}
