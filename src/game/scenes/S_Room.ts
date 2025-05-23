/* eslint-disable */
import BaseNode from '$lib/BaseNode'
import {
    DestroyOptions,
    Graphics,
    Sprite,
    Text,
    Ticker,
} from 'pixi.js'
import Dock from '../components/main/Dock'
import { create_graphics, create_sprite, create_text } from '$lib/create_things'
import colors from '../colors'
import microManage from '$lib/dev/microManage'
import { GlowFilter } from 'pixi-filters'
import Header from '../components/main/Header'


class ButtonStory extends BaseNode {
    bg: Sprite
    lbl: Text

    constructor() {
        super()
        this.bg = create_sprite(`main/ButtonStory`)
        this.lbl = create_text({
            text: 'Continue\nStory', style: {
                align: 'center',
                fill: colors.dark,
                stroke: { width: 4, color: '0xbbeafd' },
                fontSize: 64

            }
        })

        this.addChild(this.bg)
        this.addChild(this.lbl)
        // this.lbl.position.x = this.bg.width / 2
        // this.lbl.position.y = this.bg.height / 2

        this.interactive = true
        this.lbl.position.set(0, -20)
        this.bg.filters = [new GlowFilter({ distance: 5, outerStrength: 1, color: 0xbbeafd })]
    }
}



class ButtonDockSide extends BaseNode {
    icon: Sprite
    lbl: Text
    area: Graphics

    constructor(icon_name: string, lbl_text: string) {
        super()
        this.icon = create_sprite(icon_name)
        this.lbl = create_text({
            text: lbl_text, style: {
                align: 'center',
                fill: colors.bright,
                stroke: { width: 4, color: colors.dark },
                fontSize: 48

            }
        })



        this.addChild(this.icon)
        this.addChild(this.lbl)

        this.lbl.position.set(0, 89)

        this.area = create_graphics().rect(
            -this.width / 2, -this.height / 2, this.width, this.height
        ).fill('white')

        this.area.alpha = 0

        this.addChild(this.area)

        this.area.position.y += 30


        this.interactive = true
    }
}




export default class S_Room extends BaseNode {
    update_hook!: OmitThisParameter<any>
    dock = new Dock()
    button_story = new ButtonStory()
    button_spin = new ButtonDockSide(`icons/spin`, 'Daily Spin')
    button_reward = new ButtonDockSide(`icons/gift`, 'Free Gems')
    header = new Header()

    constructor() {
        super()
        console.log('mounted: room')
        this.addChild(this.dock)
        this.addChild(this.button_story)
        this.addChild(this.button_spin)
        this.addChild(this.button_reward)
        this.addChild(this.header)
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


        // dock
        this.dock.bw = this.bw
        this.dock.resize()
        this.dock.position.x = -this.bw / 2
        this.dock.position.y = this.bh / 2 - this.dock.height

        // header
        this.header.bw = this.bw
        this.header.resize()
        this.header.position.x = -this.bw / 2
        this.header.position.y = - this.bh / 2 

        // button_story
        this.button_story.scale.set(
            (this.bw / 2.2) / (this.button_story.width / this.button_story.scale.x)
        )
        this.button_story.position.y = (this.bh / 2) - (this.dock.height * 0.9)

        // button_spin
        this.button_spin.scale.set(
            (this.bw / 5) / (this.button_spin.width / this.button_spin.scale.x)
        )
        this.button_spin.position.x = (- this.bw + this.button_spin.width) / 2 + this.bw / 30
        this.button_spin.position.y = (this.bh / 2) - (this.dock.height * 0.96)


        // button_reward
        this.button_reward.scale.set(
            (this.bw / 5) / (this.button_reward.width / this.button_reward.scale.x)
        )
        this.button_reward.position.x = (this.bw - this.button_reward.width) / 2 - this.bw / 30
        this.button_reward.position.y = (this.bh / 2) - (this.dock.height * 0.96)

    }
}
