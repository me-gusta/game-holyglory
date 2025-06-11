import BaseNode from "$lib/BaseNode"
import { create_graphics, create_sprite, create_text } from "$lib/create_things"
import colors from "$src/game/colors"
import { Graphics, Sprite, Text } from "pixi.js"
import ButtonSettings from "./ButtonSettings"

class Stat extends BaseNode {
    bg: Sprite
    icon: Sprite
    lbl: Text

    constructor(icon_name: string) {
        super()
        this.bg = create_sprite('main/statbg')
        this.icon = create_sprite(icon_name)
        this.lbl = create_text({
            text: 1000, style: {
                fill: colors.bright,
                fontSize: 36,
                stroke: { width: 2, color: colors.dark },
                // align: 'right'
            }
        })

        this.lbl.anchor.x = 1
        this.lbl.position.y = -3
        this.lbl.position.x = this.bg.width / 2 - 10

        this.addChild(this.bg)
        this.addChild(this.icon)
        this.addChild(this.lbl)

        this.icon.scale.set(0.6)
        this.icon.position.x = -this.bg.width / 2 + 30
    }
}


export default class HeaderTop extends BaseNode {
    bg = create_sprite('main/header_top')
    stat_coins = new Stat('icons/coin')
    stat_gems = new Stat('icons/gem')
    stat_energy = new Stat('icons/energy')
    button_settings = new ButtonSettings()

    constructor() {
        super()
        this.bg.anchor.set(0)

        this.addChild(this.bg)
        this.addChild(this.stat_coins)
        this.addChild(this.stat_gems)
        this.addChild(this.stat_energy)

        this.stat_coins.scale.set(1.2)
        this.stat_gems.scale.set(1.2)
        this.stat_energy.scale.set(1.2)


        this.addChild(this.button_settings)

    }

    resize(): void {
        super.resize()

        const s = this.bw / (this.bg.width / this.bg.scale.x)
        // this.bg.scale.set(s)

        this.bh = (this.bg.height)

        this.scale.set(s)

        // stat_coins
        this.stat_coins.position.x = this.stat_coins.width / 2 + 10
        this.stat_coins.position.y = this.stat_coins.height / 2 + 10

        // stat_gems
        this.stat_gems.position.x = this.stat_coins.position.x + this.stat_coins.width + 10
        this.stat_gems.position.y = this.stat_gems.height / 2 + 10

        // stat_energy
        this.stat_energy.position.x = this.stat_gems.position.x + this.stat_gems.width + 10
        this.stat_energy.position.y = this.stat_energy.height / 2 + 10

        // button_settings
        this.button_settings.position.x = this.bg.width - this.button_settings.width / 2
        this.button_settings.position.y = this.button_settings.width / 2

    }
}