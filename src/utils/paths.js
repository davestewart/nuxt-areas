import Path, { basename, dirname, resolve } from 'upath'

/**
 * Converts an absolute path to an aliased path
 *
 * @param   {string}    path      An absolute file path
 * @param   {string}   [prefix]   The alias prefix to use; defaults to '~'
 * @return  {string}
 */
export function getAliasedPath (path = '', prefix = '~') {
  return path.replace(resolve('.').replace(/\\/g, '/'), prefix)
}

/**
 * Path comparison function which places index.* first
 * @usage   paths.sort(sortPaths)
 *
 * @param   {string}  a     An absolute path
 * @param   {string}  b     An absolute path
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
