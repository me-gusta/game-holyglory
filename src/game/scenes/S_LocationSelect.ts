import BaseNode from "$lib/BaseNode"
import { create_graphics, create_point, create_sprite, create_text, create_vector } from "$lib/create_things"
import { Container, FederatedPointerEvent, Sprite, Text, Texture, TilingSprite } from "pixi.js"
import colors from "../colors"
import WoodenHeader from "../components/WoodenHeader"
import VRow from "../components/VRow"
import ButtonBack from "../components/ButtonBack"
import store from "$lib/store"


class CardLocation extends BaseNode {
    icon: Sprite
    lbl: Text
    bg: Sprite
    constructor(bg_image: string, lbl_text: string, isUnlocked = false) {
        super()

        this.bg = create_sprite(bg_image)
        this.lbl = create_text({
            text: lbl_text, style: {
                fontSize: 64,
                fill: colors.bright,
                stroke: { width: 6, color: colors.dark }
            }
        })
        this.lbl.anchor.x = 1
        this.icon = create_sprite('icons/lock')

        this.interactive = true
        this.cursor = 'pointer'

        if (!isUnlocked) {
            this.bg = create_sprite(bg_image + '_disabled')
            this.lbl.alpha = 0
            
            this.interactive = false
            this.cursor = 'default'
        }

        this.addChild(this.bg)
        this.addChild(this.lbl)
        this.addChild(this.icon)

        this.icon.alpha = isUnlocked ?  0 : 0.7

        this.on('pointerup', () => {
            console.log('location selected')
        })
    }

    resize() {
        const s = this.bw / (this.bg.width / this.bg.scale.x)
        this.scale.set(s)

        this.lbl.position.x = this.bg.width / 2 - 20
        this.lbl.position.y = this.bg.height / 2 - 60
    }
}



export default class S_LocationSelect extends BaseNode {
    bg: TilingSprite
    header = new WoodenHeader('World')
    vrow = new VRow()
    button_back = new ButtonBack()

    constructor() {
        super()
        this.bg  = new TilingSprite({texture: Texture.from('seamlessbg')})
        this.addChild(this.bg)
        this.addChild(this.header)
        this.addChild(this.vrow)
        this.addChild(this.button_back)


        for (let e of Object.values(store.locations)) {
            const loc = new CardLocation(e.card_image, e.title, e.is_unlocked)
            this.vrow.add(
                loc
            )
            console.log(e.card_image, e.title, e.is_unlocked);

            loc.on('pointerup', () => {
                store.current_location = e.eid
                this.trigger('set_scene', 'location')
            })
        }

        
        this.button_back.on('pointerup', () => this.trigger('set_scene', 'main'))
    }

    start() {
    }


    resize() {
        super.resize()
        this.bw = window.screen_size.width
        this.bh = window.screen_size.height

        // header
        this.header.bw = this.bw * 0.75
        this.header.resize()
        this.header.position.y = -this.bh / 2 + this.header.height / 2 + this.bh * 0.01

        // vrow
        this.vrow.bw = this.bw * 0.9
        this.vrow.bh = this.bh - (this.header.height + this.bh * 0.04)
        this.vrow.resize()
        this.vrow.position.y = -this.bh / 2 + (this.bh - this.vrow.bh)

        // button_back
        this.button_back.scale.set(
            (this.bw / 10) / (this.button_back.width / this.button_back.scale.x)
        )
        this.button_back.position.x = -this.bw / 2 + this.button_back.width / 2 + this.bw * 0.02
        this.button_back.position.y = this.bh / 2 - this.button_back.height / 2 - this.bw * 0.02
        
        // bg
        this.bg.width = this.bw
        this.bg.height = this.bh

        this.bg.position.x = -this.bw/2
        this.bg.position.y = -this.bh/2

        const bg_scale = (this.bw/ 256) / 5
        this.bg.tileScale.set(bg_scale)

    }
}
