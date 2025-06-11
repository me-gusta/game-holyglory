import BaseNode from "$lib/BaseNode"
import {create_graphics, create_point, create_sprite, create_text, create_vector} from "$lib/create_things"
import {Container, FederatedPointerEvent, Sprite, Text, Texture, TilingSprite} from "pixi.js"
import colors from "../colors"
import WoodenHeader from "../components/WoodenHeader"
import VRowScrollable from "../components/VRowScrollable.ts"
import ButtonBack from "../components/ButtonBack"
import store from "$lib/store"
import Item from '$src/game/components/Item.ts'
import HeaderTop from "$src/game/components/HeaderTop.ts";
import DockSmall from "$src/game/components/DockSmall.ts";
import ScrollableContainer from "$src/game/components/ScrollableContainer.ts";
import VRow from "$src/game/components/VRow.ts";
import {BuyPack} from "$src/game/types.ts";

class Button extends BaseNode {
    bg = create_sprite('button_card_on')
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

class Card extends BaseNode {
    item: Item
    lbl: Text
    bg: Sprite
    button: Button

    constructor(e: BuyPack) {
        super()

        const {
            label,
            amount,
            item,
            icon,
            text,
            price
        } = e

        this.bg = create_sprite('card_small')
        this.lbl = create_text({
            text: text, style: {
                fontSize: 48,
                fill: colors.dark,
            }
        })
        this.lbl.anchor.x = 0
        this.item = new Item(icon, amount)

        this.button = new Button(price.text)

        this.addChild(this.bg)
        this.addChild(this.lbl)
        this.addChild(this.item)
        this.addChild(this.button)
    }

    resize() {
        const s = this.bw / (this.bg.width / this.bg.scale.x)
        this.scale.set(s)

        this.item.bw = this.bg.height * 0.6
        this.item.bh = this.bg.height * 0.6
        this.item.resize()
        this.item.position.x = -this.bg.width / 2 + this.item.width / 2 + 30

        this.lbl.position.x = this.item.position.x + this.item.width / 2 + 30

        this.button.position.x = this.bg.width / 2 - this.button.width / 2 - 30
    }
}


export default class S_Shop extends BaseNode {
    bg: TilingSprite
    header = new HeaderTop()
    dock = new DockSmall()
    scrollable = new ScrollableContainer()
    header1: WoodenHeader
    vrow1 = new VRow()
    header2: WoodenHeader
    vrow2 = new VRow()

    constructor() {
        super()
        this.bg = new TilingSprite({texture: Texture.from('seamlessbg')})
        this.header1 = new WoodenHeader('Coins')
        this.header2 = new WoodenHeader('Gems')
        this.addChild(this.bg)
        this.addChild(this.header)
        this.addChild(this.scrollable)
        this.addChild(this.dock)

        this.scrollable.add(this.header1)
        this.scrollable.add(this.vrow1)
        this.scrollable.add(this.header2)
        this.scrollable.add(this.vrow2)

        this.dock.button1.setActive()
        this.dock.button2.on('pointerup', () => {
            this.trigger('set_scene', 'backpack')
        })

        this.dock.button3.on('pointerup', () => {
            this.trigger('set_scene', 'main')
        })

        const es_buypacks = [
            {
                label: 'coins100',
                amount: 100,
                item: 'coins',
                icon: 'icons/coin',
                text: '100 Coins',
                price: {
                    text: '$0.99'
                }
            },
            {
                label: 'coins100',
                amount: 1000,
                item: 'coins',
                icon: 'icons/coin',
                text: 'Special! 1000 Coins',
                price: {
                    text: '$5.99'
                }
            },
        ]


        for (let e of es_buypacks) {
            const card = new Card(e)
            this.vrow1.add(card)
        }

        const es_buypacks_gems = [
            {
                label: 'gems100',
                amount: 100,
                item: 'gems',
                icon: 'icons/gem',
                text: '100 Gems',
                price: {
                    text: '$0.99'
                }
            },
            {
                label: 'gems100',
                amount: 1000,
                item: 'gems',
                icon: 'icons/gem',
                text: 'Special! 1000 Gems',
                price: {
                    text: '$5.99'
                }
            },
        ]

        for (let e of es_buypacks_gems) {
            const card = new Card(e)
            this.vrow2.add(card)
        }
    }

    start() {
    }


    resize() {
        super.resize()
        this.bw = window.screen_size.width
        this.bh = window.screen_size.height

        // header
        this.header.bw = this.bw
        this.header.resize()
        this.header.position.x = -this.bw / 2
        this.header.position.y = -this.bh / 2

        // dock
        this.dock.bw = this.bw
        this.dock.resize()
        this.dock.position.x = -this.bw / 2
        this.dock.position.y = this.bh / 2 - this.dock.height

        // header1
        this.header1.bw = this.bw * 0.75
        this.header1.resize()
        this.header1.position.y = this.header1.height / 2 + this.bh * 0.01

        // vrow
        this.vrow1.bw = this.bw * 0.9
        this.vrow1.resize()
        this.vrow1.position.y = this.header1.position.y + this.header1.height / 2 + 20

        // header2
        this.header2.bw = this.bw * 0.75
        this.header2.resize()
        this.header2.position.y = this.vrow1.position.y + this.vrow1.height + this.header2.height / 2 + 40

        // vrow
        this.vrow2.bw = this.bw * 0.9
        this.vrow2.resize()
        this.vrow2.position.y = this.header2.position.y + this.header2.height / 2 + 20

        // scrollable
        this.scrollable.bw = this.bw
        this.scrollable.bh = this.bh - this.dock.height - this.header.height
        this.scrollable.resize()
        this.scrollable.y = -this.bh / 2 + this.header.height


        // bg
        this.bg.width = this.bw
        this.bg.height = this.bh

        this.bg.position.x = -this.bw / 2
        this.bg.position.y = -this.bh / 2

        const bg_scale = (this.bw / 256) / 5
        this.bg.tileScale.set(bg_scale)

    }
}
