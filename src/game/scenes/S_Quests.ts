import BaseNode from "$lib/BaseNode"
import { create_graphics, create_point, create_sprite, create_text, create_vector } from "$lib/create_things"
import { Container, FederatedPointerEvent, Sprite, Text, Texture, TilingSprite } from "pixi.js"
import colors from "../colors"
import WoodenHeader from "../components/WoodenHeader"
import VRowScrollable from "../components/VRowScrollable.ts"
import ButtonBack from "../components/ButtonBack"
import store, {Quest, save} from "$src/game/data/store"
import Item from '$src/game/components/Item.ts'
import {get_reward_icon} from "$src/game/other.ts";
import HeaderTop from "$src/game/components/HeaderTop.ts";
import {IPoint} from "$lib/Vector.ts";
import {random_float, random_int} from "$lib/random.ts";
import {randomPointInCircle} from "$lib/utility.ts";
import {Easing} from "@tweenjs/tween.js";
import awe from "$src/game/data/awe.ts";


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

    }

    set_completed() {
        this.bg.texture = Texture.from('button_card_on')
        this.lbl.text = 'Claim'
        this.interactive = true
        this.cursor = 'pointer'
    }
}

class CardQuest extends BaseNode {
    item: Item
    lbl: Text
    bg: Sprite
    button: ButtonQuest
    constructor(q: Quest, is_purple = false) {
        super()

        const { task, task_needed: amount_max, task_current: amount_current, reward } = q

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

        const percents = Math.floor(amount_current / amount_max * 100)
        const btn_text = percents + '%'
        this.button = new ButtonQuest(btn_text)

        this.addChild(this.bg)
        this.addChild(this.lbl)
        this.addChild(this.item)
        this.addChild(this.button)

        this.button.on('pointerup', () => {
            this.trigger('drop_coins', this.toGlobal(this.button))
            awe.add('stats.coins', reward.amount)
            q.is_claimed = true
            save()
        })

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
    header_top = new HeaderTop()
    header = new WoodenHeader('Quests')
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

        const quests = store.quest_list

        this.vrow.add(
            new CardQuest(
                {
                    task: 'complete_5',
                    task_needed: 5,
                    task_current: 1,
                    reward: {
                        label: 'gems',
                        amount: 10
                    },
                    is_claimed: false
                },
                true
            )
        )

        for (let e of quests) {
            this.vrow.add(new CardQuest(e))
        }

        this.button_back.on('pointerup', () => this.trigger('set_scene', 'main'))

        this.on('drop_coins', (global_pos: IPoint) => {
            const p1 = this.toLocal(global_pos)

            const p2 = this.toLocal(
                this.header_top.stat_coins.toGlobal(this.header_top.stat_coins.icon)
            )

            const coins = random_int(8, 15)

            for (let i =0; i < coins; i++) {
                const p1i = randomPointInCircle(p1, 30)
                const icon = create_sprite('icons/coin')
                icon.position.copyFrom(p1i)
                this.addChild(icon)
                const scale = random_float(0.1, 0.3)
                icon.scale.set(0.1)

                this.tween(icon.scale)
                    .to({x:scale, y:scale}, 200)
                    .easing(Easing.Quadratic.Out)
                    .start()

                this.tween(icon.position)
                    .to(p2, 400 + i * 10)
                    .easing(Easing.Quadratic.In)
                    .delay(450 + i * 10)
                    .start()
                    .onComplete(() => {
                        icon.destroy()
                    })

                this.tween(icon)
                    .to({alpha: 0}, 130 + i * 10)
                    .easing(Easing.Quadratic.In)
                    .delay(750 + i * 10)
                    .start()
            }
        })
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
