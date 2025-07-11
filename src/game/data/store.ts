import store_json from './store.json'
import dev from '$src/game/dev.ts'

export type Reward = {
    label: string
    amount: number
}

export type Maybe<T> = T | null

//
type Store = {
    player: Player
    stats: Stats

    setting: Settings

    quest_complete_5: Quest
    quest_list: QuestList
    quest_partner_list: QuestPartnerList

    spin_data: SpinData

    hero_selected: HeroSelected
    hero_list: HeroList

    spell_list: SpellList
    spell_equipped_list: SpellEquippedList

    shop_item_list: ShopItemList
    location_list: LocationList
    current_location: number
    current_battle: number
    soon_triggered: string
}

type Player = {
    level: number
    exp_current: number
    exp_next: number
    crowns: number
    username: string
    avatar: string
    leaderboard_place: number
}

type Stats = {
    coins: number
    gems: number
    energy: number
}

type Settings = {
    is_music_on: boolean
    is_sound_on: boolean
}

type QuestList = Quest[]

type QuestTask = 'collect_rune' |
    'collect_rune_fire' |
    'collect_rune_water' |
    'collect_rune_plant' |
    'collect_rune_light' |
    'collect_rune_dark' |
    'kill_mob' |
    'complete_level' |
    'play_roulette' |
    'cast_spell' |
    'complete_5'

export type Quest = {
    reward: Reward
    task: QuestTask
    task_current: number
    task_needed: number
    is_claimed: boolean
}


type QuestPartnerList = QuestPartner[]
export type QuestPartner = {
    reward: Reward
    task: 'subscribe_tg_channel' | 'subscribe_tiktok'
    link: string
    is_claimed: boolean
    is_visited: boolean
}

type SpinData = {
    rewards: Reward[]
    spins: number
}

type HeroSelected = string
type HeroList = Hero[]
export type Hero = {
    label: string
    is_unlocked: boolean
    name: string
    level: number
    bio: string
    level_up_price: number
    buy_price: number
}

type SpellEquippedList = Maybe<string>[]
type SpellList = Spell[]
export type Spell = {
    label: string
    is_unlocked: boolean
    name: string
    level: number
    about: string
    level_up_price: number
    buy_price: number
    rune: string
    runes_needed: number
}

type ShopItemList = ShopItem[]
type ShopItem = {
    reward: Reward
    text: string
    price: number
}

type LocationList = Location[]
type Location = {
    title: string
    tile_images_folder: string
    card_image: string
    battles: Battle[]
    is_unlocked: boolean
}
export type Battle = {
    waves: Wave[]
    is_captured: boolean
}
type Wave = Maybe<Mob>[]
type Mob = {
    label: string
    level: number
}

let store: Store

export const save = () => {
    if (dev.PREVENT_SAVE) return

    localStorage.setItem('hogl-store', JSON.stringify(store))
}

export const load = () => {
    const store_string = localStorage.getItem('hogl-store')
    if (store_string) {
        store = JSON.parse(store_string) as Store
    } else {
        store = store_json as Store
    }
}

load()

export default store! as Store
