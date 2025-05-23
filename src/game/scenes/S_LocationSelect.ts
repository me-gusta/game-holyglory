import BaseNode from "$lib/BaseNode"
import { DestroyOptions, Ticker } from "pixi.js"


export default class S_LocationSelect extends BaseNode {

    constructor() {
        super()
    }

    start() {
    }


    resize() {
        super.resize()
        this.bw = window.screen_size.width
        this.bh = window.screen_size.height


    }
}
