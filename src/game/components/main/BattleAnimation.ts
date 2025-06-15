import BaseNode from '$lib/BaseNode.ts'
import {create_sprite} from '$lib/create_things.ts'
import {Container, Texture, TilingSprite} from 'pixi.js'

export default class BattleAnimation extends BaseNode {
    bg: TilingSprite
    container = new Container()

    constructor() {
        super()
        const bg_texture = Texture.from('battle/bgs/hills')
        this.bg = new TilingSprite({texture: bg_texture})
        this.addChild(this.container)
        this.container.addChild(this.bg)
    }
}
