import BaseNode from "$lib/BaseNode"
import {Container, Sprite, Text, Texture, TilingSprite} from "pixi.js"
import WoodenHeader from "../WoodenHeader"
import VRow from "../VRow"
import {create_graphics, create_sprite, create_text} from "$lib/create_things"
import colors from "$src/game/colors"
import {Easing} from "@tweenjs/tween.js"
import {Hero} from "$src/game/types.ts";
import ScrollableContainer from "$src/game/components/ScrollableContainer.ts";

const lorem = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum'

class ButtonLarge extends BaseNode {
    bg = create_sprite('button_large')
    lbl: Text

    constructor(lbl_text: string) {
        super()
        this.lbl = create_text({text: lbl_text, style: {fontSize: 94, fill: colors.dark}})
        this.addChild(this.bg)
        this.addChild(this.lbl)

        this.interactive = true
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
    button = new ButtonLarge('OK')

    constructor(e: Hero) {
        super()
        this.avatar = create_sprite('character_icons/' + e.label)

        const text_style = {
            fill: colors.dark,
            fontSize: 52
        }
        this.text1 = create_text({
            text: 'Les Annals',
            style: {
                fill: colors.dark,
                fontSize: 86
            }
        })
        this.text2 = create_text({text: 'Name:', style: {...text_style, stroke: {width: 5, color: colors.bright}}})
        this.text3 = create_text({text: 'Maximus', style: text_style})
        this.text4 = create_text({text: 'Born:', style: {...text_style, stroke: {width: 5, color: colors.bright}}})
        this.text5 = create_text({text: 'Nether Wallop Village', style: text_style})
        this.text6 = create_text({text: 'Bio:', style: {...text_style, stroke: {width: 5, color: colors.bright}}})
        this.text7 = create_text({text: lorem, style: {...text_style,fontSize: 36, wordWrap: true, wordWrapWidth: 1000}})
        this.addChild(this.bg)
        this.addChild(this.button)
        this.addChild(this.avatar)
        this.addChild(this.text1)
        this.addChild(this.text2)
        this.addChild(this.text3)
        this.addChild(this.text4)
        this.addChild(this.text5)
        this.addChild(this.scrollable)
        this.scrollable.add(this.text6)
        this.scrollable.add(this.text7)
        // this.addChild(this.text7)

        this.button.on('pointerup', () => {
            this.trigger('set_scene', 'main')
        })
    }

    resize() {
        this.button.position.y = this.bg.height / 2 - this.button.height / 2 - 20

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
        this.text6.position.x = - this.bg.width / 2 + 40
        this.text6.position.y = 0


        this.text7.anchor.y = 0

        this.text7.position.y = this.text6.height + 20
        this.text7.style.wordWrapWidth = this.bg.width - 80

        // scrollable
        this.scrollable.bw = this.bg.width - 40
        this.scrollable.bh = this.bg.height - 60 - this.avatar.height - this.button.height
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
        this.addChild(this.bg)
        this.addChild(this.card)

        this.bg.interactive = true
    }

    resize() {
        super.resize()
        this.bw = window.screen_size.width
        this.bh = window.screen_size.height

        // card
        this.card.scale.set(
            (this.bw * 0.9) / (this.card.width / this.card.scale.x)
        )
        this.card.resize()


        // bg
        this.bg.width = this.bw
        this.bg.height = this.bh

        this.bg.position.x = -this.bw / 2
        this.bg.position.y = -this.bh / 2
    }

}