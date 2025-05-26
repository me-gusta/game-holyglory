import BaseNode from "$lib/BaseNode"
import { create_sprite } from "$lib/create_things"
import { Container, DestroyOptions, Sprite, Ticker } from "pixi.js"

class Pole extends BaseNode {
    border: Sprite
    tiles_arr: Sprite[][] = []
    tiles = new Container()

    constructor() {
        super()

        this.border = create_sprite('battle/poleborder')

        for (let x = 0; x < 7; x++) {
            const row = []
            for (let y = 0; y < 7; y++) {
                const s = create_sprite('battle/tile1')
                this.tiles.addChild(s)
                row.push(s)
            }
            this.tiles_arr.push(row)
        }

        this.addChild(this.border)
        this.addChild(this.tiles)
    }

    resize(): void {
        const s = this.bw / (this.border.width / this.border.scale.x)
        // this.bg.scale.set(s)

        this.bh = (this.border.height)

        this.scale.set(s)

        for (let x = 0; x < 7; x++) {
            for (let y = 0; y < 7; y++) {
                const s = this.tiles_arr[x][y]
                s.x = -this.border.width / 2 + 20 + (s.width / 2) + s.width * x
                s.y = -this.border.height / 2 + 87 + (s.height / 2) + s.height * y
            }
        }
    }
}


export default class S_Battle extends BaseNode {
    pole: Pole


    update_hook!: OmitThisParameter<any>

    constructor() {
        super()

        this.pole = new Pole()
        this.addChild(this.pole)
    }

    start() {
        this.update_hook = this.update.bind(this)
        window.app.ticker.add(this.update_hook)
    }

    update(ticker: Ticker) {
    }

    destroy(options?: DestroyOptions) {
        window.app.ticker.remove(this.update_hook)
        super.destroy(options)
    }

    resize() {
        super.resize()
        this.bw = window.screen_size.width
        this.bh = window.screen_size.height

        this.pole.bw = this.bw
        this.pole.resize()

    }
}
