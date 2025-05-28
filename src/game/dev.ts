// @ts-nocheck

const dev = {
    DISABLE_AUTOSWAP: false
}

window.dev = (key: any, value: any) => {
    dev[key] = value
}

export default dev

