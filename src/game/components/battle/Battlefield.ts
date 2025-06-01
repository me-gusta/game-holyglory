
import BaseNode from "$lib/BaseNode"
import { create_fx, create_graphics, create_point, create_sprite, create_text, create_vector } from "$lib/create_things"
import make_draggable from "$lib/make_draggable"
import { random_choice, random_int } from "$lib/random"
import { isPointInCircle, rad2sector } from "$lib/utility"
import { IPoint } from "$lib/Vector"
import { Easing } from "@tweenjs/tween.js"
import { Container, DestroyOptions, FederatedEvent, FederatedPointerEvent, Graphics, Sprite, Text, Ticker } from "pixi.js"
import registerKeypress from "$lib/dev/registerKeypress"
import microManage from "$lib/dev/microManage"
import { Spine } from "@esotericsoftware/spine-pixi-v8"
import store from "$lib/store"


const char_z = [30, 10, 20]

class PlacementsFriends extends Container<Graphics> {
    p1: Graphics
    p2: Graphics
    p3: Graphics

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

        this.p1.position.set(80, 548)
        this.p2.position.set(179, 518)
        this.p3.position.set(260, 548)

    }
}


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
    }

    get(i: 0 | 1 | 2): Graphics {
        if (i === 2) return this.p1
        if (i === 1) return this.p2
        if (i === 0) return this.p3
        throw new Error(`incorrect placement: ${i}`)
    }

    set_offset(amount: number) {
        this.offset = amount
    }

    resize() {
        const { width } = window.screen_size

        this.p1.position.set(width / this.parent.scale.x - 80, 548)
        this.p2.position.set(width / this.parent.scale.x - 179, 518)
        this.p3.position.set(width / this.parent.scale.x - 260, 548)

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
    eid: string = ""

    constructor(spine_name: string) {
        super()

        this.spine_name = spine_name
        this.hp_pb = new HpProgressBar()

        let scale = 1
        if (spine_name === 'leonard') scale = 0.6
        this.spine = Spine.from({ skeleton: `spine/${spine_name}-data`, atlas: `spine/${spine_name}-atlas`, scale })

        this.addChild(this.spine)
        this.addChild(this.hp_pb)

        this.hp_pb.position.y = -this.spine.height

        if (spine_name === 'wolf') this.spine.position.y = -this.spine.height * 0.8
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
    bg: Sprite
    place_friends = new PlacementsFriends()
    place_waves: PlacementsEnemies[] = []

    spines: Container<Character> = new Container()
    friends: (Character|null)[] = []
    enemies: (Character | null)[] = [null, null, null]
    // enemies: Container<Spine> = new Container()
    next_waves: (Character | null)[][] = []

    current_wave = 0

    constructor() {
        super()

        this.bg = create_sprite('battle/bgs/hills')
        this.bg.anchor.set(0, 0)
        this.addChild(this.bg)
        this.addChild(this.place_friends)
        // this.addChild(this.place_enemies)
        this.addChild(this.spines)


    }

    anim_next_wave() {
        this.tween(this.bg.position)
            .to({ x: this.bg.position.x - 400 }, 1200)
            .start()
            .onComplete(() => {
                for (let friend of this.friends) {
                    if (!friend) return
                    friend.setAnimation('idle', true)
                }
            })

        for (let placement of this.place_waves) {
            this.tween(placement.position)
                .to({ x: placement.position.x - 400 }, 1200)
                .start()
        }
        for (let enemy of this.enemies) {
            if (!enemy) continue
            this.tween(enemy.position)
                .to({ x: enemy.position.x - 400 }, 1200)
                .start()
        }

        for (let friend of this.friends) {
            if (!friend) return
            friend.setAnimation('run', true)
        }
    }

    anim_walk_in() {
        for (let i = 0; i < 3; i++) {
            const character = this.friends[i]
            if (!character) return
            character.position.copyFrom(this.place_friends.getChildAt(i)! as any)
            character.position.x -= 500
            character.zIndex = char_z[i]

            const point_to = create_point().copyFrom(this.place_friends.getChildAt(i)! as any)

            character.setAnimation('run', true)

            this.tween(character)
                .to(point_to, 2000)
                .easing(Easing.Sinusoidal.Out)
                .start()

            this.set_timeout(1900, () => {
                character.setAnimation('idle', true)
            })
        }
    }

    anim_friends_hit(power_points) {
        const time_scale = 1
        const places = this.place_waves[0]

        let targets: number[]

        const has0 = Boolean(this.enemies[0])
        const has1 = Boolean(this.enemies[1])
        const has2 = Boolean(this.enemies[2])

        if (!has0 && !has1 && has2) return

        if (!has0 && !has1 && has2) {
            targets = [2, 2, 2]
        } else if (!has0 && has1 && !has2) {
            targets = [1, 1, 1]
        } else if (has0 && !has1 && !has2) {
            targets = [0, 0, 0]
        } else if (has0 && has1 && !has2) {
            targets = [1, 2, 2]
        } else if (has0 && !has1 && has2) {
            targets = [0, 0, 2]
        } else if (!has0 && has1 && has2) {
            targets = [1, 1, 2]
        } else {
            targets = [0, 1, 2]
        }

        for (let i = 0; i < 3; i++) {
            const delay = random_int(0, 300)

            this.set_timeout(delay, () => {
                const point_a = create_point().copyFrom(places.getChildAt(targets[i])! as any)
                point_a.x -= 60
                const point_b = create_point().copyFrom(this.place_friends.getChildAt(i)! as any)

                if (!this.friends[i]) return

                const character: Character = this.friends[i]!
                character.setAnimation('attack', false)
                character.addAnimation('idle', true)

                const reduce_enemy_hp = () => {
                    const enemy = this.enemies[targets[i]]
                    if (!enemy) return
                    const e_enemy = store.mobs[enemy!.eid]

                    const e_friend = store.battle_party[character.eid]
                    e_enemy.hp_current = (e_enemy.hp_current || e_enemy.hp_max) -
                        power_points * e_friend.level * (power_points / 10)


                    if (e_enemy.hp_current < 0) {
                        e_enemy.hp_current = 0
                    }
                    
                    enemy!.hp_pb.setValue(e_enemy.hp_current / e_enemy.hp_max)

                    if (e_enemy.hp_current === 0) {
                        enemy!.destroy()
                        this.enemies[targets[i]] = null
                    }
                }

                

                this.tween(character.position)
                    .to(point_a, 600 * time_scale)
                    .easing(Easing.Quadratic.In)
                    .onStart(() => {
                        character.zIndex = char_z[i] + 2
                    })
                    .start()

                this.set_timeout(700 * time_scale, () => {
                    const fx = create_fx('splash', this.spines, character)
                    fx.scale.set(6)
                    fx.zIndex = char_z[i] + 2
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
            })
        }
    }

    anim_enemies_hit(power_points=1) {
        const time_scale = 1

        let targets: number[]

        const has0 = Boolean(this.friends[0])
        const has1 = Boolean(this.friends[1])
        const has2 = Boolean(this.friends[2])

        if (!has0 && !has1 && has2) return

        if (!has0 && !has1 && has2) {
            targets = [2, 2, 2]
        } else if (!has0 && has1 && !has2) {
            targets = [1, 1, 1]
        } else if (has0 && !has1 && !has2) {
            targets = [0, 0, 0]
        } else if (has0 && has1 && !has2) {
            targets = [1, 2, 2]
        } else if (has0 && !has1 && has2) {
            targets = [0, 0, 2]
        } else if (!has0 && has1 && has2) {
            targets = [1, 1, 2]
        } else {
            targets = [0, 1, 2]
        }


        for (let i = 0; i < 3; i++) {
            const delay = random_int(0, 300)

            this.set_timeout(delay, () => {
                if (!this.enemies[i]) return

                const point_a = create_point().copyFrom(this.place_friends.getChildAt(targets[i])! as any)
                point_a.x += 60
                const point_b = create_point().copyFrom(this.place_waves[0].getChildAt(i)! as any)

                const character: Character = this.enemies[i]!
                character.setAnimation('attack', false)
                character.addAnimation('idle', true)

                this.tween(character.position)
                    .to(point_a, 600 * time_scale)
                    .easing(Easing.Quadratic.In)
                    .onStart(() => {
                        character.zIndex = char_z[i] + 2
                    })
                    .start()
                
                const reduce_friend_hp = () => {
                    const enemy = this.enemies[i]
                    if (!enemy) return
                    const e_enemy = store.mobs[enemy!.eid]
                    const friend = this.friends[targets[i]]

                    if (!friend) return

                    const e_friend = store.battle_party[friend.eid]

                    e_friend.hp_current = (e_friend.hp_current || e_friend.hp_max) -
                        power_points * random_int(e_enemy.damage_scale[0], e_enemy.damage_scale[1])
                    console.log(e_friend, '', power_points * random_int(e_enemy.damage_scale[0], e_enemy.damage_scale[1]))

                    if (e_friend.hp_current < 0) {
                        e_friend.hp_current = 0
                    }
                    
                    friend!.hp_pb.setValue(e_friend.hp_current / e_friend.hp_max)

                    if (e_friend.hp_current === 0) {
                        friend!.destroy()
                        this.friends[targets[i]] = null
                    }
                }

                this.set_timeout(700 * time_scale, () => {
                    const fx = create_fx('splash', this.spines, character)
                    fx.scale.set(6)
                    fx.zIndex = char_z[i] + 2
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
            })
        }
    }


    draw_friends() {
        const es_friends = Object.values(store.battle_party)

        for (let i = 0; i < 3; i++) {
            const e = es_friends[i]
            const character = new Character(e.label)
            character.eid = e.eid

            this.friends.push(character)
            this.spines.addChild(character)

            character.zIndex = char_z[i]
            character.position.copyFrom(this.place_friends.getChildAt(i)! as any)

            character.setAnimation('idle', true)
        }
    }

    draw_enemies() {
        const e_battle = store.battles[store.current_battle]
        const es_wave = Object.values(store.waves)
            .filter(e => e.battle === e_battle.eid)

        for (let i = 0; i < es_wave.length; i++) {
            const e_wave = es_wave[i]
            // e.number === store.current_wave_number

            const es_mob_tmp = Object.values(store.mobs)
                .filter(e => e.wave === e_wave.eid)

            const placements = new PlacementsEnemies()
            placements.set_offset(400 * i)
            this.place_waves.push(placements)
            this.addChild(placements)
            placements.resize()

            const buffer: (Character | null)[] = []


            const es_mob: any[] = [null, null, null];

            for (const mob of es_mob_tmp) {
                es_mob[mob.place] = mob
            }


            for (let i = 0; i < es_mob.length; i++) {
                const e_mob = es_mob[i]
                if (!e_mob) {
                    if (e_wave.number !== 1) {
                        buffer.push(null)
                    }
                    continue
                }
                const enemy = new Character(e_mob.label)
                enemy.eid = e_mob.eid

                const place = placements.get(e_mob.place)
                enemy.position.copyFrom(place)

                this.spines.addChild(enemy)

                enemy.setAnimation('idle', true)
                enemy.spine.scale.x = -1
                enemy.zIndex = char_z[i]

                if (e_wave.number !== 1) {
                    // enemy.visible = false
                    buffer.push(enemy)
                } else {
                    this.enemies[e_mob.place] = enemy
                }
            }
            if (buffer.length) {
                this.next_waves.push(buffer)
            }
        }

    }

    next_wave() {
        const next = this.next_waves.shift()
        if (!next) return

        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i]
            if (enemy) {

                enemy.destroy()
            }
            this.enemies[i] = next[i]
        }

        this.current_wave += 1

    }

    resize() {
        const s = (this.bh) / (this.bg.height / this.bg.scale.y)
        this.scale.set(s)

        this.bw = this.bg.width * s


        for (let i = 0; i < 3; i++) {
            const character = this.friends[i]
            if (!character) continue
            character.position.copyFrom(this.place_friends.getChildAt(i)! as any)
            character.zIndex = char_z[i]
        }

        // this.place_enemies.resize()

        const places = this.place_waves[0]
        for (let i = 0; i < 3; i++) {
            const enemy = this.enemies[i]
            if (!enemy) continue
            enemy.position.copyFrom(places.getChildAt(i)! as any)
            enemy.zIndex = char_z[i]
        }
    }
}