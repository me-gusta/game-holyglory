import BaseNode from "$lib/BaseNode"
import { create_graphics, create_vector } from "$lib/create_things"
import { Container, FederatedPointerEvent, Sprite, Text } from "pixi.js"
import make_draggable from "$lib/make_draggable"
import { rad2sector } from "$lib/math"
import { Easing } from "@tweenjs/tween.js"


export default class VRow extends BaseNode {
    container = new Container<BaseNode>()
    container_height = 0

    gap = 10
    msk = create_graphics().rect(0, 0, 500, 500).fill('white')
    area = create_graphics().rect(0, 0, 500, 500).fill('white')
    constructor() {
        super()

        this.addChild(this.area)
        this.addChild(this.container)
        this.addChild(this.msk)

        this.area.alpha = 0

        make_draggable(this)


        this.container.mask = this.msk


        this.on('dragstart', (event: FederatedPointerEvent) => {
            const max_offset = this.container_height - this.bh
            if (max_offset < 0) return
            prev_postion.x = 0
            prev_postion.y = 0

            // console.log('dragstart')
            event.stopPropagation()

            this.container.interactiveChildren = false
        })

        let prev_postion = create_vector()

        this.on('dragmove', (event: FederatedPointerEvent) => {
            const max_offset = this.container_height - this.bh
            if (max_offset < 0) return

            const max_overflow = 50
            
            if (prev_postion.x === 0 && prev_postion.y === 0) prev_postion.copyFrom(event.global)

            const v_diff = prev_postion.copy().subtract(event.global)
            const l_diff = v_diff.length

            const angle = v_diff.angle()

            const sector = rad2sector(angle)

            if ([2, 4].includes(sector)) {
                this.container.position.y += 2 === sector ? l_diff : -l_diff

                if (this.container.position.y < -max_offset - max_overflow) this.container.position.y = -max_offset - max_overflow
                if (this.container.position.y > max_overflow) this.container.position.y = max_overflow
            }

            prev_postion.copyFrom(event.global)

        })

        this.on('dragend', (event) => {
            const max_offset = this.container_height - this.bh
            if (max_offset < 0) return
            const padding_bottom = 20

            prev_postion.x = 0
            prev_postion.y = 0

            // console.log('dragend')
            if (this.container.position.y < -max_offset) {
                this.tween(this.container)
                    .to({ y: -max_offset - padding_bottom }, 200)
                    .easing(Easing.Quadratic.Out)
                    .start()
            }

            if (this.container.position.y > 0) {
                this.tween(this.container)
                    .to({ y: 0 }, 200)
                    .easing(Easing.Quadratic.Out)
                    .start()
            }

            this.container.interactiveChildren = true
        })
    }

    add(obj: BaseNode) {
        this.container.addChild(obj)
    }

    resize() {
        this.container_height = 0

        const children = this.container.children
        for (let el of children) {
            el.bw = this.bw
            el.resize()
        }

        for (let i = 0; i < children.length; i++) {
            const el: BaseNode = this.container.getChildAt(i)!
            if (i === 0) {
                el.position.y = el.height / 2
                this.container_height += el.height
                continue
            }
            const prev: BaseNode = this.container.getChildAt(i - 1)!

            el.position.y = prev.position.y + prev.height / 2 + el.height / 2 + this.gap
            this.container_height += this.gap + el.height
        }

        this.msk
            .clear()
            .rect(0, 0, this.bw, this.bh).fill('white')
        this.msk.position.x = - this.bw / 2


        this.area
            .clear()
            .rect(0, 0, this.bw, this.bh).fill('white')
        this.area.position.x = - this.bw / 2
    }
}
