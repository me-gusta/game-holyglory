import {Reward} from "./data/store";

export const get_reward_icon = (r: Reward) => {
    if (r.label === 'coins') return 'icons/coin'
    if (r.label === 'gems') return 'icons/gem'
    throw new Error(`unknown reward: ${JSON.stringify(r)}`)
}