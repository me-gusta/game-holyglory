import BaseNode from "$lib/BaseNode"
import { create_graphics, create_vector } from "$lib/create_things"
import { Container, FederatedPointerEvent, Sprite, Text } from "pixi.js"
import make_draggable from "$lib/make_draggable"
import { rad2sector } from "$lib/utility"
import { Easing } from "@tweenjs/tween.js"


export default class VRow extends BaseNode {
    container = new Container<BaseNode>()
    gap = 10
    constructor() {
        super()

        this.addChild(this.container)
    }

    add(obj: BaseNode) {
        this.container.addChild(obj)
    }

    resize() {
        const children = this.container.children
        for (let el of children) {
            el.bw = this.bw
            el.resize()
        }

        for (let i = 0; i < children.length; i++) {
            const el: BaseNode = this.container.getChildAt(i)!
            if (i === 0) {
                el.position.y = el.height / 2
                continue
            }
            const prev: BaseNode = this.container.getChildAt(i - 1)!

            el.position.y = prev.position.y + prev.height / 2 + el.height / 2 + this.gap
        }
    }
}
