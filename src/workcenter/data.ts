type Reward = {
    label: string
    amount: number
}

type Maybe<T> = T | null


///
type Store = {
    player: Player
    stats: Stats

    setting: Settings

    quest_list: QuestList
    quest_partner_list: QuestPartnerList

    spin_data: SpinData

    hero_selected: HeroSelected
    hero_list: HeroList

    spell_list: SpellList
    spell_equipped_list: SpellEquippedList

    shop_item_list: ShopItemList
    location_list: LocationList
}

type Player = {
    level: number
    exp_current: number
    exp_next: number
    crowns: number
    username: string
    avatar: string
}

type Stats = {
    coins: number
    gems: number
    energy: number
}

type Settings = {
    is_music_on: number
    is_sound_on: number
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
    'level_up'

type Quest = {
    reward: Reward
    task: QuestTask
    task_current: number
    task_needed: number
}


type QuestPartnerList = QuestPartner[]
type QuestPartner = {
    reward: Reward
    task: 'subscribe_tg_channel' | 'subscribe_tiktok'
    link: string
}

type SpinData = {
    rewards: Reward[]
    spins: number
}

type HeroSelected = string
type HeroList = Hero[]
type Hero = {
    label: string
    is_unlocked: boolean
    name: string
    level: number
    bio: string
    level_up_price: number
    buy_price: number
}

type SpellEquippedList = [Maybe<string>, Maybe<string>, Maybe<string>]
type SpellList = Spell[]
type Spell = {
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
type Battle = {
    waves: Wave[]
    is_captured: boolean
}
type Wave = [Maybe<Mob>, Maybe<Mob>, Maybe<Mob>]
type Mob = {
    label: string
    level: number
}
