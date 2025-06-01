import { IPoint } from '$lib/Vector'
import { random_choice } from '$lib/random'
import { Container, Matrix, Point, RenderTexture } from 'pixi.js'

export const renderToTexture = (() => {
    const tParent = new Container()
    const tTransform = new Matrix()
    const tAnchor = new Point()
    const tPadding = new Point()

    return (
        object: Container,
        params: {
            padding?: IPoint | number,
            useObjectScale?: boolean,
            skipUpdate?: boolean,
        } = {},
    ) => {
        if (params.padding) {
            if (typeof params.padding === 'number') {
                tPadding.set(params.padding)
            } else {
                tPadding.copyFrom(params.padding)
            }
        }

        const skipUpdate = params.skipUpdate ?? false
        const useObjectScale = params.useObjectScale ?? false

        if (!skipUpdate) {
            if (!object.parent) object.parent = tParent
            object.updateTransform({})
        }

        let { width, height } = object

        let translateX: number
        let translateY: number
        if (useObjectScale) {
            translateX = tPadding.x / 2 / object.scale.x
            translateY = tPadding.y / 2 / object.scale.y
        } else {
            width /= object.scale.x
            height /= object.scale.y
            tPadding.x /= object.scale.x
            tPadding.y /= object.scale.y
            translateX = tPadding.x / 2
            translateY = tPadding.y / 2
        }

        if ('anchor' in object) tAnchor.copyFrom(object.anchor as any)

        translateX += width * tAnchor.x
        translateY += height * tAnchor.y

        tTransform.translate(translateX, translateY)
        if (useObjectScale) tTransform.scale(object.scale.x, object.scale.y)
        tTransform.append(object.worldTransform.clone().invert())

        const renderTexture = RenderTexture.create({ width: width + tPadding.x, height: height + tPadding.y })
        // @ts-ignore
        window.app.renderer.render(object, { renderTexture, transform: tTransform })

        // #region reset to default after render
        if (object.parent === tParent) object.parent = null as any
        tTransform.identity()
        tPadding.set(0)
        tAnchor.set(0)
        // #endregion

        return renderTexture
    }
})()



export const merge_objects = (obj1: any, obj2: any) => {
    const merged = { ...obj1 }  // Start with all keys from obj1

    for (const key in obj2) {
        if (Array.isArray(obj2[key]) && Array.isArray(obj1[key])) {
            // Merge arrays if both objects have the key with array values
            merged[key] = [...obj1[key], ...obj2[key]]
        } else {
            // Otherwise, just take the value from obj2 (it might be a new key or a non-array)
            merged[key] = obj2[key]
        }
    }

    return merged
}

export function randomPointInCircle(center: IPoint, radius: number) {
    // Generate a random angle in radians
    const angle = Math.random() * 2 * Math.PI;

    // Generate a random radius, with square root to ensure uniform distribution
    const r = Math.sqrt(Math.random()) * radius;

    // Convert polar coordinates to Cartesian coordinates and offset by center
    const x = center.x + r * Math.cos(angle);
    const y = center.y + r * Math.sin(angle);

    return { x, y };
}

export function isPointInCircle(circlePosition: IPoint, radius: number, pointPosition: IPoint) {
    // Calculate the distance between the circle's center and the point
    const dx = pointPosition.x - circlePosition.x;
    const dy = pointPosition.y - circlePosition.y;
    const distanceSquared = dx * dx + dy * dy;

    // Check if the distance is less than or equal to the square of the radius
    return distanceSquared <= radius * radius;
}

export function calculate_bumper_level(stats: any) {
    if (Object.keys(stats).length === 0) {
        return 1
    }

    return Number(random_choice(Object.keys(stats)))
}

export const detect_circle_intersection = (pos_a: { x: number, y: number }, radius_a: number, pos_b: { x: number, y: number }, radius_b: number): boolean => {
    const distance = Math.sqrt((pos_b.x - pos_a.x) ** 2 + (pos_b.y - pos_a.y) ** 2)
    return distance < radius_a + radius_b
}

export function mapRange(value: number, inputMin: number, inputMax: number, targetMin: number, targetMax: number) {
    // Map the value proportionally from the input range to the target range
    return targetMin + (value - inputMin) * (targetMax - targetMin) / (inputMax - inputMin);
}

export const pretty_n = (n: number) => {
    if (n > 1000000) {
        return Math.floor(n / 100000) + 'M'
    } else if (n > 10000) {
        return Math.floor(n / 1000) + 'k'
    } else if (n > 1000) {
        return (n / 1000).toFixed(1) + 'k'
    } else return n.toString()
}


export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export const rad2deg = (radians: number): number => radians * (180 / Math.PI)

export const deg2rad = (degrees: number): number => degrees * (Math.PI / 180)

export const rad2sector = (radians: number): number => {
    // 1 - right
    // 2 - down
    // 3 - left
    // 4 - up
    const two_pi = 2 * Math.PI
    let normalized_radians = ((radians % two_pi) + two_pi) % two_pi

    const r45 = Math.PI / 4
    const r135 = 3 * Math.PI / 4
    const r225 = 5 * Math.PI / 4
    const r315 = 7 * Math.PI / 4

    if (normalized_radians <= r45 || normalized_radians > r315) return 1
    if (normalized_radians <= r135) return 2
    if (normalized_radians <= r225) return 3
    return 4
}

export function chunk(array: any[], size: number) {
    if (!Array.isArray(array)) throw new TypeError('Input must be an array');
    if (size <= 0) throw new RangeError('Chunk size must be greater than 0');
    const result: any[] = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

export function push_until(arr: any[], value: any, size: number) {
    if (arr.length < size) {
        arr.push(...Array(size - arr.length).fill(value));
    }
    return arr;
}

export const mutable_filter = <T>(array: T[], predicate: (value: T, index: number, array: T[]) => boolean): T[] => {
    let writeIndex = 0;
    
    for (let readIndex = 0; readIndex < array.length; readIndex++) {
        if (predicate(array[readIndex], readIndex, array)) {
            array[writeIndex] = array[readIndex];
            writeIndex++;
        }
    }
    
    array.length = writeIndex;
    return array;
};

export const distance_between_points = (a: IPoint, b: IPoint): number => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
}; 

export const sum = (numbers: number[]): number => {
    return numbers.reduce((acc, curr) => acc + curr, 0);
}