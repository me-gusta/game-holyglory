import store from "./store";

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
type AWEListener = <T>(upd: { current: T, previous: T }) => void
type Primitive = string | number | boolean

export class AWE {
    listeners = new Map<string, AWEListener[]>()

    get(path: string) {
        return getValueByPath(store, path)
    }

    set(path: string, value: Primitive) {
        const prev = getValueByPath(store, path)
        setValueByPath(store, path, value)
        const listeners = this.listeners.get(path)
        if (!listeners) return

        for (let i = 0; i < listeners.length; i++) {
            listeners[i]({
                current: value,
                previous: prev,
            })
        }
    }

    add(path: string, value: number) {
        const prev = getValueByPath(store, path)
        setValueByPath(store, path, prev + value)
        const listeners = this.listeners.get(path)
        if (!listeners) return

        for (let i = 0; i < listeners.length; i++) {
            listeners[i]({
                current: prev + value,
                previous: prev,
            })
        }
    }

    sub(path: string, value: number) {
        const prev = getValueByPath(store, path)
        setValueByPath(store, path, prev - value)
        const listeners = this.listeners.get(path)
        if (!listeners) return

        for (let i = 0; i < listeners.length; i++) {
            listeners[i]({
                current: prev - value,
                previous: prev,
            })
        }
    }

    listen(path: string, listener: AWEListener) {
        const current = this.listeners.get(path)
        if (current) {
            if (!current.includes(listener)) current.push(listener)
        } else {
            this.listeners.set(path, [listener])
        }
    }

    unlisten(path: string, listener: AWEListener) {
        const current = this.listeners.get(path)
        if (!current) return
        const index = current.indexOf(listener)
        if (index !== -1) current.splice(index, 1)
        if (current.length === 0) this.listeners.delete(path)
    }
}


