class Store {
    locations: {[key: string]: any} = {}
    battles: {[key: string]: any} = {}
    waves: {[key: string]: any} = {}
    mobs: {[key: string]: any} = {}
    battle_party: {[key: string]: any} = {}

    current_location: string = "68346741c2572db90139cc1a"
    current_battle: string = "6834a9e6a48d909121977a2d"

    constructor() {
        const files = import.meta.glob('../game/data/*.json', { eager: true })

        for (const path in files) {
            const label = path
                .replace('../game/data/','')
                .replace('.json','')
            console.log(`store loaded ${label}`);

            // @ts-ignore
            this[label] = (files[path] as any).default
        }
    }

    async load_user_data() {
        const files = import.meta.glob('../game/data_loaded/*.json', { eager: true })

        for (const path in files) {
            const label = path
                .replace('../game/data_loaded/','')
                .replace('.json','')
            console.log(`store loaded user data ${label}`);
            const obj = (files[path] as any).default
            // @ts-ignore
            let scope = this[label]
            if (!scope) {
                this[label] = ""
                scope = this[label]
            }

            for (let eid in obj) {
                if (scope[eid]) Object.assign(scope[eid], obj[eid])
                else {
                    scope[eid] = obj[eid]
                }
            }

            console.log(this);
            
        }
        console.log('----- </store> -----')
    }
}

export default new Store()