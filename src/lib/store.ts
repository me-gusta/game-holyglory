class Store {
    locations: {[key: string]: any} = {}
    battles: {[key: string]: any} = {}

    selected_location: string = "68346741c2572db90139cc1a"

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
            const scope = this[label]

            for (let eid in obj) {
                Object.assign(scope[eid], obj[eid])
            }

            console.log(this);
            
        }
    }
}

export default new Store()