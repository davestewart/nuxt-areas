import { existsSync, readdirSync,  } from 'fs'
import { join, resolve } from 'path'

export function getFolders (path, returnPath) {
  return readdirSync(path, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => {
      const { name } = entry
      return returnPath
        ? join(path, name)
        : name
    })
}

/**
 *
 * @param   {string}    folder
 * @param   {string[]}  files
 * @return  {string}
 */
export function tryFile (folder, files) {
  for (const file of files) {
    const path = resolve(folder, file)
    if (existsSync(path)) {
      return path
    }
  }
}
