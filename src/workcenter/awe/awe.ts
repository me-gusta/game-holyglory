function parsePath(path: string): (string | number)[] {
    const result: (string | number)[] = [];
    let token = '', inBracket = false;

    for (let i = 0; i < path.length; i++) {
        const char = path[i];

        if (char === '.' && !inBracket) {
            if (token) result.push(token);
            token = '';
        } else if (char === '[') {
            if (token) result.push(token);
            token = '';
            inBracket = true;
        } else if (char === ']') {
            if (token) {
                const index = Number(token);
                result.push(isNaN(index) ? token : index);
            }
            token = '';
            inBracket = false;
        } else {
            token += char;
        }
    }

    if (token) result.push(token);
    return result;
}


function getValueByPath(obj: any, path: string): any {
    const parts = parsePath(path);
    let current = obj;

    for (let i = 0; i < parts.length; i++) {
        if (current == null) return undefined;
        current = current[parts[i]];
    }

    return current;
}


function setValueByPath(obj: any, path: string, value: any): boolean {
    const parts = parsePath(path);
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];

        if (current[key] == null || typeof current[key] !== 'object') {
            current[key] = typeof parts[i + 1] === 'number' ? [] : {};
        }

        current = current[key];
    }

    current[parts[parts.length - 1]] = value;
    return true;
}


///


type Store = {
    player: Player
}

type Player = {
    level: number
    username: string
    children: { name: string, age: number }[]
}

export const store: Store = {
    player: {
        level: 1,
        username: 'player.username',
        children: [
            {name: 'player.children[0].name', age: 101},
            {name: 'player.children[1].name', age: 102},
            {name: 'player.children[2].name', age: 103},
        ],
    },
}

export const world: Store = {
    player: {
        level: 4,
        username: 'Jessica',
        children: [
            {name: 'Alex', age: 6},
            {name: 'John', age: 7},
            {name: 'Sparrow', age: 10},
        ],
    },
}

const map_numbers_to_path: { [key: number]: string } = {
    1: 'player.level',
    101: 'player.children[0].age',
    102: 'player.children[1].age',
    103: 'player.children[2].age',
}

type AWEListener = <T>(upd: { current: T, previous: T }) => void

export class AWE {
    listeners = new Map<string, AWEListener[]>()

    get<T extends string | number>(where: T) {
        let path: string
        if (typeof where === 'number') path = map_numbers_to_path[where]
        else path = where

        return getValueByPath(world, path)
    }

    set<T extends string | number>(where: T, value: T) {
        let path: string
        if (typeof where === 'number') path = map_numbers_to_path[where]
        else path = where

        const prev = getValueByPath(world, path)
        setValueByPath(world, path, value)
        const listeners = this.listeners.get(path)
        if (!listeners) return

        for (let i = 0; i < listeners.length; i++) {
            listeners[i]({
                current: value,
                previous: prev,
            })
        }
    }

    add(where: number, value: number) {
        let path: string = map_numbers_to_path[where]

        const prev = getValueByPath(world, path)
        setValueByPath(world, path, prev + value)
        const listeners = this.listeners.get(path)
        if (!listeners) return

        for (let i = 0; i < listeners.length; i++) {
            listeners[i]({
                current: prev + value,
                previous: prev,
            })
        }
    }

    sub(where: number, value: number) {
        let path: string = map_numbers_to_path[where]

        const prev = getValueByPath(world, path)
        setValueByPath(world, path, prev - value)
        const listeners = this.listeners.get(path)
        if (!listeners) return

        for (let i = 0; i < listeners.length; i++) {
            listeners[i]({
                current: prev - value,
                previous: prev,
            })
        }
    }

    listen(where: string|number, listener: AWEListener) {
        let path: string
        if (typeof where === 'number') path = map_numbers_to_path[where]
        else path = where

        const current = this.listeners.get(path)
        if (current) {
            if (!current.includes(listener)) current.push(listener)
        } else {
            this.listeners.set(path, [listener])
        }
    }

    unlisten(where: string|number, listener: AWEListener) {
        let path: string
        if (typeof where === 'number') path = map_numbers_to_path[where]
        else path = where

        const current = this.listeners.get(path)
        if (!current) return
        const index = current.indexOf(listener)
        if (index !== -1) current.splice(index, 1)
        if (current.length === 0) this.listeners.delete(path)
    }
}


const test_deep_array = () => {
    const awe = new AWE()

    console.log(world)
    console.log(world.player.children[2].age)

    awe.listen(store.player.children[2].age, (upd) => {
        console.log('upd', upd)
    })

    awe.add(store.player.children[2].age, 2)

    console.log(world)
    console.log(world.player.children[2].age)
}


