import BaseNode from "$lib/BaseNode"
import {create_graphics, create_sprite, create_text} from "$lib/create_things"
import colors from "$src/game/colors"
import {Assets, Graphics, Sprite, Text, Texture} from "pixi.js"
import ButtonSettings from "../ButtonSettings"
import store from "$src/game/data/store.ts";

class Stat extends BaseNode {
    bg: Sprite
    icon: Sprite
    lbl: Text

    constructor(icon_name: string) {
        super()
        this.bg = create_sprite('main/statbg')
        this.icon = create_sprite(icon_name)
        this.lbl = create_text({
            text: 1000, style: {
                fill: colors.bright,
                fontSize: 36,
                stroke: {width: 2, color: colors.dark},
                // align: 'right'
            }
        })

        this.lbl.anchor.x = 1
        this.lbl.position.y = -3
        this.lbl.position.x = this.bg.width / 2 - 10

        this.addChild(this.bg)
        this.addChild(this.icon)
        this.addChild(this.lbl)

        this.icon.scale.set(0.6)
        this.icon.position.x = -this.bg.width / 2 + 30
    }
}

class PlayerAvatar extends BaseNode {
    bg = create_sprite('main/PlayerAvatar')

    constructor() {
        super()
        this.addChild(this.bg)
        if (Assets.get('player_avatar')) {
            const avatar = create_sprite('player_avatar')
            this.addChild(avatar)
            avatar.scale.set(
                this.bg.height / (avatar.height / avatar.scale.y)
            )

            const border = create_sprite('main/PlayerAvatar_border')
            this.addChild(border)
            const mask = create_sprite('main/PlayerAvatar_mask')
            this.addChild(mask)
            avatar.mask = mask
        }
    }
}

class LevelProgressBar extends BaseNode {
    bg = create_sprite('main/LevelProgressBar')
    top = create_sprite('main/LevelProgressBarTop')
    msk: Graphics

    constructor() {
        super()
        this.addChild(this.bg)
        this.addChild(this.top)

        this.msk = create_graphics()
            .rect(-this.width / 2, -this.height / 2, this.width, this.height)
            .fill('white')

        this.addChild(this.msk)

        this.top.mask = this.msk

        this.setValue(0.8)
    }

    setValue(n: number) {
        if (n < 0 || n > 1) throw new Error('incorrect value for progressbar')
        const start_x = -this.width / 2
        const start_y = -this.height / 2
        const height = this.height

        const width = this.width * n

        this.msk
            .clear()
            .rect(start_x, start_y, width, height)
            .fill('white')

    }
}

class PlayerName extends BaseNode {
    lbl: Text

    constructor() {
        super()
        this.lbl = create_text({text: 'Player', style: {fill: colors.dark, fontSize: 58}})
        this.lbl.anchor.x = 0
        this.addChild(this.lbl)
    }
}


class PlayerLevel extends BaseNode {
    lbl: Text
    lbl2: Text

    constructor() {
        super()
        this.lbl = create_text({text: 'lv.', style: {fill: colors.dark, fontSize: 48}})


        this.lbl2 = create_text({
            text: '2', style: {
                fill: colors.bright,
                fontSize: 86,
                stroke: {width: 8, color: colors.dark}
            }
        })
        this.lbl2.anchor.x = 1

        this.addChild(this.lbl)
        this.addChild(this.lbl2)
        this.lbl2.position.set(140, -13)
    }

    resize(): void {
        this.lbl.position.x = this.lbl2.position.x - this.lbl2.width - 25
    }
}

class PlayerCrowns extends BaseNode {
    icon = create_sprite('icons/crown')
    lbl: Text

    constructor() {
        super()

        this.lbl = create_text({text: '4000', style: {fill: colors.dark, fontSize: 32}})
        this.lbl.anchor.x = 0
        this.addChild(this.icon)
        this.addChild(this.lbl)

        this.icon.scale.set(0.3)
        this.lbl.position.set(31, 2)
    }
}


class PlayerExperience extends BaseNode {
    lbl: Text

    constructor() {
        super()

        this.lbl = create_text({text: '480/600', style: {fill: colors.dark, fontSize: 32}})
        this.lbl.anchor.x = 1
        this.addChild(this.lbl)

    }
}


export default class Header extends BaseNode {
    bg = create_sprite('main/header')
    stat_coins = new Stat('icons/coin')
    stat_gems = new Stat('icons/gem')
    stat_energy = new Stat('icons/energy')

    player_avatar = new PlayerAvatar()
    level_progressbar = new LevelProgressBar()
    player_name = new PlayerName()
    player_level = new PlayerLevel()
    player_crowns = new PlayerCrowns()
    player_experience = new PlayerExperience()
    button_settings = new ButtonSettings()

    constructor() {
        super()
        this.bg.anchor.set(0)

        this.addChild(this.bg)
        this.addChild(this.stat_coins)
        this.addChild(this.stat_gems)
        this.addChild(this.stat_energy)

        this.stat_coins.scale.set(1.2)
        this.stat_gems.scale.set(1.2)
        this.stat_energy.scale.set(1.2)


        this.addChild(this.player_avatar)
        this.addChild(this.level_progressbar)
        this.addChild(this.player_name)
        this.addChild(this.player_level)
        this.addChild(this.player_crowns)
        this.addChild(this.player_experience)
        this.addChild(this.button_settings)

        this.stat_coins.lbl.text = store.stats.coins
        this.stat_gems.lbl.text = store.stats.coins
        this.stat_energy.lbl.text = store.stats.energy

        this.player_crowns.lbl.text = store.player.crowns
        this.player_level.lbl2.text = store.player.level
        this.player_name.lbl.text = store.player.username

        this.player_experience.lbl.text = store.player.exp_current + "/" + store.player.exp_next
        this.level_progressbar.setValue(
            store.player.exp_current / store.player.exp_next
        )
    }

    resize(): void {
        super.resize()

        const s = this.bw / (this.bg.width / this.bg.scale.x)
        // this.bg.scale.set(s)

        this.bh = (this.bg.height)


        this.scale.set(s)

        // stat_coins
        this.stat_coins.position.x = this.stat_coins.width / 2 + 10
        this.stat_coins.position.y = this.stat_coins.height / 2 + 10

        // stat_gems
        this.stat_gems.position.x = this.stat_coins.position.x + this.stat_coins.width + 10
        this.stat_gems.position.y = this.stat_gems.height / 2 + 10

        // stat_energy
        this.stat_energy.position.x = this.stat_gems.position.x + this.stat_gems.width + 10
        this.stat_energy.position.y = this.stat_energy.height / 2 + 10

        // player_avatar
        this.player_avatar.x = this.player_avatar.width / 2 + 10
        this.player_avatar.y = 233

        // level_progressbar
        this.level_progressbar.position.set(646, 259)

        // player_name
        this.player_name.position.set(211, 187)

        // player_level
        this.player_level.position.set(969, 187)
        this.player_level.resize()

        // player_crowns
        this.player_crowns.position.set(224, 299)

        // player_experience
        this.player_experience.position.set(1084, 299)

        // button_settings
        this.button_settings.position.x = this.bg.width - this.button_settings.width / 2
        this.button_settings.position.y = this.button_settings.width / 2

    }
}