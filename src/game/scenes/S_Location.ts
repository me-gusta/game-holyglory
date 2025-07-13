import BaseNode from "$lib/BaseNode"
import { Container, DestroyOptions, Sprite, Text, Texture, Ticker } from "pixi.js"
import VRowScrollable from "../components/VRowScrollable.ts"
import { create_sprite, create_text } from "$lib/create_things"
import colors from "../colors"
import microManage from "$lib/dev/microManage"
import ButtonBack from "../components/ButtonBack"
import WoodenHeader from "../components/WoodenHeader"
import store, {Battle} from "$src/game/data/store"
import { chunk, push_until } from "$lib/utility"
import {random_int} from '$lib/random.ts'


class MapMarker extends BaseNode {
    icon: Sprite

    constructor() {
        super()
        this.icon = create_sprite('icons/marker')

        this.addChild(this.icon)
    }
}

type BattleWithId = Battle & {
    eid: number
}

class MapPoint extends BaseNode {
    bg: Sprite
    lbl: Text
    n: number
    marker: MapMarker

    constructor(n: number, isActive = false) {
        super()
        this.n = n

        this.bg = create_sprite('map/pin')

        this.lbl = create_text({
            text: n, style: {
                fill: colors.bright,
                fontSize: 62,
                stroke: { width: 6, color: colors.dark },
            }
        })

        this.marker = new MapMarker()

        this.addChild(this.bg)
        this.addChild(this.lbl)
        this.addChild(this.marker)
        this.lbl.y = -7

        this.marker.y = -75

        this.set_marker(false)
        this.set_active(isActive)

    }

    set_marker(enable: boolean) {
        this.marker.visible = enable
        if (enable) {
            this.interactive = true
            this.cursor = 'pointer'
        } else {
            this.interactive = false
            this.cursor = 'default'
        }
    }

    set_active(enable: boolean) {
        if (enable) {
            this.bg.texture = Texture.from('map/pin_active')
            this.interactive = true
            this.cursor = 'pointer'
        } else {
            this.bg.texture = Texture.from('map/pin')
            this.interactive = false
            this.cursor = 'default'
        }
    }
}

class MapPiece extends BaseNode {
    bg: Sprite
    container: Container
    constructor(tile_label: string, n: number, es: (BattleWithId|null)[], location_title) {
        super()
        this.bg = create_sprite(tile_label + n)
        this.container = new Container()

        this.addChild(this.bg)
        this.addChild(this.container)

        for (let i = 0; i < es.length; i++) {
            const e = es[i]


            if (!e) continue

            const pn = e.eid + 1
            const pin = new MapPoint(pn, e.is_captured)
            this.addChild(pin)

            if (e.eid === 0 && !e.is_captured) {
                pin.set_marker(true)
            }

            if (i === 0) {
                pin.position.set(-48, 272)
            }
            if (i === 1) {
                pin.position.set(-38, 16)
            }
            if (i === 2) {
                pin.position.set(-32, -224)
            }

            const all_captured = store
                .location_list
                .find(loc => loc.title === location_title)!
                .battles
                .filter(b => b.is_captured)

            const prev_eid = all_captured.length + 1

            if (prev_eid - e.eid === 1) {
                pin.set_marker(true)
            }

            pin.on('pointerup', () => {
                store.current_battle = e.eid
                this.trigger('set_scene', 'battle')
            })
        }
    }

    resize() {
        const s = this.bw / (this.bg.width / this.bg.scale.x)
        this.scale.set(s)
    }
}

export default class S_Location extends BaseNode {
    header: WoodenHeader
    vrow = new VRowScrollable()
    button_back = new ButtonBack()

    constructor() {
        super()

        const e_location = store.location_list[store.current_location]
        const { title, tile_images_folder } = e_location
        this.header = new WoodenHeader(title)

        const battles = e_location.battles
            .map((el, i)=> ({...el, eid: i}))

        const pieces = chunk(Object.values(battles), 3)
        for (let es of pieces.reverse()) {
            push_until(es, null, 3)

            const tile = new MapPiece(tile_images_folder, random_int(1, 3), es, e_location.title)

            this.vrow.add(tile)
        }

        this.vrow.gap = 0
        this.vrow.padding_bottom = 0

        this.addChild(this.vrow)
        this.addChild(this.button_back)
        this.addChild(this.header)

        this.button_back.on('pointerup', () => this.trigger('set_scene', 'location_select'))

    }

    start() {
        this.vrow.scroll_to_bottom()
    }

    resize() {
        super.resize()
        this.bw = window.screen_size.width
        this.bh = window.screen_size.height

        // vrow
        this.vrow.bw = this.bw
        this.vrow.bh = this.bh
        this.vrow.resize()
        this.vrow.position.y = -this.bh / 2


        // button_back
        this.button_back.scale.set(
            (this.bw / 10) / (this.button_back.width / this.button_back.scale.x)
        )
        this.button_back.position.x = -this.bw / 2 + this.button_back.width / 2 + this.bw * 0.02
        this.button_back.position.y = this.bh / 2 - this.button_back.height / 2 - this.bw * 0.02

        // header
        this.header.bw = this.bw * 0.75
        this.header.resize()
        this.header.position.y = -this.bh / 2 + this.header.height / 2 + this.bh * 0.01
    }
}
