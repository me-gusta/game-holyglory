
import seedrandom from 'seedrandom'
import path from 'path'
import fs from 'fs'

type IPoint = { x: number, y: number }
type Rune = { suit: string, variant: string }

type Store = {
    friends: (any | null)[];
    skills: {
        label: string;
        level: number;
    }[];
    waves: (any | null)[][];
    rng_key: string;
    grid: Rune[][];
    target: number;
    current_wave: number;
}

const characters = {
    "leonard": {
        1: {
            "hp_max": 60,
            "damage": 3
        },
        "x": (level: number) => ({
            "hp_max": Math.ceil(60 + level * 4.2),
            "damage": Math.ceil(3 + level * 2.2),
        })
    },
    "skeleton": {
        1: {
            "hp_max": 20,
            "damage": 1
        },
        "x": (level: number) => ({
            "hp_max": Math.ceil(20 + level * 4.2),
            "damage": Math.ceil(1 + level * 2.2),
        })
    },
    "wolf": {
        1: {
            "hp_max": 15,
            "damage": 2
        },
        "x": (level: number) => ({
            "hp_max": Math.ceil(15 + level * 4.2),
            "damage": Math.ceil(2 + level * 2.2),
        })
    },
}


const store: Store = {
    "friends": [
        {
            "label": "leonard",
            "level": 1,
        },
        {
            "label": "leonard",
            "level": 3,
        },
        null
    ],
    "skills": [
        {
            "label": "sun_sneeze",
            "level": 4
        }
    ],
    "waves": [
        [
            null,
            {
                "label": "skeleton",
                "level": 1
            },
            {
                "label": "wolf",
                "level": 2
            }
        ],
        [
            null,
            {
                "label": "skeleton",
                "level": 1
            },
            {
                "label": "wolf",
                "level": 2
            }
        ]
    ],
    "rng_key": "683caf997a03d422bf4205b8",
    "grid": [],
    "target": -1,
    "current_wave": 0
}

// ----- system -----


const clearStoreFolder = () => {
    const dir = path.join(process.cwd(), 'src', 'workcenter', 'store');

    // Check if directory exists
    if (fs.existsSync(dir)) {
        // Read all files in the directory
        const files = fs.readdirSync(dir);

        // Remove each file
        for (const file of files) {
            fs.unlinkSync(path.join(dir, file));
        }
    }
}

const write = (data) => {

    const dir = path.join(process.cwd(), 'src', 'workcenter', 'store');

    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Read directory and find highest number
    const files = fs.readdirSync(dir);
    const numbers = files
        .filter(f => f.match(/^\d+\.json$/))
        .map(f => parseInt(f));

    const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 0;
    const fileName = `${nextNum}.json`;

    // Write the file
    fs.writeFileSync(
        path.join(dir, fileName),
        JSON.stringify(data, null, 2)
    );

    return fileName
}

clearStoreFolder()

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

const mutable_filter = <T>(array: T[], predicate: (value: T, index: number, array: T[]) => boolean): T[] => {
    let writeIndex = 0;

    for (let readIndex = 0; readIndex < array.length; readIndex++) {
        if (predicate(array[readIndex], readIndex, array)) {
            array[writeIndex] = array[readIndex];
            writeIndex++;
        }
    }

    array.length = writeIndex;
    return array;
}

const sum = (numbers: number[]): number => {
    return numbers.reduce((acc, curr) => acc + curr, 0);
}

const is_char_ok = el => el !== null && el.is_dead === false

// ----- on_create -----
const rune_suits = ['fire', 'water', 'plant', 'dark', 'light']
const rng = seedrandom(store.rng_key)

function random_choice(items) {
    return items[Math.floor(rng() * items.length)]
}

const gen_rune = () => {
    return {
        suit: random_choice(rune_suits),
        variant: 'normal'
    }
}

const MAX_GRID_SIZE = 7

// create grid
for (let x = 0; x < MAX_GRID_SIZE; x++) {
    const column: any[] = []
    for (let y = 0; y < MAX_GRID_SIZE; y++) {
        column.push(gen_rune())
    }
    store.grid.push(column)
}

// remove matches
while (true) {
    const matches = find_matches(store.grid)
    for (let group of matches) {
        for (let i = 0; i < group.length - 1; i++) {
            const gp = group[i]
            store.grid[gp.x][gp.y] = gen_rune()
        }
    }
    if (matches.length === 0) break
}

// add Characters

for (let i = 0; i < store.friends.length; i++) {
    if (!store.friends[i]) continue
    const { label, level } = store.friends[i]
    const cfg = characters[label]
    const stats = cfg[level]
    if (stats) Object.assign(store.friends[i], stats)
    else Object.assign(store.friends[i], cfg["x"](level))
    Object.assign(store.friends[i], {
        "is_dead": false,
        "hp_current": store.friends[i].hp_max
    })
}

for (let w = 0; w < store.waves.length; w++) {
    const wave = store.waves[w]
    for (let i = 0; i < wave.length; i++) {
        if (!wave[i]) continue
        const { label, level } = wave[i]
        const cfg = characters[label]
        const stats = cfg[level]
        if (stats) Object.assign(wave[i], stats)
        else Object.assign(wave[i], cfg["x"](level))
        Object.assign(wave[i], {
            "is_dead": false,
            "hp_current": wave[i].hp_max
        })
    }
}

write(store)

// ----- actions -----

const tr_swap = (gp_from: IPoint, gp_to: IPoint, grid: any) => {
    const rune_from = grid[gp_from.x][gp_from.y]
    const rune_to = grid[gp_to.x][gp_to.y]

    const tmp = rune_from
    grid[gp_from.x][gp_from.y] = rune_to
    grid[gp_to.x][gp_to.y] = tmp
}

const tr_match = (grid) => {
    const stat_destroys: any = {}

    const match = () => {
        const matches = find_matches(grid)
        if (matches.length === 0) return 0

        // identify conversion to special runes
        const runes_affected = new Map()

        for (let group of matches) {
            for (let i = 0; i < group.length; i++) {
                const gp = group[i]
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
            const rune = grid[x][y]

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


        // destroy all runes that need to be destroyed && convert special runes
        for (let [key, { score, variant_new }] of runes_affected.entries()) {
            const [x, y] = key.split(';').map(Number)
            const rune = grid[x][y]

            if (score >= 2) {
                rune.variant = 'cross'
            } else if (variant_new != rune.variant && variant_new !== 'normal') {
                rune.variant = variant_new
            } else {
                stat_destroys[rune.suit] = (stat_destroys[rune.suit] || 0) + 1

                // @ts-ignore
                grid[x][y] = null

            }
        }


        // fill in gaps
        for (let x = 0; x < grid.length; x++) {
            const column = grid[x]

            const amount_nulls = column.filter(item => item === null).length
            mutable_filter(column, item => item !== null)

            for (let i = 0; i < amount_nulls; i++) {
                const rune = gen_rune()
                column.unshift(rune)
            }
        }
        return matches.length
    }



    while (match()) {
    }

    return stat_destroys
}

const tr_friends_attack = (stat_destroys: any) => {
    const rune_power = sum(Object.values(stat_destroys))

    if (!rune_power) return

    const wave = store.waves[store.current_wave]

    const friends = store.friends
        .filter(is_char_ok)
    const enemies = wave
        .filter(is_char_ok)

    const amount_friends = friends.length
    const amount_enemies = enemies.length

    if (amount_friends === 0 || amount_enemies === 0) return

    for (let i = 0; i < friends.length; i++) {
        const friend = friends[i]
        let enemy = enemies[i]
        if (!enemy) {
            enemy = enemies[i - 1]
            if (!enemy) {
                enemy = enemies[i - 2]
            }
        }

        enemy.hp_current -= friend.damage * rune_power
        console.log(enemy)
    }

    for (let enemy of enemies) {
        if (enemy.hp_current <= 0) {
            enemy.hp_current = 0
            enemy.is_dead = true
        }
    }
}


const tr_enemies_attack = () => {
    const wave = store.waves[store.current_wave]

    const friends = store.friends
        .filter(is_char_ok)
    const enemies = wave
        .filter(is_char_ok)

    const amount_friends = friends.length
    const amount_enemies = enemies.length

    if (amount_friends === 0 || amount_enemies === 0) return

    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i]
        let friend = friends[i]
        if (!friend) {
            friend = friends[i - 1]
            if (!enemy) {
                friend = friends[i - 2]
            }
        }

        friend.hp_current -= enemy.damage
    }

    for (let friend of friends) {
        if (friend.hp_current <= 0) {
            friend.hp_current = 0
            friend.is_dead = true
        }
    }
}



// ----- automation -----

const find_best_match = (grid_original) => {
    const grid = [...grid_original]
    let bestScore = 0
    let bestMove = null

    // Helper to check if a point is within grid bounds
    const isValidPoint = (x: number, y: number) =>
        x >= 0 && x < grid.length && y >= 0 && y < grid[0].length

    // Helper to count total destructions from stat_destroys object
    const countDestructions = (stat_destroys: any) =>
        Object.values(stat_destroys).reduce((sum: number, count: number) => sum + count, 0)

    // Try each possible swap
    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid[x].length; y++) {
            // Check right neighbor
            if (isValidPoint(x + 1, y)) {
                tr_swap(
                    { x, y },
                    { x: x + 1, y },
                    grid
                )
                const stat_destroys = tr_match(grid)
                tr_swap(
                    { x, y },
                    { x: x + 1, y },
                    grid
                )
                const score = countDestructions(stat_destroys)

                if (score > bestScore) {
                    bestScore = score
                    bestMove = {
                        from: { x, y },
                        to: { x: x + 1, y }
                    }
                }
            }

            // Check bottom neighbor
            if (isValidPoint(x, y + 1)) {
                tr_swap(
                    { x, y },
                    { x: x, y: y + 1 },
                    grid
                )
                const stat_destroys = tr_match(grid)
                tr_swap(
                    { x, y },
                    { x: x, y: y + 1 },
                    grid
                )
                const score = countDestructions(stat_destroys)

                if (score > bestScore) {
                    bestScore = score
                    bestMove = {
                        from: { x, y },
                        to: { x, y: y + 1 }
                    }
                }
            }
        }
    }

    return bestMove
}

const main = () => {
    for (let i = 0; i < 20; i++) {
        const match = find_best_match(store.grid)
        console.log(match)
        if (!match) {
            console.log('no matches')
            return
        }
        const { from, to } = match

        tr_swap(from, to, store.grid)
        const stat_destroys = tr_match(store.grid)
        write(store)
        tr_friends_attack(stat_destroys)
        tr_enemies_attack()

        const fa = write(store)
        console.log('friends attack', fa)

        if (store.friends.filter(is_char_ok).length === 0) {
            console.log('enemies won')
            break
        }

        const wave = store.waves[store.current_wave]
        if (wave.filter(is_char_ok).length === 0) {
            if (store.waves.length - 1 === store.current_wave) {
                console.log('friends won')
                break
            } else {
                store.current_wave += 1
                console.log('next wave')
            }
        }
    }
}
// https://www.npmjs.com/package/@pixi/node  npm install @pixi/node
main()