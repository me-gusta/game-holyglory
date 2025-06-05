import { AnimatedSprite, Assets, Container, Graphics, Point, Sprite, Spritesheet, Text, TextOptions, Texture } from "pixi.js";
import colors from '$src/game/colors'
import { IPoint, Vector } from '$lib/Vector'
import AssetManager from '$lib/AssetManager'

export const create_sprite = (name?: string) => {
    const x = name ? Sprite.from(name) : new Sprite()
    x.anchor.set(0.5, 0.5)
    return x
}


export const create_text = (options: TextOptions) => {
    if (!options.style) options.style = {}
    if (!options.style.fontFamily) {
        options.style.fontFamily = 'flame'
    }
    if (!options.style.fill) {
        options.style.fill = colors.bright
    }
    const x = new Text(options)
    x.anchor.set(0.5, 0.5)
    return x
}

export const create_animated_sprite = (name: string) => {
    const animation = AssetManager.get(name)
    const a = new AnimatedSprite(animation)
    a.anchor.set(0.5, 0.5)
    a.animationSpeed = 0.2
    return a
}

export const create_point = (x?: number, y?: number) => {
    return new Point(x, y)
}

export const create_vector = (x?: number | IPoint, y?: number) => {
    if (typeof x === 'number' || x === undefined) {
        return new Vector(x, y)
    }
    return Vector.fromPoint(x)
}

export const create_graphics = () => new Graphics()


export const create_fx = (name: string, where: Container, pos_global: IPoint) => {
    const pos = where.toLocal(pos_global)
    const textures = AssetManager.get(name)
    const sprite = new AnimatedSprite(textures)
    sprite.texture.source.scaleMode = 'nearest'
    sprite.loop = false
    sprite.position.copyFrom(pos)
    where.addChild(sprite)
    sprite.animationSpeed = 0.8
    sprite.onFrameChange = (n: number) => {
        if (n === textures.length - 1) sprite.destroy()
    }
    sprite.anchor.set(0.5)
    sprite.scale.set(4)
    sprite.gotoAndPlay(0)
    return sprite
}