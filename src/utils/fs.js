import { existsSync, readdirSync } from 'fs'
import { join, resolve, dirname } from 'upath'
import { getArea } from '../services/areas.js'

export function getFolders (path, returnPath) {
  return readdirSync(path, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .filter(entry => !entry.name.startsWith('.'))
    .map(entry => {
      const { name } = entry
      return returnPath
        ? join(path, name)
        : name
    })
}

/**
 * Attempts to get the first file that exists in the passed file list
 *
 * @param   {string}    folder
 * @param   {string[]}  files
 * @return  {string|undefined}
 */
export function tryFile (folder, files) {
  for (const file of files) {
    const path = resolve(folder, file)
    if (existsSync(path)) {
      return path
    }
  }
}

/**
 * Attempts to load a node module based on name
 * Note: should be able to use require.resolve() but it's not working
 *
 * @param   {string}  name
 * @return  {string|undefined}
 */
export function tryModule (name) {
  const modulePath = resolve('node_modules', name)
  if (existsSync(modulePath)) {
    const packagePath = resolve(modulePath, 'package.json')
    if (existsSync(packagePath)) {
      const data = require(packagePath) || {}
      if (data) {
        const { main } = data
        if (main) {
          const areaPath = resolve(modulePath, main)
          return dirname(areaPath)
        }
      }
    }
  }
}
