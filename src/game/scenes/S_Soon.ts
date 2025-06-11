import BaseNode from "$lib/BaseNode.ts"
import {create_graphics, create_point, create_sprite, create_text, create_vector} from "$lib/create_things.ts"
import {Container, FederatedPointerEvent, Sprite, Text, Texture, TilingSprite} from "pixi.js"
import store from "$lib/store.ts"
import Item from '$src/game/components/Item.ts'
import HeaderTop from "$src/game/components/HeaderTop.ts";
import DockSmall from "$src/game/components/DockSmall.ts";
import ScrollableContainer from "$src/game/components/ScrollableContainer.ts";
import VRow from "$src/game/components/VRow.ts";
import {BuyPack} from "$src/game/types.ts";
import colors from "$src/game/colors.ts";

class Scroll extends BaseNode {
    bg = create_sprite('scroll')
    lbl1: Text
    lbl2: Text
    constructor() {
        super();
        this.lbl1 = create_text({
            text: `King's Edict\nof Temporary Disappointment`,
            style: {fill: colors.dark, fontSize: 55, align: 'center'}
        })

        this.lbl2 = create_text({
            text: `Brave adventurer! The wondrous feature you seek is still under development.\n\n`
                + `If you want to help speed things up, we'd love your support—drop feedback,`
                + `send some gold, or share on social media.`,
            style: {fill: colors.dark, fontSize: 38, wordWrap: true, wordWrapWidth: 100}
        })

        this.addChild(this.bg)
        this.addChild(this.lbl1)
        this.addChild(this.lbl2)
    }

    resize() {
        super.resize();
        this.lbl1.position.y = -this.bg.height / 2 + this.lbl1.height/2 + 250
        this.lbl1.position.x = -20

        this.lbl2.style.wordWrapWidth = this.bg.width - 280
        this.lbl2.position.x = -10
    }
}


export default class S_Soon extends BaseNode {
    bg: TilingSprite
    scroll = new Scroll()
    header = new HeaderTop()
    dock = new DockSmall()


    constructor() {
        super()
        this.bg = new TilingSprite({texture: Texture.from('seamlessbg')})

        this.addChild(this.bg)
        this.addChild(this.scroll)
        this.addChild(this.header)
        this.addChild(this.dock)
        if (store.soon_triggered === 'town') {
            this.dock.button4.setActive()
        }
        if (store.soon_triggered === 'guild') {
            this.dock.button5.setActive()
        }

        this.dock.button1.on('pointerup', () => {
            this.trigger('set_scene', 'shop')
        })

        this.dock.button2.on('pointerup', () => {
            this.trigger('set_scene', 'backpack')
        })

        this.dock.button3.on('pointerup', () => {
            this.trigger('set_scene', 'main')
        })
        this.dock.button4.on('pointerup', () => {
            store.soon_triggered = 'town'
            this.trigger('set_scene', 'soon')
        })
        this.dock.button5.on('pointerup', () => {
            store.soon_triggered = 'guild'
            this.trigger('set_scene', 'soon')
        })
    }

    start() {}

    resize() {
        super.resize()
        this.bw = window.screen_size.width
        this.bh = window.screen_size.height

        // bg
        this.bg.width = this.bw
        this.bg.height = this.bh

        this.bg.position.x = -this.bw / 2
        this.bg.position.y = -this.bh / 2

        const bg_scale = (this.bw / 256) / 5
        this.bg.tileScale.set(bg_scale)

        // scroll
        this.scroll.scale.set(
            this.bw / (this.scroll.width / this.scroll.scale.x)
        )
        this.scroll.resize()
        this.scroll.position.y = -20

        // header
        this.header.bw = this.bw
        this.header.resize()
        this.header.position.x = -this.bw / 2
        this.header.position.y = -this.bh / 2

        // dock
        this.dock.bw = this.bw
        this.dock.resize()
        this.dock.position.x = -this.bw / 2
        this.dock.position.y = this.bh / 2 - this.dock.height

    }
}
