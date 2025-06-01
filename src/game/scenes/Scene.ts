import SceneSwitch from '$lib/SceneSwitch'
import S_Main from '$src/game/scenes/S_Main'
import S_LocationSelect from '$src/game/scenes/S_LocationSelect'
import S_Location from '$src/game/scenes/S_Location'
import S_Battle from '$src/game/scenes/S_Battle'


export default class Scene extends SceneSwitch {
    // @ts-ignore
    scenes: Map<string, any> = new Map([
        ['main', S_Main],
        ['location_select', S_LocationSelect],
        ['location', S_Location],
        ['battle', S_Battle],
    ])
    initial = 'main'

    constructor() {
        super()
    }


    resize() {
        super.resize();
    }
}
