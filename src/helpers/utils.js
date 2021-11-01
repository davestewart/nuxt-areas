import { resolve } from 'path'
import { existsSync } from 'fs'

export function sortBy (prop) {
  return function (a, b) {
    const aVal = a[prop]
    const bVal = b[prop]
    return aVal < bVal
      ? -1
      : aVal > bVal
        ? 1
        : 0
  }
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
