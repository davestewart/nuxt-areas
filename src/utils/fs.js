import { existsSync, readdirSync,  } from 'fs'
import { join, resolve, dirname, basename } from 'path'

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

export function getAliasedPath (path = '') {
  return path.replace(resolve('.'), '~')
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

/**
 * Path comparison function which places index.* first
 *
 * @usage   paths.sort(sortPaths)
 * @param   {string}  a
 * @param   {string}  b
 * @returns {number}
 */
export function sortPaths (a, b) {
  a = a.toLowerCase()
  b = b.toLowerCase()
  const aPath = dirname(a)
  const bPath = dirname(b)
  if (aPath < bPath) {
    return -1
  }
  if (aPath > bPath) {
    return 1
  }
  else {
    const aFile = basename(a)
    const bFile = basename(b)
    if (aFile.startsWith('index.')) {
      return -1
    }
    if (aFile < bFile) {
      return -1
    }
    if (aFile > bFile) {
      return 1
    }
    return 0
  }
}
