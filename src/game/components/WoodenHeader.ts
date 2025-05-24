import BaseNode from "$lib/BaseNode";
import { create_sprite, create_text } from "$lib/create_things";
import { Sprite, Text } from "pixi.js";
import colors from "../colors";


export default class WoodenHeader extends BaseNode {
    bg: Sprite;
    lbl: Text
    constructor(text: string) {
        super()

        this.bg = create_sprite('wooden_header')
        this.lbl = create_text({
            text: text, style: {
                fontSize: 86,
                fill: colors.bright,
                stroke: {width: 6, color: colors.dark}
            }
        })

        this.addChild(this.bg)
        this.addChild(this.lbl)
    }

    
    resize() {
        const s = this.bw / (this.bg.width / this.bg.scale.x)

        this.scale.set(s)
    }
}