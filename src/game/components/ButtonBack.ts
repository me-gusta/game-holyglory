import BaseNode from "$lib/BaseNode"
import { create_sprite } from "$lib/create_things"
import { Sprite } from "pixi.js"

export default class ButtonBack extends BaseNode {
    bg: Sprite
    constructor() {
        super()
        this.bg = create_sprite('button_back')
        this.addChild(this.bg)

        this.interactive = true
        this.cursor = 'pointer'
    }
}
