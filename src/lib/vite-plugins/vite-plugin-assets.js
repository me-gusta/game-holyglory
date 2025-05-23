import * as fs from 'fs'
import * as path from 'path'

export default function () {
    const virtualModuleId = 'virtual:assets'
    const resolvedVirtualModuleId = '\0' + virtualModuleId
    const assetsBaseDir = path.join(process.cwd(), 'public', 'assets', 'img')

    // Recursive function to scan directory
    async function scanDirectory(dir, basePath = '') {
        console.log(dir);
        
        const entries = await fs.promises.readdir(dir, { withFileTypes: true })
        const results = {
            calls: [],
            aliases: []
        }

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name)
            const relativePath = path.join(basePath, entry.name)

            if (entry.isDirectory()) {
                // Recursively scan subdirectory
                const subResults = await scanDirectory(fullPath, relativePath)
                results.calls.push(...subResults.calls)
                results.aliases.push(...subResults.aliases)
            } else if (entry.isFile()) {
                const alias = path.join(basePath, entry.name.split('.')[0])
                    .replace(/[\\/]/g, '/') 
                    .replace(/^\/+|\/+$/g, '')
                    // .replace(/\//g, '_')
                const assetPath = path.join('assets/img', relativePath)
                    .replace(/\\/g, '/')

                results.calls.push(
                    `Assets.add({ alias: '${alias}', src: '${assetPath}' });`
                )
                if (results.aliases.includes(alias)) {
                    throw Error(`Assets with alias ${alias} already has been defined`)
                }
                results.aliases.push(`'${alias}'`)
            }
        }

        return results
    }

    return {
        name: 'asset-loader',
        resolveId(id) {
            if (id === virtualModuleId) {
                return resolvedVirtualModuleId
            }
        },
        async load(id) {
            if (id === resolvedVirtualModuleId) {
                try {
                    const { calls, aliases } = await scanDirectory(assetsBaseDir)
                    
                    calls.push(
                        `await Assets.load([${aliases.join(', ')}]);`,
                        `console.log('assets loaded')`
                    )
                    
                    return `import { Assets } from 'pixi.js';\nconsole.log('ASSETS PLUGIN INITIATED!');\nexport default async () => { ${calls.join('\n')} }`
                } catch (error) {
                    console.error('Error scanning assets directory:', error)
                    throw error
                }
            }
        },
    }
}
