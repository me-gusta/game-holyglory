import BaseNode from '$lib/BaseNode.ts'
import {create_graphics} from '$lib/create_things.ts'
import {Container} from 'pixi.js'

export default class Grid extends BaseNode {
    cover = create_graphics()
    container = new Container<BaseNode>()
    wsize: number
    gap = 0

    constructor(wsize: number) {
        super()
        this.wsize = wsize

        this.addChild(this.cover)
        this.addChild(this.container)
    }

    add(node: BaseNode) {
        this.container.addChild(node)
    }

    resize(): void {
        // this.cover.clear().rect(0, 0, this.bw, this.bh).fill({ color: 0xe322f4, alpha: 0.3 })
        const w_for_items = this.bw - (this.wsize - 1) * this.gap
        const itemw = w_for_items / this.wsize

        for (let i = 0; i < this.container.children.length; i++) {
            const child = this.container.children[i]
            const rowi = Math.floor(i / this.wsize)
            const coli = i % this.wsize

            child.bw = itemw
            child.bh = itemw
            child.resize()
            child.position.x = (itemw + this.gap) * coli
            child.position.y = (itemw + this.gap) * rowi
        }
    }
}
