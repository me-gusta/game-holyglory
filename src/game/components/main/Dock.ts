import BaseNode from "$lib/BaseNode";
import { create_sprite } from "$lib/create_things";
import colors from "$src/game/colors";
import { Sprite, Text } from "pixi.js";

class ButtonDock extends BaseNode {
    bg: Sprite
    bg_active: Sprite
    icon: Sprite
    isActive = true

    constructor(n: number, icon_name: string) {
        super()
        this.bg = create_sprite(`dock/button${n}`)
        this.bg_active = create_sprite(`dock/button${n}_active`)
        this.icon = create_sprite(icon_name)

        this.bg.anchor.set(0)
        this.bg_active.anchor.set(0)
        this.addChild(this.bg)
        this.addChild(this.bg_active)
        this.addChild(this.icon)
        this.icon.position.x = this.bg.width / 2
        this.icon.position.y = this.bg.height / 2

        this.bg_active.visible = false

        this.interactive = true
    }

    setActive() {
        this.isActive = true
        this.bg_active.visible = true
    }

    setInactive() {
        this.isActive = false
        this.bg_active.visible = false
    }

    toggleState() {

        if (this.isActive) this.setInactive()
        else this.setActive()
    }
}




export default class Dock extends BaseNode {
    bg = create_sprite('dock/dock')
    button1 = new ButtonDock(1, 'icons/cash')
    button2 = new ButtonDock(2, 'icons/backpack')
    button3 = new ButtonDock(3, 'icons/swords')
    button4 = new ButtonDock(4, 'icons/podium')
    button5 = new ButtonDock(5, 'icons/shield')

    constructor() {
        super()
        this.bg.anchor.set(0)

        this.addChild(this.bg)
        this.addChild(this.button1)
        this.addChild(this.button2)
        this.addChild(this.button3)
        this.addChild(this.button4)
        this.addChild(this.button5)
        this.button3.setActive()

        // this.button1.on('pointerup', () => this.button1.toggleState())
        // this.button2.on('pointerup', () => this.button2.toggleState())
        // this.button3.on('pointerup', () => this.button3.toggleState())
        // this.button4.on('pointerup', () => this.button4.toggleState())
        // this.button5.on('pointerup', () => this.button5.toggleState())
    }

    resize(): void {
        super.resize()

        const s = this.bw / (this.bg.width / this.bg.scale.x)
        // this.bg.scale.set(s)

        this.bh = (this.bg.height)

        // button1
        this.button1.position.x = 0
        this.button1.position.y = this.bh - this.button1.height
        this.button1.resize()


        // button2
        this.button2.position.x = 203
        this.button2.position.y = this.bh - this.button1.height
        this.button2.resize()

        // button3
        this.button3.position.x = 405
        this.button3.position.y = this.bh - this.button1.height
        this.button3.resize()

        // button4
        this.button4.position.x = 721
        this.button4.position.y = this.bh - this.button1.height
        this.button4.resize()

        // button5
        this.button5.position.x = this.bg.width - this.button5.width
        this.button5.position.y = this.bh - this.button1.height
        this.button5.resize()

        this.scale.set(s)
    }
}
