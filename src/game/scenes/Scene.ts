import SceneSwitch from '$lib/SceneSwitch'
import S_Room from '$src/game/scenes/S_Room'



export default class Scene extends SceneSwitch {
    // @ts-ignore
    scenes: Map<string, any> = new Map([
        // ['plinko', S_test_mechanics],
        ['room', S_Room],
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
