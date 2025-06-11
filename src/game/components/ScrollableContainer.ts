import BaseNode from '$lib/BaseNode.ts'
import {Container, FederatedPointerEvent} from 'pixi.js'
import {create_graphics, create_vector} from '$lib/create_things.ts'
import make_draggable from '$lib/make_draggable.ts'
import {rad2sector} from '$lib/utility.ts'
import {Easing} from '@tweenjs/tween.js'

export default class ScrollableContainer extends BaseNode {
    container = new Container()
    msk = create_graphics()
    toucharea = create_graphics()
    container_height = 0
    padding_bottom = 20

    constructor() {
        super()

        this.addChild(this.toucharea)
        this.addChild(this.container)
        this.addChild(this.msk)

        make_draggable(this)

        this.toucharea.alpha = 0

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

            const v_diff = prev_postion.copy().substract(event.global)
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

            prev_postion.x = 0
            prev_postion.y = 0

            // console.log('dragend')
            if (this.container.position.y < -max_offset) {
                this.tween(this.container)
                    .to({ y: -max_offset - this.padding_bottom }, 200)
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

    add(node: Container<any>) {
        this.container.addChild(node)
    }

    resize() {
        this.msk
            .clear()
            .rect(0, 0, this.bw, this.bh)
            .fill(0xe29932)
        this.msk.position.x = -this.bw / 2

        this.toucharea
            .clear()
            .rect(0, 0, this.bw, this.bh)
            .fill(0xe29932)
        this.toucharea.position.x = -this.bw / 2

        this.container.mask = null
        this.container_height = this.container.height
        this.container.mask = this.msk
    }
}
