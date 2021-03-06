import glob from 'glob'
import hash from 'hash-sum'
import Path from 'upath'
import * as Namespace from '../utils/namespace.js'
import { getAliasedPath, sortPaths } from '../utils/paths.js'
import { sortBy } from '../utils/array.js'

// ---------------------------------------------------------------------------------------------------------------------
// definitions
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Store import definition
 *
 * @typedef   {object}  Store
 * @property  {string}  ref          The import ref of the file
 * @property  {string}  namespace    The namespace of the store
 * @property  {string}  path         The file path of the store
 */

// ---------------------------------------------------------------------------------------------------------------------
// functions
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Glob all stores in all areas
 *
 * Note, glob returns:
 *
 * - absolute paths
 * - with forward slashes
 * - windows paths will start with driveletter, i.e. C:/
 *
 * @param   {string}    path
 */
export function globStores (path) {
  return [
    ...glob.sync(`${path}/store.{js,ts}`),
    ...glob.sync(`${path}/store/**`, { mark: true }),
  ]
    .filter(path => !path.endsWith('/'))
    .sort(sortPaths)
}

/**
 * Get all stores for all areas
 *
 * Note that areas may contain nested areas, so this function may be called recursively
 *
 * @param   {Area[]}    areas         An array of areas to process
 * @returns {Store[]}                 An array of paths
 */
export function getStores (areas) {
  // helpers
  const rxFile = /\.(js|ts)$/
  const allStores = []

  // find all stores
  for (const area of areas) {
    // variables
    let stores

    // CHILD AREAS
    if (area.areas) {
      stores = getStores(area.areas)
    }

    // SINGLE AREA
    else {
      // namespace for this area
      // const namespace = area.namespace

      // stores for this area
      stores = globStores(area.path)
        .map(path => {
          // TODO possibly modify namespace based on store namespace
          // const store = require(path)
          // if (store.namespace) {
          //   namespace = resolve(area.namespace, store.namespace)
          // }

          // convert path to namespace
          const relPath = Path.relative(area.path, path)
          let namespace = Namespace.resolve(area.namespace, relPath)
            .replace(/\/store\//, '/')
            .replace(/^\//, '')
            .replace(rxFile, '')

          // store.js and index.js should not include their name
          if (/\/(store|index)\.(js|ts)$/.test(path)) {
            namespace = namespace.replace(/\/[^/]+$/, '')
          }

          // return the object
          return {
            ref: '_' + hash(path),
            path: getAliasedPath(path),
            namespace,
          }
        })
    }

    // if we have stores, add them
    if (Array.isArray(stores)) {
      allStores.push(...stores)
    }
  }

  // sort by namespace (so index.ext files are first)
  return allStores.sort(sortBy('namespace'))
}
