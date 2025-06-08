import SceneSwitch from '$lib/SceneSwitch'
import S_Main from '$src/game/scenes/S_Main'
import S_LocationSelect from '$src/game/scenes/S_LocationSelect'
import S_Location from '$src/game/scenes/S_Location'
import S_Battle from '$src/game/scenes/S_Battle'
import S_Quests from './S_Quests'
import S_DailySpin from '$src/game/scenes/S_DailySpin.ts'
import S_FreeGems from '$src/game/scenes/S_FreeGems.ts'
import S_Summon from '$src/game/scenes/S_Summon.ts'


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
    ])
    initial = 'summon'

    constructor() {
        super()
    }


    resize() {
        super.resize();
    }
}
