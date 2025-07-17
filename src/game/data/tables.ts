export const table_mobs = {
    "wolf": {
        "label": "wolf",
        "rune": null,
        "levels": (x) => {
            return {
                "hp_max": Math.round(130 + x * 110.7),
                "attack": Math.round(9 + x * 7.7)
            }
        }
    },
    "skeleton": {
        "label": "skeleton",
        "rune": "fire",
        "levels": (x) => {
            return {
                "hp_max": Math.round(43 + x * 2.7),
                "attack": Math.round(21 + x * 4.7)
            }
        }
    },
    "leonard": {
        "label": "leonard",
        "rune": null,
        "levels": (x) => {
            return {
                "hp_max": Math.round(143 + x * 2.7),
                "attack": Math.round(21 + x * 4.7)
            }
        }
    },
    "maximus": {
        "label": "maximus",
        "rune": null,
        "levels": (x) => {
            return {
                "hp_max": Math.round(143 + x * 2.7),
                "attack": Math.round(21 + x * 4.7)
            }
        }
    }
}

export const table_battles_loot = {
    0: (battle_eid) => {
        return Math.round(5 + 7.7 * battle_eid)
    }
}
