import BaseNode from "$lib/BaseNode"
import { create_graphics, create_point, create_sprite, create_text, create_vector } from "$lib/create_things"
import { Container, FederatedPointerEvent, Sprite, Text, Texture, TilingSprite } from "pixi.js"
import colors from "../colors"
import WoodenHeader from "../components/WoodenHeader"
import VRowScrollable from "../components/VRowScrollable.ts"
import ButtonBack from "../components/ButtonBack"
import store, {Quest, QuestPartner, save} from "$src/game/data/store"
import Item from '$src/game/components/Item.ts'
import HeaderTop from '$src/game/components/HeaderTop.ts'
import {get_reward_icon, set_up_drop_items} from '$src/game/other.ts'
import awe from '$src/game/data/awe.ts'

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
        this.interactive = true
        this.cursor = 'pointer'
    }

    set_claimed() {
        this.bg.texture = Texture.from('button_card')
        this.lbl.text = 'Claimed'
        this.interactive = false
        this.cursor = 'default'
    }
}

class CardQuest extends BaseNode {
    item: Item
    lbl: Text
    bg: Sprite
    button: ButtonQuest
    constructor(q: QuestPartner, is_purple = false) {
        super()

        const {task, link, reward} = q

        this.bg = create_sprite(is_purple ? 'card_small_purple' : 'card_small')
        this.lbl = create_text({
            text: task, style: {
                fontSize: 48,
                fill: colors.dark,
            }
        })
        this.lbl.anchor.x = 0

        const reward_icon = get_reward_icon(reward)
        this.item = new Item(reward_icon, reward.amount)


        const btn_text = 'GO'
        this.button = new ButtonQuest(btn_text)

        this.addChild(this.bg)
        this.addChild(this.lbl)
        this.addChild(this.item)
        this.addChild(this.button)

        this.button.on('pointerup', () => {
            if (q.is_visited) {
                this.trigger('drop_items', {label: q.reward.label, global: this.toGlobal(this.button)})
                this.button.set_claimed()
                this.set_timeout(500, () => {
                    if (q.reward.label === 'coins') awe.add('stats.coins', reward.amount)
                    if (q.reward.label === 'gems') awe.add('stats.gems', reward.amount)
                    if (q.reward.label === 'energy') awe.add('stats.energy', reward.amount)
                    q.is_claimed = true
                    save()
                })
            } else if (q.is_claimed) {
                return
            } else {
                window.open(link, '_blank')
                q.is_visited = true
                this.button.set_completed()
                save()
            }
        })

        if (q.is_claimed) {
            this.button.set_claimed()
        }
        if (q.is_visited) {
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



export default class S_FreeGems extends BaseNode {
    bg: TilingSprite
    header_top = new HeaderTop()
    header = new WoodenHeader('Special Quests')
    vrow = new VRowScrollable()
    button_back = new ButtonBack()

    constructor() {
        super()
        this.bg = new TilingSprite({ texture: Texture.from('seamlessbg') })
        this.addChild(this.bg)
        this.addChild(this.header_top)
        this.addChild(this.header)
        this.addChild(this.vrow)
        this.addChild(this.button_back)

        const quests = store.quest_partner_list
        for (let e of quests) {
            const quest = new CardQuest(e)
            this.vrow.add(quest)
        }
        this.button_back.on('pointerup', () => this.trigger('set_scene', 'main'))

        set_up_drop_items(this, this.header_top)
    }

    start() {
    }


    resize() {
        super.resize()
        this.bw = window.screen_size.width
        this.bh = window.screen_size.height

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
