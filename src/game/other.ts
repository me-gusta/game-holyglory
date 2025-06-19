import {Reward} from "./data/store";
import {IPoint} from '$lib/Vector.ts'
import {Point} from 'pixi.js'
import {random_float, random_int} from '$lib/random.ts'
import {randomPointInCircle} from '$lib/utility.ts'
import {create_sprite} from '$lib/create_things.ts'
import {Easing} from '@tweenjs/tween.js'
import BaseNode from '$lib/BaseNode.ts'

export const get_reward_icon = (r: Reward) => {
    if (r.label === 'coins') return 'icons/coin'
    if (r.label === 'gems') return 'icons/gem'
    if (r.label === 'hero/maiden') return 'character_icons/maiden'
    throw new Error(`unknown reward: ${JSON.stringify(r)}`)
}
export const get_reward_text = (r: Reward) => {
    if (r.label === 'coins') return 'Coins'
    if (r.label === 'gems') return 'Gems'
    if (r.label === 'hero/maiden') return 'Pistol Maiden'
    throw new Error(`unknown reward: ${JSON.stringify(r)}`)
}

export const set_up_drop_items = (node: BaseNode, header_top: any) => {
    node.on('drop_items', (e: {label: string, global: IPoint, amount?: number[], radius?: number}) => {
        const p1 = node.toLocal(e.global)
        const icon_label = get_reward_icon({label: e.label, amount: 1})
        const amount_from = e.amount ? e.amount[0] : 8
        let amount_to: number

        if (e.amount) {
            if (e.amount.length > 1) amount_to = e.amount[1]
            else amount_to = amount_from
        } else amount_to = 15

        const radius = e.radius ? e.radius : 30

        let p2: Point
        if (e.label === 'coins') {
            p2 = node.toLocal(
                header_top.stat_coins.toGlobal(header_top.stat_coins.icon),
            )
        } else if (e.label === 'gems') {
            p2 = node.toLocal(
                header_top.stat_gems.toGlobal(header_top.stat_gems.icon),
            )
        } else {
            p2 = node.toLocal(
                header_top.stat_energy.toGlobal(header_top.stat_energy.icon),
            )
        }

        const coins = random_int(amount_from, amount_to)

        for (let i = 0; i < coins; i++) {
            const p1i = randomPointInCircle(p1, radius)
            const icon = create_sprite(icon_label)
            icon.position.copyFrom(p1i)
            node.addChild(icon)
            const scale = random_float(0.1, 0.3)
            icon.scale.set(0.1)

            node.tween(icon.scale)
                .to({x: scale, y: scale}, 200)
                .easing(Easing.Quadratic.Out)
                .start()

            node.tween(icon.position)
                .to(p2, 400 + i * 10)
                .easing(Easing.Quadratic.In)
                .delay(450 + i * 10)
                .start()
                .onComplete(() => {
                    icon.destroy()
                })

            node.tween(icon)
                .to({alpha: 0}, 130 + i * 10)
                .easing(Easing.Quadratic.In)
                .delay(750 + i * 10)
                .start()
        }
    })
}
