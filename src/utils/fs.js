import { existsSync, readdirSync } from 'fs'
import { join, resolve, dirname } from 'upath'

/**
 * Gets all sub folders in a target folder
 *
 * @param   {string}      path            A root folder in which to look for folders
 * @param   {boolean}    [returnPath]     An optional flag to return absolute paths, vs only folder names
 * @returns {string[]}                    An array of folder names or paths
 */
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
 * Attempts to get the first file that exists in the supplied file list
 *
 * @param   {string}      folder          A root folder in which to look for files
 * @param   {string[]}    files           A list of file names to check for
 * @return  {string|undefined}            The absolute path to the first found file, if one exists
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
 * Attempts to get the src path (indicated by package.json "main" property) of a named module
 * Note: should be able to use require.resolve() but it's not working
 *
 * @param   {string}      name            The name of the node module to load
 * @return  {string|undefined}            The absolute path of the module's src folder, if the module exists
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
