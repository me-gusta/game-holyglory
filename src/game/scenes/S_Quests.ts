import BaseNode from "$lib/BaseNode"
import { create_graphics, create_point, create_sprite, create_text, create_vector } from "$lib/create_things"
import { Container, FederatedPointerEvent, Sprite, Text, Texture, TilingSprite } from "pixi.js"
import colors from "../colors"
import WoodenHeader from "../components/WoodenHeader"
import VRow from "../components/VRow"
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

class ButtonQuest extends BaseNode {
    bg = create_sprite('button_card')
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

    set_completed() {
        this.bg.texture = Texture.from('button_card_on')
        this.lbl.text = 'Claim'
    }
}

class CardQuest extends BaseNode {
    item: Item
    lbl: Text
    bg: Sprite
    button: ButtonQuest
    constructor(q: Quest, is_purple = false) {
        super()

        const { task, amount_max, amount_current, reward } = q

        this.bg = create_sprite(is_purple ? 'card_small_purple' : 'card_small')
        this.lbl = create_text({
            text: task, style: {
                fontSize: 48,
                fill: colors.dark,
            }
        })
        this.lbl.anchor.x = 0
        this.item = new Item(reward.icon, reward.amount)

        const percents = Math.floor(amount_current / amount_max * 100)
        const btn_text = percents + '%'
        this.button = new ButtonQuest(btn_text)

        this.addChild(this.bg)
        this.addChild(this.lbl)
        this.addChild(this.item)
        this.addChild(this.button)

        if (percents >= 100) {
            this.button.set_completed()
        }
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



export default class S_Quests extends BaseNode {
    bg: TilingSprite
    header = new WoodenHeader('Quests')
    vrow = new VRow()
    button_back = new ButtonBack()

    constructor() {
        super()
        this.bg = new TilingSprite({ texture: Texture.from('seamlessbg') })
        this.addChild(this.bg)
        this.addChild(this.header)
        this.addChild(this.vrow)
        this.addChild(this.button_back)

        const quests = [
            {
                task: 'Match 100 runes',
                amount_max: 100,
                amount_current: 33,
                reward: {
                    item: 'coins',
                    icon: 'icons/coin',
                    amount: 1
                }
            },
            {
                task: 'Match 100 runes',
                amount_max: 100,
                amount_current: 133,
                reward: {
                    item: 'coins',
                    icon: 'icons/coin',
                    amount: 100
                }
            }
        ]

        this.vrow.add(
            new CardQuest(
                {
                    task: 'Complete 5 quests',
                    amount_max: 5,
                    amount_current: 1,
                    reward: {
                        item: 'gems',
                        icon: 'icons/gem',
                        amount: 1000
                    }
                },
                true
            )
        )

        for (let e of quests) {
            const quest = new CardQuest(e)
            this.vrow.add(quest)

        }


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
