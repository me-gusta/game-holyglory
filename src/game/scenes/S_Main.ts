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
import store from "$src/game/data/store.ts";
import BattleAnimation from '$src/game/components/main/BattleAnimation.ts'


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
        this.cursor = 'pointer'
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
        this.cursor = 'pointer'
    }
}

class ButtonSummon extends BaseNode {
    bg: Sprite
    lbl: Text

    constructor() {
        super()
        this.bg = create_sprite('main/ButtonSummon')
        this.lbl = create_text({
            text: 'Summon', style: {
                align: 'center',
                fill: colors.dark,
                stroke: { width: 4, color: '0xec9bd3' },
                fontSize: 48

            }
        })
        this.addChild(this.bg)
        this.addChild(this.lbl)

        this.lbl.position.set(0, 41)

        this.interactive = true
        this.cursor = 'pointer'
    }
}


class SideButton extends BaseNode {
    icon: Sprite
    bg: Sprite
    lbl: Text

    constructor(icon_name: string, lbl_text: string, isDisabled = false) {
        super()
        this.bg = create_sprite('main/BtnTemplate')
        this.icon = create_sprite(icon_name)
        this.lbl = create_text({
            text: lbl_text, style: {
                align: 'center',
                fill: colors.dark,
                stroke: { width: 4, color: colors.bright },
                fontSize: 38

            }
        })

        if (isDisabled) {
            this.bg = create_sprite('main/BtnTemplateBW')
            this.lbl.style.fill = colors.dark
            this.lbl.style.stroke = {width: 0}
        } else {
            this.interactive = true
            this.cursor = 'pointer'
        }

        this.icon.scale.set(0.6)

        this.addChild(this.bg)
        this.addChild(this.icon)
        this.addChild(this.lbl)

        this.icon.position.y = -this.bg.height / 2 + 10
        this.lbl.position.y += 20
    }
}



export default class S_Main extends BaseNode {
    update_hook!: OmitThisParameter<any>
    battle = new BattleAnimation()
    dock = new Dock()
    button_story = new ButtonStory()
    button_spin = new ButtonDockSide(`icons/spin`, 'Daily Spin')
    button_reward = new ButtonDockSide(`icons/gift`, 'Free Gems')
    header = new Header()

    button_summon = new ButtonSummon()

    button_events = new SideButton('icons/lock', 'Events', true)
    button_quests = new SideButton('icons/scroll', 'Quests')
    button_dungeons = new SideButton('icons/lock', 'Dungeons', true)

    modal?: BaseNode

    constructor() {
        super()
        this.addChild(this.battle)
        this.addChild(this.dock)
        this.addChild(this.button_story)
        this.addChild(this.button_spin)
        this.addChild(this.button_reward)
        this.addChild(this.header)

        this.addChild(this.button_summon)

        this.addChild(this.button_events)
        this.addChild(this.button_quests)
        this.addChild(this.button_dungeons)

        this.button_spin.on('pointerup', () => {
            this.trigger('set_scene', 'daily_spin')
        })

        this.button_quests.on('pointerup', () => {
            this.trigger('set_scene', 'quests')
        })

        this.button_reward.on('pointerup', () => {
            this.trigger('set_scene', 'free_gems')
        })

        this.button_summon.on('pointerup', () => {
            this.trigger('set_scene', 'summon')
        })

        this.button_story.on('pointerup', () => {
            this.trigger('set_scene', 'location_select')
        })

        this.header.button_settings.on('pointerup', () => {
            this.trigger('set_scene', 'settings')
        })

        this.on('pause_off', () => {
            this.modal?.destroy()
            this.modal = undefined
        })

        this.dock.button1.on('pointerup', () => {
            this.trigger('set_scene', 'shop')
        })
        this.dock.button2.on('pointerup', () => {
            this.trigger('set_scene', 'backpack')
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

        // battle
        this.battle.scale.set(
            (this.bh - this.dock.height - this.header.height + 60) / (this.battle.height / this.battle.scale.y)
        )


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

        // button_summon
        this.button_summon.scale.set(
            (this.bw / 3) / (this.button_summon.width / this.button_summon.scale.x)
        )
        this.button_summon.position.y = -this.bh/2 + this.header.height + this.button_summon.height/2 + 10

        // button_events
        this.button_events.scale.set(
            (this.bw / 4.4) / (this.button_events.width / this.button_events.scale.x)
        )
        this.button_events.position.x = -this.bw / 2 + this.button_events.width / 2 + 5
        this.button_events.position.y = -150

        // button_quests
        this.button_quests.scale.set(this.button_events.scale.x)
        this.button_quests.position.x = -this.bw / 2 + this.button_quests.width / 2 + 5
        this.button_quests.position.y = this.button_events.position.y + this.button_quests.height + 10

        // button_dungeons
        this.button_dungeons.scale.set(this.button_events.scale.x)
        this.button_dungeons.position.x = -this.bw / 2 + this.button_dungeons.width / 2 + 5
        this.button_dungeons.position.y = this.button_quests.position.y + this.button_quests.height + 10

        // battle
        this.battle.position.y = - this.battle.height/ 2
        this.battle.position.x = - this.bw / 2
        this.battle.resize()
    }
}
