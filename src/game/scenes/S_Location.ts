import BaseNode from "$lib/BaseNode"
import { Container, DestroyOptions, Sprite, Text, Texture, Ticker } from "pixi.js"
import VRow from "../components/VRow"
import { create_sprite, create_text } from "$lib/create_things"
import colors from "../colors"
import microManage from "$lib/dev/microManage"
import ButtonBack from "../components/ButtonBack"
import WoodenHeader from "../components/WoodenHeader"


class MapMarker extends BaseNode {
    icon: Sprite

    constructor() {
        super()
        this.icon = create_sprite('icons/marker')

        this.addChild(this.icon)
    }
}

class MapPin extends BaseNode {
    bg: Sprite
    lbl: Text
    n: number
    marker: MapMarker

    constructor(n: number, isActive = false) {
        super()
        this.n = n

        this.bg = create_sprite('map/pin')

        this.lbl = create_text({text: n, style: {
            fill: colors.bright,
            fontSize: 62,
            stroke: {width: 6, color: colors.dark},
        }})

        this.marker = new MapMarker()

        this.addChild(this.bg)
        this.addChild(this.lbl)
        this.addChild(this.marker)
        this.lbl.y = -7

        this.marker.y = -75

        this.set_active(false)
        this.set_marker(false)
    }

    set_marker(enable: boolean) {
        this.marker.visible = enable
    }

    set_active(enable: boolean) {
        if (enable) {
            this.bg.texture = Texture.from('map/pin_active')
        } else {
            this.bg.texture = Texture.from('map/pin')
        }
    }
}

class MapPiece extends BaseNode {
    bg: Sprite
    container: Container
    constructor(tile_label: string, n: number, pin_ns: number[]) {
        super()
        this.bg = create_sprite(tile_label + n)
        this.container = new Container()

        this.addChild(this.bg)
        this.addChild(this.container)

        for (let i = 0; i < pin_ns.length; i++) {
            const pn = pin_ns[i]
            if (pn === -1 ) continue
            const pin = new MapPin(pn)
            this.addChild(pin)

            if (i === 0) {
                pin.position.set(-48, 272)
            }
            if (i === 1) {
                pin.position.set(-38, 16)
            }
            if (i === 2) {
                pin.position.set(-32, -224)
            }
            map_pins.set(pn, pin)
        }

    }

    resize() {
        const s = this.bw / (this.bg.width / this.bg.scale.x)
        this.scale.set(s)
    }
}

const map_pins = new Map<number, MapPin>()

type LocationContext = {
    title: string
    tile_label: string
}

export default class S_Location extends BaseNode {
    header: WoodenHeader
    vrow = new VRow()
    button_back = new ButtonBack()

    constructor() {
        super()
        const {title, tile_label} = {title: 'Hills', tile_label: 'map/hills'}
        this.header = new WoodenHeader(title)

        const tiles = [
            new MapPiece(tile_label, 1, [10,11,-1]),
            new MapPiece(tile_label, 3, [7,8,9]),
            new MapPiece(tile_label, 3, [4,5,6]),
            new MapPiece(tile_label, 2, [1,2,3]),
        ]

        for (let el of tiles) {
            this.vrow.add(el)
        }

        this.vrow.gap = 0
        this.vrow.padding_bottom = 0

        this.addChild(this.vrow)
        this.addChild(this.button_back)
        this.addChild(this.header)

    }

    start() {
        this.vrow.scroll_to_bottom()

        const current_pn = 3

        const current_pin = map_pins.get(current_pn)!

        current_pin.set_marker(true)

        map_pins.get(1)!.set_active(true)
        map_pins.get(2)!.set_active(true)
    }

    resize() {
        super.resize()
        this.bw = window.screen_size.width
        this.bh = window.screen_size.height

        // vrow
        this.vrow.bw = this.bw
        this.vrow.bh = this.bh
        this.vrow.resize()
        this.vrow.position.y = -this.bh/2

        
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
