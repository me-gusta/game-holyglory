
import BaseNode from "$lib/BaseNode"
import { create_fx, create_graphics, create_point, create_sprite, create_text, create_vector } from "$lib/create_things"
import make_draggable from "$lib/make_draggable"
import { random_choice, random_int } from "$lib/random"
import { isPointInCircle, rad2sector } from "$lib/utility"
import { IPoint } from "$lib/Vector"
import { Easing } from "@tweenjs/tween.js"
import { Container, DestroyOptions, FederatedEvent, FederatedPointerEvent, Graphics, Sprite, Text, Texture, Ticker, TilingSprite } from "pixi.js"
import registerKeypress from "$lib/dev/registerKeypress"
import microManage from "$lib/dev/microManage"
import { Spine } from "@esotericsoftware/spine-pixi-v8"
import store from "$lib/store"


const char_z = [30, 10, 20]

class PlacementsEnemies extends Container<Graphics> {
    p1: Graphics
    p2: Graphics
    p3: Graphics
    offset = 0

    constructor() {
        super()

        this.p1 = create_graphics()
            .circle(0, 0, 10)
            .fill('red')
        this.p2 = create_graphics()
            .circle(0, 0, 10)
            .fill('blue')
        this.p3 = create_graphics()
            .circle(0, 0, 10)
            .fill('green')

        this.addChild(this.p1)
        this.addChild(this.p2)
        this.addChild(this.p3)

        this.p1.visible = false
        this.p2.visible = false
        this.p3.visible = false
    }

    get(i: number): Graphics {
        if (i === 2) return this.p3
        if (i === 1) return this.p2
        if (i === 0) return this.p1
        throw new Error(`incorrect placement: ${i}`)
    }

    set_offset(amount: number) {
        this.offset = amount
    }

    resize() {
        const { width } = window.screen_size

        this.p1.position.set(width / this.parent.scale.x - 360, 548)
        this.p2.position.set(width / this.parent.scale.x - 209, 518)
        this.p3.position.set(width / this.parent.scale.x - 80, 548)

        this.p1.position.x += this.offset
        this.p2.position.x += this.offset
        this.p3.position.x += this.offset
    }
}


class HpProgressBar extends BaseNode {
    bg: Sprite
    top: Sprite
    msk: Graphics
    constructor() {
        super()
        this.bg = create_sprite('battle/hp_pb')
        this.top = create_sprite('battle/hp_pb_top')
        this.msk = create_graphics()
            .rect(0, 0, this.bg.width, this.bg.height)
            .fill('white')

        this.msk.position.x = -this.bg.width / 2
        this.msk.position.y = -this.bg.height / 2

        this.addChild(this.bg)
        this.addChild(this.top)
        this.addChild(this.msk)
        this.top.mask = this.msk
    }

    setValue(n: number) {
        if (n < 0 || n > 1) throw new Error('incorrect value for progressbar')
        const start_x = -this.width / 2
        const start_y = -this.height / 2
        const height = this.height

        const width = this.width * n

        this.msk
            .clear()
            .rect(0, 0, width, height)
            .fill('white')

    }
}

class Character extends BaseNode {
    spine: Spine
    hp_pb: HpProgressBar
    spine_name: string
    circle_selected = create_graphics()
    hp_current = 100
    hp_max = 100
    attack = 0
    rune?: string

    constructor(spine_name: string) {
        super()

        this.spine_name = spine_name
        this.hp_pb = new HpProgressBar()

        let scale = 1
        if (spine_name === 'leonard') scale = 0.6
        if (spine_name === 'wolf') scale = 0.8
        this.spine = Spine.from({ skeleton: `spine/${spine_name}-data`, atlas: `spine/${spine_name}-atlas`, scale })

        this.addChild(this.circle_selected)
        this.addChild(this.spine)
        this.addChild(this.hp_pb)

        this.hp_pb.position.y = -this.spine.height

        if (spine_name === 'wolf') this.spine.position.y = -this.spine.height * 0.8

        this.circle_selected
            .ellipse(0, 0, 60, 30)
            .fill({ color: '#eda91a', alpha: 0.6 })

        this.circle_selected.blendMode = 'screen'
        this.circle_selected.visible = false
    }

    setAnimation(name: string, loop = false) {
        if (this.spine_name === 'leonard') {
            if (name === 'idle') this.spine.state.timeScale = 0.6
            if (name === 'run') this.spine.state.timeScale = 3
            if (name === 'attack') this.spine.state.timeScale = 1.7
        }
        this.spine.state.setAnimation(0, name, loop)
    }

    addAnimation(name: string, loop = false) {
        this.spine.state.addAnimation(0, name, loop)
    }
}

export default class Battlefield extends BaseNode {
    bg: TilingSprite
    place_hero = create_graphics()
        .circle(0, 0, 10)
        .fill('red')
    place_mobs: PlacementsEnemies = new PlacementsEnemies()

    spines: Container<Character> = new Container()
    hero: Character
    mobs: (Character | null)[] = [null, null, null]
    next_waves: (Character | null)[][] = []

    current_wave = 0
    mob_turn = 0
    mob_selected = 0

    constructor() {
        super()

        const bg_texture = Texture.from('battle/bgs/hills')
        this.bg = new TilingSprite({texture: bg_texture})
        this.bg.anchor.set(0, 0)
        this.addChild(this.bg)
        this.addChild(this.place_hero)
        this.addChild(this.spines)
        this.addChild(this.place_mobs)

        const e_battle = store.battles[store.current_battle]
        this.bg.width = e_battle.waves.length * bg_texture.width


        this.hero = new Character('leonard')
        this.hero.setAnimation('idle', true)
        this.spines.addChild(this.hero)
        
        const mob_data = store.mobs['leonard']
        const { hp_max, attack } = mob_data.levels["1"]

        this.hero.hp_current = hp_max
        this.hero.hp_max = hp_max
        this.hero.attack = attack

        this.place_hero.position.set(122, 545)
        this.place_hero.visible = false


    }

    anim_next_wave() {
        const WAVE_OFFSET = 600

        this.tween(this.bg.position)
            .to({ x: this.bg.position.x - WAVE_OFFSET }, 1200)
            .start()
            .onComplete(() => {
                this.hero.setAnimation('idle', true)
            })

        for (let i = 0; i < this.mobs.length; i++) {
            const mob = this.mobs[i]
            if (!mob) continue
            const place = this.place_mobs.get(i)
            mob.position.copyFrom(place)
            mob.position.x += WAVE_OFFSET
            mob.visible = true
            if (!mob) continue
            this.tween(mob.position)
                .to({ x: place.position.x  }, 1200)
                .start()
        }

        this.hero.setAnimation('run', true)

        this.select_mob(0)
        this.set_mobs_selectable()
    }

    anim_walk_in() {
        const character = this.hero
        if (!character) return
        character.position.copyFrom(this.place_hero)
        character.position.x -= 500
        character.zIndex = char_z[0]

        const point_to = create_point().copyFrom(this.place_hero)

        character.setAnimation('run', true)

        this.tween(character)
            .to(point_to, 2000)
            .easing(Easing.Sinusoidal.Out)
            .start()

        this.set_timeout(1900, () => {
            character.setAnimation('idle', true)
        })
    }

    anim_hero_hit(power_points: number, stats: any) {
        const time_scale = 1
        const places = this.place_mobs

        let target: number = this.mob_selected

        if (target === -1) return

        const point_a = create_point().copyFrom(places.getChildAt(target)! as any)
        point_a.x -= 60
        const point_b = create_point().copyFrom(this.place_hero)


        const character: Character = this.hero
        character.setAnimation('attack', false)
        character.addAnimation('idle', true)

        const reduce_enemy_hp = () => {
            const mob = this.mobs[target]
            if (!mob) return

            let suit_bonus = 0
            console.log('stats', stats, mob.rune)
            if (mob.rune === 'fire') suit_bonus += stats["water"] || 0
            if (mob.rune === 'water') suit_bonus += stats["plant"] || 0
            if (mob.rune === 'plant') suit_bonus += stats["fire"] || 0
            if (mob.rune === 'light') suit_bonus += stats["dark"] || 0
            if (mob.rune === 'dark') suit_bonus += stats["light"] || 0
            
            mob.hp_current = (mob.hp_current) 
                - this.hero.attack
                - Math.floor((power_points - 3) * this.hero.attack / 10)
                - Math.floor(suit_bonus * (power_points * 0.3))


            console.log('hp new', mob.hp_current)
            console.log('damage dealt', this.hero.attack)
            console.log('damage rune bonus', power_points, this.hero.attack / 10, (power_points - 3) * this.hero.attack / 10)
            console.log('damage suit bonus', suit_bonus, suit_bonus * (power_points * 0.3))

            if (mob.hp_current < 0) {
                mob.hp_current = 0
            }

            mob.hp_pb.setValue(mob.hp_current / mob.hp_max)

            if (mob.hp_current === 0) {
                mob!.destroy()
                this.mobs[target] = null
                this.select_mob(target)
            }
        }

        this.tween(character.position)
            .to(point_a, 600 * time_scale)
            .easing(Easing.Quadratic.In)
            .onStart(() => {
                character.zIndex = char_z[target] + 2
            })
            .start()

        this.set_timeout(700 * time_scale, () => {
            const fx = create_fx('splash', this.spines, character)
            fx.scale.set(6)
            fx.zIndex = char_z[target] + 2
            fx.position.copyFrom(point_a)
            fx.position.x + 60

            reduce_enemy_hp()
        })

        this.set_timeout(810 * time_scale, () => {
            character.spine.state.timeScale = 3
            this.tween(character.position)
                .to(point_b, 200)
                .easing(Easing.Quadratic.Out)
                .start()
                .onComplete(() => {
                    character.spine.state.timeScale = 0.6
                })
        })
    }

    anim_enemies_hit() {
        const time_scale = 1

        let attacker: number = this.mob_turn

        if (!this.mobs[attacker]) {
            return
        }

        const point_a = create_point().copyFrom(this.place_hero)
        point_a.x += 60
        const point_b = create_point().copyFrom(this.place_mobs.get(attacker))

        const character: Character = this.mobs[attacker]!
        character.setAnimation('attack', false)
        character.addAnimation('idle', true)

        this.tween(character.position)
            .to(point_a, 600 * time_scale)
            .easing(Easing.Quadratic.In)
            .onStart(() => {
                character.zIndex = char_z[attacker] + 2
            })
            .start()

        const reduce_friend_hp = () => {
            const mob = this.mobs[attacker]
            if (!mob) return
            const hero = this.hero

            hero.hp_current = (hero.hp_current) - random_int(mob.attack, mob.attack)

            if (hero.hp_current < 0) {
                hero.hp_current = 0
            }

            hero!.hp_pb.setValue(hero.hp_current / hero.hp_max)

            if (hero.hp_current === 0) {
                console.log('battle lost')
                this.emit('lost')
            }
        }

        this.set_timeout(700 * time_scale, () => {
            const fx = create_fx('splash', this.spines, character)
            fx.scale.set(6)
            fx.zIndex = char_z[attacker] + 2
            fx.position.copyFrom(point_a)
            fx.position.x + 60
            reduce_friend_hp()
        })

        this.set_timeout(810 * time_scale, () => {
            character.spine.state.timeScale = 3
            this.tween(character.position)
                .to(point_b, 200)
                .easing(Easing.Quadratic.Out)
                .start()
                .onComplete(() => {
                    character.spine.state.timeScale = 0.6
                })
        })
    }

    next_mob_turn() {
        if (!this.mobs[0] && !this.mobs[1] && !this.mobs[2]) {
            this.mob_turn = 0
            return
        }

        if (this.mob_turn === 0) {
            if (this.mobs[1]) this.mob_turn = 1
            else if (this.mobs[2]) this.mob_turn = 2
        } else if (this.mob_turn === 1) {
            if (this.mobs[2]) this.mob_turn = 2
            else if (this.mobs[0]) this.mob_turn = 0
        } else if (this.mob_turn === 2) {
            if (this.mobs[0]) this.mob_turn = 0
            else if (this.mobs[1]) this.mob_turn = 1
        }

    }

    draw_enemies() {
        const e_battle = store.battles[store.current_battle]
        const waves = e_battle.waves

        for (let wi = 0; wi < waves.length; wi++) {
            const wave_shortdata = waves[wi]

            const tmp: (Character | null)[] = [null, null, null]


            for (let mobi = 0; mobi < wave_shortdata.length; mobi++) {
                const mob_shortdata = wave_shortdata[mobi]
                if (!mob_shortdata) continue
                const { label, level } = mob_shortdata
                const mob_data = store.mobs[label]
                const {rune} = mob_data
                const { hp_max, attack } = mob_data.levels[level]
                console.log(
                    'load mob as wave', wi,
                    label, `level=${level}`, `hp_max=${hp_max}`, `attack=${attack}`,`rune=${rune}`,)

                const character = new Character(label)
                character.hp_current = hp_max
                character.hp_max = hp_max
                character.attack = attack
                character.rune = rune
                // enemy.eid = e_mob.eid

                const place = this.place_mobs.get(mobi)
                character.position.copyFrom(place)

                this.spines.addChild(character)

                character.setAnimation('idle', true)
                character.spine.scale.x = -1
                character.zIndex = char_z[mobi]

                if (wi === 0) {
                    this.mobs[mobi] = character
                } else {
                    tmp[mobi] = character
                    character.visible = false
                }
            }

            if (tmp.filter(el => el !== null).length) {
                this.next_waves.push(tmp)
            }
        }

        this.select_mob(0)
        this.set_mobs_selectable()
    }

    set_mobs_selectable() {
        for (let i = 0; i < this.mobs.length; i++) {
            const mob = this.mobs[i]
            if (!mob) continue

            mob.interactive = true
            mob.on('pointerup', () => {
                this.select_mob(i)
            })
        }
    }

    select_mob(i: number) {
        this.mob_selected = i

        for (let i = 0; i < this.mobs.length; i++) {
            const mob = this.mobs[i]
            if (!mob) continue

            mob.circle_selected.visible = false
        }

        if (this.mobs[i]) this.mobs[i]!.circle_selected.visible = true
        else if (this.mobs[0]) {
            this.mobs[0]!.circle_selected.visible = true
            this.mob_selected = 0
            return
        }
        else if (this.mobs[1]) {
            this.mobs[1]!.circle_selected.visible = true
            this.mob_selected = 1
            return
        }
        else if (this.mobs[2]) {
            this.mobs[2]!.circle_selected.visible = true
            this.mob_selected = 2
            return
        }
    }

    next_wave() {
        const next = this.next_waves.shift()
        if (!next) return

        for (let i = 0; i < this.mobs.length; i++) {
            const enemy = this.mobs[i]
            if (enemy) {

                enemy.destroy()
            }
            this.mobs[i] = next[i]
        }

        this.current_wave += 1
        this.mob_turn = 2
    }

    resize() {
        const s = (this.bh) / (this.bg.height / this.bg.scale.y)
        this.scale.set(s)

        this.bw = this.bg.width * s

        this.hero.position.copyFrom(this.place_hero)

        this.place_mobs.resize()
        for (let i = 0; i < 3; i++) {
            const enemy = this.mobs[i]
            if (!enemy) continue
            enemy.position.copyFrom(this.place_mobs.get(i))
            enemy.zIndex = char_z[i]
        }
    }
}