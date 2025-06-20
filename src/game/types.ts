export type Hero = {
    label: string
    is_unlocked: boolean
    name: string
    level: number
    bio: string
}

// export type Spell = {
//     label: string
//     is_unlocked: boolean
//     name: string
//     level: number
//     about: string
// }

export type BuyPack = {
    label: string
    amount: number
    item: string
    icon: string
    text: string
    price: {
        text: string
    }
}
