import BaseNode from "$lib/BaseNode"
import {create_graphics, create_point, create_sprite, create_text, create_vector} from "$lib/create_things"
import {Container, FederatedPointerEvent, Point, Sprite, Text, Texture, TilingSprite} from "pixi.js"
import colors from "../colors"
import WoodenHeader from "../components/WoodenHeader"
import VRowScrollable from "../components/VRowScrollable.ts"
import ButtonBack from "../components/ButtonBack"
import store, {Quest, save} from "$src/game/data/store"
import Item from '$src/game/components/Item.ts'
import {get_reward_icon, set_up_drop_items} from "$src/game/other.ts";
import HeaderTop from "$src/game/components/HeaderTop.ts";
import {IPoint} from "$lib/Vector.ts";
import {random_float, random_int} from "$lib/random.ts";
import {randomPointInCircle} from "$lib/utility.ts";
import {Easing} from "@tweenjs/tween.js";
import awe from "$src/game/data/awe.ts";
import microManage from '$lib/dev/microManage.ts'


class CardLeaderboardRegular extends BaseNode {
    lbl: Text
    bg: Sprite
    avatar_container = new Container()
    frame: Sprite
    frame_mask: Sprite
    avatar: Sprite

    constructor(place: number) {
        super()
        place = place + 1

        const username = 'HumbleWarrior'

        this.bg = create_sprite('card_thin')
        this.lbl = create_text({
            text: username, style: {
                fontSize: 48,
                fill: colors.dark,
            },
        })
        this.lbl.anchor.x = 0

        this.avatar = create_sprite('player_avatar')

        this.frame = create_sprite(`frames/4`)
        this.frame_mask = create_sprite(`frames/4_mask`)

        this.avatar.scale.set(
            this.frame.height / (this.avatar.height / this.avatar.scale.y)
        )

        if (place == 1) {
            this.avatar.scale.set(
                (this.frame.height * 0.6) / (this.avatar.height / this.avatar.scale.y)
            )
            this.avatar.position.y = 10
        }


        this.addChild(this.bg)
        this.addChild(this.avatar_container)
        this.avatar_container.addChild(this.avatar)
        this.avatar_container.addChild(this.frame)
        this.avatar_container.addChild(this.frame_mask)
        this.addChild(this.lbl)
        this.avatar.mask = this.frame_mask
    }

    resize() {
        const s = this.bw / (this.bg.width / this.bg.scale.x)
        this.scale.set(s)
    }
}


class CardLeaderboardCool extends BaseNode {
    lbl: Text
    bg: Sprite
    avatar_container = new Container()
    frame: Sprite
    frame_mask: Sprite
    avatar: Sprite
    lbl_crowns: Text
    icon_crowns: Sprite
    place

    constructor(place: number) {
        super()
        place = place + 1
        this.place = place

        const username = 'HeliosTheSunGod'
        const crowns = 1000000

        this.bg = create_sprite('card_small_default')
        this.lbl = create_text({
            text: username, style: {
                fontSize: 48,
                fill: colors.dark,
            },
        })
        this.lbl_crowns = create_text({
            text: crowns, style: {
                fontSize: 38,
                fill: colors.dark,
            },
        })

        this.icon_crowns = create_sprite('icons/crown')

        this.avatar = create_sprite('player_avatar')
        const frame_name = place < 4 ? place : 4

        this.frame = create_sprite(`frames/${frame_name}`)
        this.frame_mask = create_sprite(`frames/${frame_name}_mask`)

        this.avatar.scale.set(
            this.frame.height / (this.avatar.height / this.avatar.scale.y)
        )

        if (place == 1) {
            this.avatar.scale.set(
                (this.frame.height * 0.6) / (this.avatar.height / this.avatar.scale.y)
            )
            this.avatar.position.y = 10
        }


        this.addChild(this.bg)
        this.addChild(this.avatar_container)
        this.avatar_container.addChild(this.avatar)
        this.avatar_container.addChild(this.frame)
        this.avatar_container.addChild(this.frame_mask)
        this.addChild(this.lbl)
        this.addChild(this.lbl_crowns)
        this.avatar.mask = this.frame_mask

        this.icon_crowns.scale.set(
            this.lbl_crowns.height / (this.icon_crowns.height / this.icon_crowns.scale.y)
        )
    }

    resize() {
        // const diff = this.bg.height - this.avatar_container.height / 2
        // if (this.place === 1) {
        //     this.avatar_container.position.y = - this.bg.height / 2 - this.avatar_container.height * 0.3
        // } else if (this.place ===2) {
        //     this.avatar_container.position.y = - this.bg.height / 2 - this.avatar_container.height * 0.15
        // } else {
        //     this.avatar_container.position.y = - this.bg.height / 2 - this.avatar_container.height * 0.1
        // }
        //
        // this.lbl.position.y = this.bg.position.y - this.bg.height * 0.01
        //
        // this.lbl_crowns.position.y = this.bg.position.y + this.bg.height * 0.25

        const s = this.bw / (this.bg.width / this.bg.scale.x)
        this.scale.set(s)
    }
}


export default class S_Leaderboard extends BaseNode {
    bg: TilingSprite
    header_top = new HeaderTop()
    header: WoodenHeader
    vrow = new VRowScrollable()
    button_back = new ButtonBack()

    constructor() {
        super()
        this.header = new WoodenHeader('Leaderboard')

        this.bg = new TilingSprite({texture: Texture.from('seamlessbg')})
        this.addChild(this.bg)
        this.addChild(this.header_top)
        this.addChild(this.header)
        this.addChild(this.vrow)
        this.addChild(this.button_back)

        const quests = store.quest_list

        let amount_completed = quests.filter(el=> el.task_current / el.task_needed >= 1).length

        for (let i = 0; i< 15;i ++) {
            if (i < 3) {
                this.vrow.add(new CardLeaderboardCool(i))
            } else {
                this.vrow.add(new CardLeaderboardRegular(i))
            }
        }

        this.button_back.on('pointerup', () => this.trigger('set_scene', 'main'))


        set_up_drop_items(this, this.header_top)
    }

    start() {
    }


    resize() {
        super.resize()
        this.bw = window.screen_size.width
        this.bh = window.screen_size.height

        // header_top
        this.header_top.bw = this.bw
        this.header_top.resize()
        this.header_top.position.x = -this.bw / 2
        this.header_top.position.y = -this.bh / 2

        // header
        this.header.bw = this.bw * 0.75
        this.header.resize()
        this.header.position.y = -this.bh / 2 + this.header.height / 2 + this.bh * 0.01 + this.header_top.height

        // vrow
        this.vrow.bw = this.bw * 0.9
        this.vrow.bh = this.bh - (this.header.height + this.header_top.height + this.bh * 0.04)
        this.vrow.resize()
        this.vrow.position.y = -this.bh / 2 + (this.bh - this.vrow.bh)

        // button_back
        this.button_back.scale.set(
            (this.bw / 10) / (this.button_back.width / this.button_back.scale.x),
        )
        this.button_back.position.x = -this.bw / 2 + this.button_back.width / 2 + this.bw * 0.02
        this.button_back.position.y = this.bh / 2 - this.button_back.height / 2 - this.bw * 0.02

        // bg
        this.bg.width = this.bw
        this.bg.height = this.bh

        this.bg.position.x = -this.bw / 2
        this.bg.position.y = -this.bh / 2

        const bg_scale = (this.bw / 256) / 5
        this.bg.tileScale.set(bg_scale)

    }
}
