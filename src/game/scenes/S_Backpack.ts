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
import {rad2sector} from '$lib/utility.ts'
import {Easing} from '@tweenjs/tween.js'
import ScrollableContainer from '$src/game/components/ScrollableContainer.ts'
import ModalHero from "$src/game/components/backpack/ModalHero.ts";
import {Hero, Spell} from "$src/game/types.ts";



class GI_Hero extends BaseNode {
    bg: Sprite
    selected = create_sprite('square_border_green')

    constructor(e: Hero) {
        super()
        const folder = e.is_unlocked ? 'character_icons' : 'character_icons_hidden'
        this.bg = create_sprite(`${folder}/${e.label}`)
        this.bg.anchor.set(0)
        this.selected.anchor.set(0)
        this.addChild(this.bg)
        this.addChild(this.selected)
        this.selected.visible = false

        this.interactive = true
        this.cursor = 'pointer'
    }

    resize() {
        super.resize();
        this.bg.scale.set(
            (this.bw) / (this.bg.width / this.bg.scale.x),
        )
        this.selected.scale.set(
            (this.bw) / (this.selected.width / this.selected.scale.x),
        )
    }

    setSelected(value: boolean) {
        this.selected.visible = value
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

class GI_SpellEquipped extends BaseNode {
    container = new Container()
    bg: Sprite = create_sprite('square')
    border: Sprite = create_sprite('square_border')
    spell: Sprite
    msk = create_graphics()
    icon = create_sprite('icons/xmark')
    lbl: Text

    constructor(e: Spell|null) {
        super()
        this.spell = e ? create_sprite(`spells/${e.label}`) : create_sprite()
        this.lbl = create_text({
            text: 'Nothing',
            style: {
                fill: colors.bright,
                fontSize: 48,
                stroke: {color: colors.dark, width: 8},
            },
        })

        this.bg.anchor.set(0)
        this.spell.anchor.set(0)
        this.border.anchor.set(0)

        this.addChild(this.container)
        this.container.addChild(this.bg)
        this.container.addChild(this.spell)
        this.container.addChild(this.msk)
        this.container.addChild(this.border)
        this.container.addChild(this.icon)
        this.container.addChild(this.lbl)
        this.spell.mask = this.msk

        if (!e) {
            this.icon.visible = false
        } else {
            this.lbl.visible = false
        }
    }

    resize() {
        this.msk
            .clear()
            .roundRect(0, 0, this.bg.width, this.bg.height, 35)
            .fill(0xe3a043)
        this.spell.scale.set(
            (this.bg.width) / (this.spell.width / this.spell.scale.x),
        )

        this.icon.scale.set(
            (this.bg.width * 0.15) / (this.icon.width / this.icon.scale.x),
        )
        this.icon.position.x = this.bg.width - this.icon.width / 2 - (this.bg.width * 0.1)
        this.icon.position.y = this.icon.height / 2 + (this.bg.width * 0.1)

        this.lbl.position.x = this.bg.width / 2
        this.lbl.position.y = this.bg.height / 2

        this.container.scale.set(
            (this.bw) / (this.container.width / this.container.scale.x),
        )

    }
}

export default class S_Backpack extends BaseNode {
    bg: TilingSprite
    scrollable = new ScrollableContainer()
    header1 = new WoodenHeader('Heroes')
    description1: Text
    header2 = new WoodenHeader('Spells')
    description2: Text
    grid_heroes = new Grid(3)
    description3: Text
    grid_spells_equipped = new Grid(3)
    grid_spells = new Grid(4)
    dock = new DockSmall()
    modal?: BaseNode

    constructor() {
        super()
        const text_style = {
            wordWrap: true,
            fill: colors.dark,
            fontSize: 12,
        }

        this.bg = new TilingSprite({texture: Texture.from('seamlessbg')})
        this.description1 = create_text({
            text: `Select a hero. New heroes can be found in adventures a bought in a shop.`,
            style: text_style
        })

        this.description2 = create_text({
            text: `You can equip up to 3 spells.`,
            style: text_style
        })


        this.description3 = create_text({
            text: `All available spells. Tap on each to find out more.`,
            style: text_style
        })

        this.addChild(this.bg)
        this.addChild(this.scrollable)
        this.addChild(this.dock)

        this.scrollable.add(this.header1)
        this.scrollable.add(this.description1)
        this.scrollable.add(this.header2)
        this.scrollable.add(this.description2)
        this.scrollable.add(this.grid_heroes)
        this.scrollable.add(this.description3)
        this.scrollable.add(this.grid_spells_equipped)
        this.scrollable.add(this.grid_spells)

        this.grid_heroes.gap = 10
        this.grid_spells.gap = 10
        this.grid_spells_equipped.gap = 5

        const heroes = [
            {label: 'maximus', is_unlocked: true},
            {label: 'leonard', is_unlocked: true},
            {label: 'eleodor', is_unlocked: true},
            {label: 'shrederella', is_unlocked: true},
            {label: 'goatberg', is_unlocked: true},
            {label: 'yaga', is_unlocked: true},
            {label: 'maiden', is_unlocked: false},
        ]
        for (let e of heroes) {
            const gi = new GI_Hero(e)
            this.grid_heroes.add(gi)

            gi.on('pointerup', () => {
                this.modal = new ModalHero(e)
                this.addChild(this.modal)
                this.modal.resize()
            })

            if (e.label === 'maximus') {
                this.set_timeout(300, () => {
                    this.modal = new ModalHero(e)
                    this.addChild(this.modal)
                    this.modal.resize()
                })
            }
        }

        const spells = [
            {label: "sun_sneeze", is_unlocked: true},
            {label: "booooooom", is_unlocked: true},
            {label: "call_batgoblin", is_unlocked: true},
            {label: "fairys_kiss", is_unlocked: true},
            {label: "fireball", is_unlocked: true},
            {label: "poseidons_party", is_unlocked: true},
            {label: "sun_sweat", is_unlocked: true},
            {label: "throw_the_fish", is_unlocked: true},
            {label: "time_juice", is_unlocked: true},
        ]

        for (let e of spells) {
            this.grid_spells.add(new GI_Spell(e))
        }

        const spells_equipped = [
            null,
            null,
            {label: "sun_sneeze", is_unlocked: true},
        ]

        for (let e of spells_equipped) {
            this.grid_spells_equipped.add(new GI_SpellEquipped(e))
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

        // description1
        this.description1.style.wordWrapWidth = this.bw * 0.95
        this.description1.position.y = this.header1.position.y + this.header1.height / 2 + this.description1.height / 2

        // grid_heroes
        this.grid_heroes.bw = this.bw * 0.9
        this.grid_heroes.position.x = -this.grid_heroes.bw / 2
        this.grid_heroes.position.y = this.description1.position.y + this.description1.height / 2 + 10
        this.grid_heroes.resize()

        // header2
        this.header2.bw = this.bw * 0.75
        this.header2.resize()
        this.header2.position.y = this.grid_heroes.position.y + this.grid_heroes.height + this.header2.height / 2 + 40

        // description2
        this.description2.style.wordWrapWidth = this.bw * 0.95
        this.description2.position.y = this.header2.position.y + this.header2.height / 2 + this.description2.height / 2

        // grid_spells_selected
        this.grid_spells_equipped.bw = this.bw * 0.9
        this.grid_spells_equipped.position.x = -this.grid_spells_equipped.bw / 2
        this.grid_spells_equipped.position.y = this.description2.position.y + this.description2.height / 2 + 10
        this.grid_spells_equipped.resize()

        // description3
        this.description3.style.wordWrapWidth = this.bw * 0.95
        this.description3.position.y = this.grid_spells_equipped.position.y + this.grid_spells_equipped.height + this.description3.height / 2 + 30

        // grid_spells
        this.grid_spells.bw = this.bw * 0.9
        this.grid_spells.position.x = -this.grid_spells.bw / 2
        this.grid_spells.position.y = this.description3.position.y + this.description3.height/2 + 10
        this.grid_spells.resize()


        // dock
        this.dock.bw = this.bw
        this.dock.resize()
        this.dock.position.x = -this.bw / 2
        this.dock.position.y = this.bh / 2 - this.dock.height

        // scrollable
        this.scrollable.bw = this.bw
        this.scrollable.bh = this.bh - this.dock.height
        this.scrollable.resize()
        this.scrollable.y = -this.bh / 2

        // bg
        this.bg.width = this.bw
        this.bg.height = this.bh

        this.bg.position.x = -this.bw / 2
        this.bg.position.y = -this.bh / 2

        const bg_scale = (this.bw / 256) / 5
        this.bg.tileScale.set(bg_scale)

    }
}
