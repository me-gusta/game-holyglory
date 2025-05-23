import BaseNode from "$lib/BaseNode"
import { DestroyOptions, Ticker } from "pixi.js"


export default class NAME extends BaseNode {
    update_hook!: OmitThisParameter<any>

    constructor() {
        super()
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


    }
}
