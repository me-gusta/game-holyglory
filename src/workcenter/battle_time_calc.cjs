const seedrandom = require('seedrandom')
const path = require('path');
const fs = require('fs');

const store = {
    "friends": [
        null,
        {
            "label": "leonard",
            "level": 3,
        }
    ],
    "skills": [
        {
            "label": "sun_sneeze",
            "level": 4
        }
    ],
    "waves": [
        [
            null,
            {
                "label": "skeleton",
                "level": 1
            },
            {
                "label": "wolf",
                "level": 2
            }
        ]
    ],
    "rng_key": "683caf997a03d422bf4205b8",
    "grid": []
}

// ----- system -----

const clearStoreFolder = () => {
    const dir = path.join(process.cwd(), 'src', 'workcenter', 'store');
    
    // Check if directory exists
    if (fs.existsSync(dir)) {
        // Read all files in the directory
        const files = fs.readdirSync(dir);
        
        // Remove each file
        for (const file of files) {
            fs.unlinkSync(path.join(dir, file));
        }
    }
}

const write = (data) => {
    
    const dir = path.join(process.cwd(), 'src', 'workcenter', 'store');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    // Read directory and find highest number
    const files = fs.readdirSync(dir);
    const numbers = files
        .filter(f => f.match(/^\d+\.json$/))
        .map(f => parseInt(f));
    
    const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    const fileName = `${nextNum}.json`;
    
    // Write the file
    fs.writeFileSync(
        path.join(dir, fileName),
        JSON.stringify(data, null, 2)
    );
}

clearStoreFolder()

// ----- on_create -----
const rune_suits = ['fire', 'water', 'plant', 'dark', 'light']
const rng = seedrandom(store.rng_key)

function random_choice(items) {
    return items[Math.floor(rng() * items.length)]
}

const gen_rune = () => {
    return {
        suit: random_choice(rune_suits),
        variant: 'normal'
    }
}

const MAX_GRID_SIZE = 7

for (let x = 0; x < MAX_GRID_SIZE; x++) {
    const column = []
    for (let y = 0; y < MAX_GRID_SIZE; y++) {
        column.push(gen_rune())
    }
    store.grid.push(column)
}

console.log(store)
write(store)