import BaseNode from '$lib/BaseNode.ts'
import {Sprite, Text} from 'pixi.js'
import {create_graphics, create_sprite, create_text} from '$lib/create_things.ts'
import colors from '$src/game/colors.ts'

export default class Item extends BaseNode {
    icon: Sprite
    lbl: Text
    cover = create_graphics()

    constructor(icon_image: string, amount: number) {
        super()
        this.icon = create_sprite(icon_image)
        this.lbl = create_text({
            text: 'x' + amount,
            style: {fontSize: 82, fill: colors.dark, stroke: {width: 17, color: colors.bright}},
        })
        this.lbl.anchor.x = 1

        this.addChild(this.icon)
        this.addChild(this.lbl)
        this.addChild(this.cover)
    }

    resize(): void {
        this.cover.clear()
            .rect(
                -this.bw / 2,
                -this.bh / 2,
                this.bw,
                this.bh,
            )
            // .fill({color: 0x3e1ea5, alpha: 0.3})

        this.icon.scale.set(
            (this.bw * 0.9) / (this.icon.width / this.icon.scale.x),
        )

        if (this.lbl.text.length > 4) {
            this.lbl.scale.set(
                (this.bw * 0.8) / (this.lbl.width / this.lbl.scale.x),
            )
        } else {
            this.lbl.scale.set(
                (this.bh * 0.4) / (this.lbl.height / this.lbl.scale.y),
            )
        }

        this.lbl.position.x = this.bw / 2 - this.bw * 0.02
        this.lbl.position.y = this.bh / 2 - this.lbl.height / 2 - this.bw * 0.02
    }
}
