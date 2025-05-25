import SceneSwitch from '$lib/SceneSwitch'
import S_Main from '$src/game/scenes/S_Main'
import S_LocationSelect from '$src/game/scenes/S_LocationSelect'
import S_Location from '$src/game/scenes/S_Location'



export default class Scene extends SceneSwitch {
    // @ts-ignore
    scenes: Map<string, any> = new Map([
        // ['plinko', S_test_mechanics],
        ['room', S_Location],
    ])
    // pause = new S_Pause()
    initial = 'room'

    constructor() {
        super()

        this.on('enable_pause', () => {
            // this.pause.visible = true
        })
        // this.addChild(this.pause)
        // this.pause.zIndex = 10
    }


    resize() {
        super.resize();
        // this.pause.resize()
    }
}
