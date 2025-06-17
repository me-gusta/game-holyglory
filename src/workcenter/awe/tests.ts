import {AWE, store, world} from './awe.ts'

const test_string = () => {
    const awe = new AWE()

    console.log(world.player.username === 'Jessica')

    awe.listen(store.player.username, (upd) => {
        console.log('upd', upd.previous === 'Jessica')
        console.log('upd', upd.current === 'Monica')

    })

    awe.set(store.player.username, 'Monica')

    console.log(world.player.username === 'Monica')
}

const test_string_array = () => {
    const awe = new AWE()

    console.log(world.player.children[1])
    console.log(world.player.children[1].name === 'John')

    awe.listen(store.player.children[1].name, (upd) => {
        console.log('upd', upd)
        console.log('upd', upd.previous === 'John')
        console.log('upd', upd.current === 'Mister')

    })

    awe.set(store.player.children[1].name, 'Mister')

    console.log(world.player.children[1].name === 'Mister')
}


const test_number_set = () => {
    const awe = new AWE()

    console.log(world.player.level)
    console.log(world.player.level === 4)

    awe.listen(store.player.level, (upd) => {
        console.log('upd', upd)
        console.log('upd', upd.previous === 4)
        console.log('upd', upd.current === 6)

    })

    awe.set(store.player.level, 6)

    console.log(world.player.level === 6)
}

const test_number_add = () => {
    const awe = new AWE()

    console.log(world.player.level)
    console.log(world.player.level === 4)

    awe.listen(store.player.level, (upd) => {
        console.log('upd', upd)
        console.log('upd', upd.previous === 4)
        console.log('upd', upd.current === 10)

    })

    awe.add(store.player.level, 6)

    console.log(world.player.level === 10)
}


const test_number_sub = () => {
    const awe = new AWE()

    console.log(world.player.level)
    console.log(world.player.level === 4)

    awe.listen(store.player.level, (upd) => {
        console.log('upd', upd)
        console.log('upd', upd.previous === 4)
        console.log('upd', upd.current === -2)

    })

    awe.sub(store.player.level, 6)

    console.log(world.player.level === -2)
}



const test_number_set_array = () => {
    const awe = new AWE()

    console.log(world.player.children[1])
    console.log(world.player.children[1].age === 7)

    awe.listen(store.player.children[1].age, (upd) => {
        console.log('upd', upd)
        console.log('upd', upd.previous === 7)
        console.log('upd', upd.current === 10)

    })

    awe.set(store.player.children[1].age, 10)

    console.log(world.player.children)
    console.log(world.player.children[1].age === 10)
}



const test_number_add_array = () => {
    const awe = new AWE()

    console.log(world.player.children[1])
    console.log(world.player.children[1].age === 7)

    awe.listen(store.player.children[1].age, (upd) => {
        console.log('upd', upd)
        console.log('upd', upd.previous === 7)
        console.log('upd', upd.current === 17)

    })

    awe.add(store.player.children[1].age, 10)

    console.log(world.player.children)
    console.log(world.player.children[1].age === 17)
}


const test_number_sub_array = () => {
    const awe = new AWE()

    console.log(world.player.children[1])
    console.log(world.player.children[1].age === 7)

    awe.listen(store.player.children[1].age, (upd) => {
        console.log('upd', upd)
        console.log('upd', upd.previous === 7)
        console.log('upd', upd.current === -3)

    })

    awe.sub(store.player.children[1].age, 10)

    console.log(world.player.children)
    console.log(world.player.children[1].age === -3)
}


test_number_sub_array()
