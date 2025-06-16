import AssetManager from "$lib/AssetManager"
import BaseNode from "$lib/BaseNode"
import { create_fx, create_graphics, create_sprite, create_text, create_vector } from "$lib/create_things"
import make_draggable from "$lib/make_draggable"
import { random_choice, random_int } from "$lib/random"
import { distance_between_points, isPointInCircle, mutable_filter, rad2sector } from "$lib/utility"
import Value from "$lib/Value"
import { IPoint, Vector } from "$lib/Vector"
import dev from "$src/game/dev"
import { Easing } from "@tweenjs/tween.js"
import { Container, FederatedPointerEvent, Sprite, Texture } from "pixi.js"



type RuneSuit = 'fire' | 'water' | 'plant' | 'dark' | 'light'
type RuneVariant = 'normal' | 'h' | 'v' | 'cross' | 'x' | 'bomb'

class Rune extends Container {
    sprite: Sprite
    suit: RuneSuit
    variant: RuneVariant
    is_marked = false
    constructor(suit: RuneSuit, variant: RuneVariant) {
        super()

        this.suit = suit
        this.variant = variant

        this.sprite = create_sprite(`runes/${suit}_${variant}`)
        this.addChild(this.sprite)

        this.sprite.scale.set(0.8)

    }

    static generate() {
        const suit = random_choice(['fire', 'water', 'plant', 'dark', 'light'])
        const variant = 'normal'

        return new this(suit, variant)
    }

    regenerate() {
        const suit = random_choice(['fire', 'water', 'plant', 'dark', 'light'])
        const variant = 'normal'

        this.suit = suit
        this.variant = variant
        this.sprite.texture = Texture.from(`runes/${suit}_${variant}`)
    }

    set_variant(variant: RuneVariant) {
        const s: Sprite = this.getChildAt(0)
        s.texture = Texture.from(`runes/${this.suit}_${variant}`)

        this.variant = variant
    }

    set_suit(suit: RuneSuit) {
        const s: Sprite = this.getChildAt(0)
        this.suit = suit

        s.texture = Texture.from(`runes/${this.suit}_${this.variant}`)
    }
}




const find_matches = (grid: Rune[][]): IPoint[][] => {
    const matches: IPoint[][] = []
    const grid_size = 7
    const min_match = 3

    const check_horizontal = (y: number) => {
        let current_suit = grid[0][y].suit
        let count = 1
        let start_x = 0
        let max_count = 0
        let max_start_x = 0
        let max_end_x = 0

        for (let x = 1; x < grid_size; x++) {
            const suit = grid[x][y].suit

            if (suit === current_suit) {
                count++
                if (count > max_count && count >= min_match) {
                    max_count = count
                    max_start_x = start_x
                    max_end_x = x
                }
            } else {
                current_suit = suit
                count = 1
                start_x = x
            }
        }

        if (max_count >= min_match) {
            const match: IPoint[] = []
            for (let i = max_start_x; i <= max_end_x; i++)
                match.push({ x: i, y })
            matches.push(match)
        }
    }

    const check_vertical = (x: number) => {
        let current_suit = grid[x][0].suit
        let count = 1
        let start_y = 0
        let max_count = 0
        let max_start_y = 0
        let max_end_y = 0

        for (let y = 1; y < grid_size; y++) {
            const suit = grid[x][y].suit

            if (suit === current_suit) {
                count++
                if (count > max_count && count >= min_match) {
                    max_count = count
                    max_start_y = start_y
                    max_end_y = y
                }
            } else {
                current_suit = suit
                count = 1
                start_y = y
            }
        }

        if (max_count >= min_match) {
            const match: IPoint[] = []
            for (let i = max_start_y; i <= max_end_y; i++)
                match.push({ x, y: i })
            matches.push(match)
        }
    }

    for (let y = 0; y < grid_size; y++)
        check_horizontal(y)

    for (let x = 0; x < grid_size; x++)
        check_vertical(x)

    return matches
}

// trigger swap(from, to)
// event match_completed(stat_destroys)
export default class Pole extends BaseNode {
    border: Sprite
    tiles_arr: Sprite[][] = []
    tiles = new Container()

    runes = new Container()
    runes_arr: Rune[][] = []

    msk = create_graphics()
    touchpad = create_graphics()

    can_match: boolean = true
    stat_destroys = {}

    constructor() {
        super()

        this.border = create_sprite('battle/poleborder')

        for (let x = 0; x < 7; x++) {
            const row: any[] = []
            for (let y = 0; y < 7; y++) {
                const s = create_sprite('battle/tile1')
                this.tiles.addChild(s)
                row.push(s)
            }
            this.tiles_arr.push(row)
        }

        for (let x = 0; x < 7; x++) {
            const row: any[] = []
            for (let y = 0; y < 7; y++) {
                const rune = Rune.generate()
                this.runes.addChild(rune)

                row.push(rune)
            }
            this.runes_arr.push(row)
        }

        this.addChild(this.border)
        this.addChild(this.tiles)
        this.addChild(this.runes)
        this.addChild(this.msk)
        this.addChild(this.touchpad)
        this.touchpad.alpha = 0
        this.msk.alpha = 0.2

        this.runes.mask = this.msk

        while (true) {
            const matches = find_matches(this.runes_arr)
            for (let group of matches) {
                for (let i = 0; i < group.length - 1; i++) {
                    const gp = group[i]
                    const rune = this.runes_arr[gp.x][gp.y]
                    rune.regenerate()
                }
            }
            if (matches.length === 0) break
        }


        // make draggable
        {
            make_draggable(this.touchpad, 2)
            const max_drag_length = 80

            let dragged_grid_loc: IPoint | null = null
            let drag_pos_start = create_vector()

            this.touchpad.on('dragstart', (event: FederatedPointerEvent) => {
                const pos = this.toLocal(event.global)

                for (let x = 0; x < 7; x++) {
                    for (let y = 0; y < 7; y++) {
                        const tile = this.tiles_arr[x][y]
                        const is_intersection = isPointInCircle(tile, 65, pos)

                        if (is_intersection) {
                            dragged_grid_loc = { x, y }
                            drag_pos_start.copyFrom(pos)
                        }
                    }
                }
            })

            this.touchpad.on('dragmove', (event: FederatedPointerEvent) => {
                if (!dragged_grid_loc) return
                const { x, y } = dragged_grid_loc

                const diff = create_vector(this.toLocal(event.global)).substract(
                    drag_pos_start.copy()
                )

                if (diff.length > max_drag_length) {
                    diff.normalize().mulScalar(max_drag_length)
                }

                const rune = this.runes_arr[x][y]
                const tile = this.tiles_arr[x][y]

                rune.position.x = tile.x + diff.x
                rune.position.y = tile.y + diff.y

                rune.zIndex = 10
            })

            this.touchpad.on('dragend', (event: FederatedPointerEvent) => {
                if (!dragged_grid_loc) return
                const { x, y } = dragged_grid_loc

                // reset rune Z
                const rune = this.runes_arr[x][y]
                rune.zIndex = 0

                // swap
                const diff = create_vector(this.toLocal(event.global)).substract(
                    drag_pos_start.copy()
                )

                if (diff.length < 30) {
                    const tile = this.tiles_arr[x][y]
                    rune.position.copyFrom(tile)
                    dragged_grid_loc = null
                    return
                }

                const sector = rad2sector(diff.angle())
                if (sector === 1) {
                    const gp_to = { x: x - 1, y }
                    if (gp_to.x >= 0) this.swap(dragged_grid_loc, gp_to)
                }
                if (sector === 2) {
                    const gp_to = { x, y: y - 1 }
                    if (gp_to.y >= 0) this.swap(dragged_grid_loc, gp_to)
                }
                if (sector === 3) {
                    const gp_to = { x: x + 1, y }
                    if (gp_to.x <= 6) this.swap(dragged_grid_loc, gp_to)
                }
                if (sector === 4) {
                    const gp_to = { x, y: y + 1 }
                    if (gp_to.y <= 6) this.swap(dragged_grid_loc, gp_to)
                }

                // reset
                dragged_grid_loc = null

            })
        }
    }

    swap(gp_from: IPoint, gp_to: IPoint) {
        this.touchpad.interactive = false

        const tile_from = this.tiles_arr[gp_from.x][gp_from.y]
        const rune_from = this.runes_arr[gp_from.x][gp_from.y]

        const tile_to = this.tiles_arr[gp_to.x][gp_to.y]
        const rune_to = this.runes_arr[gp_to.x][gp_to.y]

        const tmp = rune_from
        this.runes_arr[gp_from.x][gp_from.y] = rune_to
        this.runes_arr[gp_to.x][gp_to.y] = tmp

        this.tween(rune_from.position)
            .to({ x: tile_to.x, y: tile_to.y }, 100)
            .easing(Easing.Quadratic.InOut)
            .start()


        this.tween(rune_to)
            .to({ x: tile_from.x, y: tile_from.y }, 100)
            .easing(Easing.Quadratic.InOut)
            .start()

        if (!dev.DISABLE_AUTOSWAP) this.set_timeout(150, this.match_all.bind(this))
        if (dev.DISABLE_AUTOSWAP) {
            this.touchpad.interactive = true
        }


    }

    match(): number {
        const matches = find_matches(this.runes_arr)
        const runes_marked = new Map()

        for (let x = 0; x < 7; x++) {
            for (let y = 0; y < 7; y++) {
                const rune = this.runes_arr[x][y]
                if (rune.is_marked) {
                    const key = `${x};${y}`
                    runes_marked.set(key, { score: 1, variant_new: 'normal' })
                }
            }
        }

        const amount_marked = runes_marked.size
        if (matches.length === 0 && amount_marked === 0) return 0

        // identify conversion to special runes
        const runes_affected = runes_marked

        for (let group of matches) {
            for (let i = 0; i < group.length; i++) {
                const gp = group[i]
                // const rune = this.runes_arr[gp.x][gp.y]
                const key = `${gp.x};${gp.y}`
                const prev = runes_affected.get(key) || { score: 0, variant_new: 'normal' }

                if (group.length >= 5 && i == group.length - 1) {
                    prev.variant_new = 'bomb'
                } else if (group.length >= 4 && i == group.length - 1) {
                    if (group[0].x === group[1].x) prev.variant_new = 'v'
                    else prev.variant_new = 'h'
                }

                prev.score += 1
                runes_affected.set(key, prev)
            }
        }

        for (let [key, { score, variant_new }] of runes_affected.entries()) {
            const [x, y] = key.split(';').map(Number)
            const rune = this.runes_arr[x][y]

            if (rune.variant === 'normal') continue


            if (rune.variant === 'v') {
                for (let i = 0; i < 7; i++) {
                    const ikey = `${x};${i}`
                    if (!runes_affected.get(ikey)) runes_affected.set(ikey, { score: 0, variant_new: 'normal' })
                }
            } else if (rune.variant === 'h') {
                for (let i = 0; i < 7; i++) {
                    const ikey = `${i};${y}`
                    if (!runes_affected.get(ikey)) runes_affected.set(ikey, { score: 0, variant_new: 'normal' })
                }
            } else if (rune.variant === 'bomb') {
                if (x + 1 < 7) runes_affected.set(`${x + 1};${y}`, { score: 0, variant_new: 'normal' })
                if (x + 1 < 7 && y + 1 < 7) runes_affected.set(`${x + 1};${y + 1}`, { score: 0, variant_new: 'normal' })
                if (x + 1 < 7 && y - 1 >= 0) runes_affected.set(`${x + 1};${y - 1}`, { score: 0, variant_new: 'normal' })

                if (x - 1 >= 0) runes_affected.set(`${x - 1};${y}`, { score: 0, variant_new: 'normal' })
                if (x - 1 >= 0 && y + 1 < 7) runes_affected.set(`${x - 1};${y + 1}`, { score: 0, variant_new: 'normal' })
                if (x - 1 >= 0 && y - 1 >= 0) runes_affected.set(`${x - 1};${y - 1}`, { score: 0, variant_new: 'normal' })

                if (y + 1 < 7) runes_affected.set(`${x};${y + 1}`, { score: 0, variant_new: 'normal' })
                if (y - 1 >= 0) runes_affected.set(`${x};${y - 1}`, { score: 0, variant_new: 'normal' })
            } else if (rune.variant === 'cross') {
                for (let i = 0; i < 7; i++) {
                    const ikey = `${i};${y}`
                    if (!runes_affected.get(ikey)) runes_affected.set(ikey, { score: 0, variant_new: 'normal' })
                }
                for (let i = 0; i < 7; i++) {
                    const ikey = `${x};${i}`
                    if (!runes_affected.get(ikey)) runes_affected.set(ikey, { score: 0, variant_new: 'normal' })
                }
            }
        }

        const this_destroys: any = {}
        // destroy all runes that need to be destroyed && convert special runes
        for (let [key, { score, variant_new }] of runes_affected.entries()) {
            const [x, y] = key.split(';').map(Number)
            const rune = this.runes_arr[x][y]

            if (score >= 2) {
                create_fx('splash', this, this.runes.toGlobal(rune))
                rune.set_variant('cross')
            } else if (variant_new != rune.variant && variant_new !== 'normal') {
                create_fx('splash', this, this.runes.toGlobal(rune))
                rune.set_variant(variant_new)
            } else {
                create_fx('spin', this, this.runes.toGlobal(rune))
                this.stat_destroys[rune.suit] = (this.stat_destroys[rune.suit] || 0) + 1
                this_destroys[rune.suit] = (this_destroys[rune.suit] || 0) + 1

                rune.destroy()
                //@ts-ignore
                this.runes_arr[x][y] = null

            }
        }

        this.emit('runes_destroyed', this_destroys)


        for (let x = 0; x < this.runes_arr.length; x++) {
            const column = this.runes_arr[x]

            const amount_nulls = column.filter(item => item === null).length
            mutable_filter(column, item => item !== null)

            for (let i = 0; i < amount_nulls; i++) {
                const rune = Rune.generate()
                column.unshift(rune)
                this.runes.addChild(rune)

                const tile = this.tiles_arr[x][0]
                rune.position.copyFrom(tile)
                rune.y -= tile.height
            }
        }

        this.anim_drop()
        return matches.length + amount_marked
    }

    match_all() {
        this.can_match = false
        const result = this.match()

        if (result > 0) this.set_timeout(650, () => {
            this.match_all()
        })
        else {
            this.can_match = true
            this.touchpad.interactive = true
            this.emit('match_completed', this.stat_destroys)
            this.stat_destroys = {}
        }
    }

    match_all_manual() {
        if (!this.can_match) return
        this.match_all()
    }

    anim_intial_drop(instant = false) {
        this.touchpad.interactive = false
        for (let x = 0; x < 7; x++) {
            for (let y = 0; y < 7; y++) {
                const tile = this.tiles_arr[x][y]
                const rune = this.runes_arr[x][y]

                rune.position.y = -this.border.height / 2

                const duration = (random_int(0, 1000) + (y - 7) * -1000) * 0.1

                if (instant) {
                    rune.y = tile.y
                    this.touchpad.interactive = true
                } else {
                    this.tween(rune)
                        .to({ y: tile.y }, 400 + (y * 40))
                        .easing(Easing.Quadratic.In)
                        .delay(duration)
                        .start()
                        .onComplete(() => {
                            this.touchpad.interactive = true
                        })
                }

            }
        }
    }

    anim_drop() {
        for (let x = 0; x < 7; x++) {
            for (let y = 0; y < 7; y++) {
                const tile = this.tiles_arr[x][y]
                const rune = this.runes_arr[x][y]

                if (distance_between_points(tile, rune) < 5) continue

                const delay = (random_int(0, 1000) + (y - 7) * -1000) * 0.01

                this.tween(rune)
                    .to({ y: tile.y }, 200 + (y * 10))
                    .easing(Easing.Quadratic.In)
                    .delay(delay)
                    .start()

            }
        }
    }

    resize(): void {
        const s = this.bw / (this.border.width / this.border.scale.x)
        this.scale.set(s)


        this.bh = (this.border.height) * s


        for (let x = 0; x < 7; x++) {
            for (let y = 0; y < 7; y++) {
                const s = this.tiles_arr[x][y]
                s.x = -this.border.width / 2 + 20 + (s.width / 2) + s.width * x
                s.y = -this.border.height / 2 + 87 + (s.height / 2) + s.height * y
            }
        }

        for (let x = 0; x < 7; x++) {
            for (let y = 0; y < 7; y++) {
                const tile = this.tiles_arr[x][y]
                const rune = this.runes_arr[x][y]

                rune.position.copyFrom(tile)
            }
        }

        this.msk
            .clear()
            .rect(0, 0, this.border.width - 40, this.border.height - 127)
            .fill('white')
        this.msk.position.x = -(this.border.width / 2 - 20)
        this.msk.position.y = -(this.border.height / 2 - 87)


        this.touchpad
            .clear()
            .rect(0, 0, this.border.width - 40, this.border.height - 127)
            .fill('white')
        this.touchpad.position.x = -(this.border.width / 2 - 20)
        this.touchpad.position.y = -(this.border.height / 2 - 87)

    }
}
