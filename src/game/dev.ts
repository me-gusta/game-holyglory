// @ts-nocheck

const dev = {
    DISABLE_AUTOSWAP: false,
    PREVENT_SAVE: true,
    INVULNERABLE_HERO: false,
    INSTANT_KILL: true,
}

window.dev = (key: any, value: any) => {
    dev[key] = value
}

export default dev

