import BaseNode from "$lib/BaseNode"
import { create_graphics, create_sprite } from "$lib/create_things"
import { Graphics, Sprite } from "pixi.js"

export default class ButtonSettings extends BaseNode {
    icon: Sprite
    area: Graphics
    constructor() {
        super()
        this.icon = create_sprite('icons/gear')
        this.icon.scale.set(0.6)
        const offset = 40
        this.area = create_graphics().rect(
            -this.icon.width / 2 - offset / 2,
            -this.icon.height / 2 - offset / 2,
            this.icon.width + offset,
            this.icon.height + offset,
        ).fill('white')

        this.icon.alpha = 0.5
        this.area.alpha = 0

        this.addChild(this.icon)
        this.addChild(this.area)
        this.interactive = true
    }
}