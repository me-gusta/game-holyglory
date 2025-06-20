import SceneSwitch from '$lib/SceneSwitch'
import S_Main from '$src/game/scenes/S_Main'
import S_LocationSelect from '$src/game/scenes/S_LocationSelect'
import S_Location from '$src/game/scenes/S_Location'
import S_Battle from '$src/game/scenes/S_Battle'
import S_Quests from './S_Quests'
import S_DailySpin from '$src/game/scenes/S_DailySpin.ts'
import S_FreeGems from '$src/game/scenes/S_FreeGems.ts'
import S_Summon from '$src/game/scenes/S_Summon.ts'
import S_Backpack from '$src/game/scenes/S_Backpack.ts'
import S_Shop from "$src/game/scenes/S_Shop.ts";
import S_Soon from "$src/game/scenes/S_Soon.ts";
import S_Settings from "$src/game/scenes/S_Settings.ts";
import S_Leaderboard from '$src/game/scenes/S_Leaderboard.ts'


export default class Scene extends SceneSwitch {
    // @ts-ignore
    scenes: Map<string, any> = new Map([
        ['main', S_Main],
        ['location_select', S_LocationSelect],
        ['location', S_Location],
        ['battle', S_Battle],
        ['quests', S_Quests],
        ['daily_spin', S_DailySpin],
        ['free_gems', S_FreeGems],
        ['summon', S_Summon],
        ['backpack', S_Backpack],
        ['shop', S_Shop],
        ['soon', S_Soon],
        ['settings', S_Settings],
        ['leaderboard', S_Leaderboard],
    ])
    initial = 'location'

    constructor() {
        super()
    }


    resize() {
        super.resize();
    }
}
