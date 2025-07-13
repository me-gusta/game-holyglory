import BaseNode from "$lib/BaseNode"
import {Container, DestroyOptions, Text, Texture, Ticker, TilingSprite} from "pixi.js"
import HeaderTop from '$src/game/components/HeaderTop.ts'
import WoodenHeader from '$src/game/components/WoodenHeader.ts'
import {create_sprite, create_text} from '$lib/create_things.ts'
import {Easing} from '@tweenjs/tween.js'
import colors from '$src/game/colors.ts'

class Slides extends BaseNode {
    imgs = [
        'comix/ru/1',
        'comix/ru/2',
        'comix/ru/3',
        'comix/ru/4',
        'comix/ru/5',
    ]
    slide_n = 0

    container = new Container()
    constructor() {
        super()

        for (let img of this.imgs) {
            const s = create_sprite(img)
            this.container.addChild(s)
            s.alpha = 0
        }

        this.container.children[0].alpha = 1

        this.addChild(this.container)
    }

    next_slide() {
        if (this.slide_n >= this.imgs.length -1) return

        const a = this.container.children[this.slide_n]
        const b = this.container.children[this.slide_n+1]

        this.slide_n ++

        this.tween(b)
            .to({alpha: 1}, 300)
            .easing(Easing.Linear.None)
            .start()
    }

    isOver() {
        return this.slide_n >= this.imgs.length - 1
    }

    resize() {
        super.resize();

        this.container.scale.set(
            (this.bw * 0.9) / (this.container.width / this.container.scale.x)
        )
    }
}


export default class S_Story extends BaseNode {
    bg: TilingSprite
    header_top = new HeaderTop()
    header: WoodenHeader
    update_hook!: OmitThisParameter<any>
    slides = new Slides()
    description: Text

    constructor() {
        super()
        this.bg = new TilingSprite({texture: Texture.from('seamlessbg')})
        this.header  = new WoodenHeader('Story')
        this.description = create_text({
            text: `Tap anywhere to continue`,
            style: {
                wordWrap: true,
                fill: colors.dark,
                fontSize: 16,
            }
        })
        this.addChild(this.bg)
        this.addChild(this.header_top)
        this.addChild(this.header)
        this.addChild(this.slides)
        this.addChild(this.description)

        this.interactive = true
        this.on('pointerup', () => {
            if (this.slides.isOver()) {
                this.trigger('set_scene', 'main')
            }
            this.slides.next_slide()
        })
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

        // header_top
        this.header_top.bw = this.bw
        this.header_top.resize()
        this.header_top.position.x = -this.bw / 2
        this.header_top.position.y = -this.bh / 2

        // header
        this.header.bw = this.bw * 0.75
        this.header.resize()
        this.header.position.y = -this.bh / 2 + this.header.height / 2 + this.bh * 0.01 + this.header_top.height


        // slides
        this.slides.bw = this.bw
        this.slides.resize()

        // description
        this.description.style.wordWrapWidth = this.bw * 0.95
        this.description.position.y = this.slides.position.y + this.slides.height / 2 + this.description.height / 2


        // bg
        this.bg.width = this.bw
        this.bg.height = this.bh

        this.bg.position.x = -this.bw / 2
        this.bg.position.y = -this.bh / 2

        const bg_scale = (this.bw / 256) / 5
        this.bg.tileScale.set(bg_scale)
    }
}
