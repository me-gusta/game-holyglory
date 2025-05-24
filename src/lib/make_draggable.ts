import {Container, EventEmitter, FederatedPointerEvent} from 'pixi.js'

export default (el: Container) => {
    let dead_zone = 20
    let dragging = false
    let initial_pos: { x: number, y: number } | null = null
    
    el.interactive = true
    let pointerId = -1
    const on_drag_start = (event: FederatedPointerEvent) => {
        if (pointerId !== -1) return
        // console.log('on_drag_start', event.pointerId)
        initial_pos = { x: event.global.x, y: event.global.y }
        pointerId = event.pointerId
    }

    const on_drag_move = (event: FederatedPointerEvent) => {
        if (pointerId !== event.pointerId) return
        // console.log('on_drag_move', event.pointerId)

        if (!dragging && initial_pos) {
            const dx = event.global.x - initial_pos.x
            const dy = event.global.y - initial_pos.y
            if (Math.sqrt(dx * dx + dy * dy) >= dead_zone) {
                dragging = true
                el.emit('dragstart', event)
            }
        }

        if (dragging) {
            el.emit('dragmove', event)
        }
    }

    const on_drag_end = (event: FederatedPointerEvent) => {
        if (pointerId === event.pointerId) {
            // console.log('on_drag_end', event.pointerId)
            if (dragging) {
                el.emit('dragend', event)
            }
            pointerId = -1
            dragging = false
            initial_pos = null
        }
    }

    el.on('pointerdown', on_drag_start)
    el.on('pointermove', on_drag_move)
    el.on('pointerup', on_drag_end)
    el.on('pointerupoutside', on_drag_end)
    // el.on('pointerout', on_drag_end)
}
