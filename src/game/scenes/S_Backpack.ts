import BaseNode from "$lib/BaseNode"
import {create_graphics, create_point, create_sprite, create_text, create_vector} from "$lib/create_things"
import {Container, FederatedPointerEvent, Sprite, Text, Texture, TilingSprite} from "pixi.js"
import colors from "../colors"
import WoodenHeader from "../components/WoodenHeader"
import VRow from "../components/VRow"
import ButtonBack from "../components/ButtonBack"
import store from "$lib/store"
import Item from '$src/game/components/Item.ts'
import DockSmall from '$src/game/components/DockSmall.ts'
import Grid from '$src/game/components/Grid.ts'
import make_draggable from '$lib/make_draggable.ts'

type Hero = {
    label: string
}

type Spell = {
    label: string
    is_unlocked: boolean
}

class GI_Hero extends BaseNode {
    bg: Sprite

    constructor(e: Hero) {
        super()
        this.bg = create_sprite(`character_icons/${e.label}`)
        this.bg.anchor.set(0)
        this.addChild(this.bg)
    }

    resize() {
        super.resize();
        this.bg.scale.set(
            (this.bw) / (this.bg.width / this.bg.scale.x),
        )
    }
}

class GI_Spell extends BaseNode {
    container = new Container()
    bg: Sprite = create_sprite('square')
    border: Sprite = create_sprite('square_border')
    spell: Sprite
    msk = create_graphics()
    lbl = create_text({
        text: '?',
        style: {
            fill: colors.bright,
            fontSize: 138,
            stroke: {color: colors.dark, width: 8},
        },
    })

    constructor(e: Spell) {
        super()
        this.spell = create_sprite(`spells/${e.label}`)
        this.bg.anchor.set(0)
        this.spell.anchor.set(0)
        this.border.anchor.set(0)
        this.addChild(this.container)
        this.container.addChild(this.bg)
        this.container.addChild(this.spell)
        this.container.addChild(this.msk)
        this.container.addChild(this.border)
        this.container.addChild(this.lbl)
        this.spell.mask = this.msk

        if (e.is_unlocked) {
            this.lbl.visible = false
        } else {
            this.spell.alpha = 0.05
        }
        // this.spell.alpha = 0.4
    }

    resize() {
        this.msk
            .clear()
            .roundRect(0, 0, this.bg.width, this.bg.height, 35)
            .fill(0xe3a043)
        this.spell.scale.set(
            (this.bg.width) / (this.spell.width / this.spell.scale.x),
        )

        this.lbl.position.x = this.bg.width / 2
        this.lbl.position.y = this.bg.height / 2

        this.container.scale.set(
            (this.bw) / (this.container.width / this.container.scale.x),
        )
    }
}

class ScrollableContainer extends BaseNode {
    container = new Container()
    msk = create_graphics()
    toucharea = create_graphics()

    constructor() {
        super()

        this.addChild(this.toucharea)
        this.addChild(this.container)
        this.addChild(this.msk)

        make_draggable(this)

        this.on('dragstart', () => {
            console.log('dragstart')
        })

        this.on('dragend', () => {
            console.log('dragend')
        })
        this.toucharea.alpha = 0
    }

    add(node: BaseNode) {
        this.container.addChild(node)
    }

    resize() {
        this.msk
            .clear()
            .rect(0, 0, this.bw, this.bh)
            .fill(0xe29932)
        this.msk.position.x = -this.bw / 2

        this.mask = this.msk


        this.toucharea
            .clear()
            .rect(0, 0, this.bw, this.bh)
            .fill(0xe29932)
        this.toucharea.position.x = -this.bw / 2
    }
}

export default class S_Backpack extends BaseNode {
    bg: TilingSprite
    scrollable = new ScrollableContainer()
    header1 = new WoodenHeader('Heroes')
    header2 = new WoodenHeader('Spells')
    grid_heroes = new Grid(3)
    grid_spells = new Grid(4)
    dock = new DockSmall()

    constructor() {
        super()
        this.bg = new TilingSprite({texture: Texture.from('seamlessbg')})
        this.addChild(this.bg)
        this.addChild(this.scrollable)
        // this.addChild(this.dock)

        this.scrollable.addChild(this.header1)
        this.scrollable.addChild(this.header2)
        this.scrollable.addChild(this.grid_heroes)
        this.scrollable.addChild(this.grid_spells)

        this.grid_heroes.gap = 10
        this.grid_spells.gap = 10

        const heroes = [
            {
                label: 'maximus',
            },
        ]
        for (let hero of heroes) {
            this.grid_heroes.add(new GI_Hero(hero))
            this.grid_heroes.add(new GI_Hero(hero))
            this.grid_heroes.add(new GI_Hero(hero))
            this.grid_heroes.add(new GI_Hero(hero))
            this.grid_heroes.add(new GI_Hero(hero))
            this.grid_heroes.add(new GI_Hero(hero))
            this.grid_heroes.add(new GI_Hero(hero))
            this.grid_heroes.add(new GI_Hero(hero))
            this.grid_heroes.add(new GI_Hero(hero))
            this.grid_heroes.add(new GI_Hero(hero))
        }

        const spells = [
            {label: "sun_sneeze", is_unlocked: true},
            {label: "sun_sneeze", is_unlocked: false},
        ]

        for (let e of spells) {
            this.grid_spells.add(new GI_Spell(e))
            this.grid_spells.add(new GI_Spell(e))
            this.grid_spells.add(new GI_Spell(e))
            this.grid_spells.add(new GI_Spell(e))
            this.grid_spells.add(new GI_Spell(e))
            this.grid_spells.add(new GI_Spell(e))
            this.grid_spells.add(new GI_Spell(e))
        }

        this.dock.button2.setActive()

    }

    start() {
    }


    resize() {
        super.resize()
        this.bw = window.screen_size.width
        this.bh = window.screen_size.height

        // header1
        this.header1.bw = this.bw * 0.75
        this.header1.resize()
        this.header1.position.y = this.header1.height / 2 + this.bh * 0.01

        // grid_heroes
        this.grid_heroes.bw = this.bw * 0.9
        this.grid_heroes.position.x = -this.grid_heroes.bw / 2
        this.grid_heroes.position.y = this.header1.position.y + this.header1.height / 2 + 10
        this.grid_heroes.resize()

        // header2
        this.header2.bw = this.bw * 0.75
        this.header2.resize()
        this.header2.position.y = this.grid_heroes.position.y + this.grid_heroes.height + this.header2.height / 2 + 40


        // grid_spells
        this.grid_spells.bw = this.bw * 0.9
        this.grid_spells.position.x = -this.grid_spells.bw / 2
        this.grid_spells.position.y = this.header2.position.y + this.header2.height / 2 + 10
        this.grid_spells.resize()

        // scrollable
        this.scrollable.bw = this.bw
        this.scrollable.bh = this.bh * 0.85
        this.scrollable.resize()
        this.scrollable.y = -this.bh / 2

        // bg
        this.bg.width = this.bw
        this.bg.height = this.bh

        this.bg.position.x = -this.bw / 2
        this.bg.position.y = -this.bh / 2

        const bg_scale = (this.bw / 256) / 5
        this.bg.tileScale.set(bg_scale)

        // dock
        this.dock.bw = this.bw
        this.dock.resize()
        this.dock.position.x = -this.bw / 2
        this.dock.position.y = this.bh / 2 - this.dock.height
    }
}
