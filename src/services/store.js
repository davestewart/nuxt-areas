import pathSort from 'path-sort'
import glob from 'glob'
import { sortBy } from '../utils/array.js'

/**
 * @param   {string}    BASE_PATH    The base areas path (normally "areas")
 * @param   {string}    APP_PATH     The app folder path (normally "areas/app")
 */
export function getStores (BASE_PATH, APP_PATH) {
  // helpers
  const rxFile = /\.(js|ts)$/

  // find all stores
  return pathSort([
    ...glob.sync(`${BASE_PATH}/**/store/**`, { mark: true }),
    ...glob.sync(`${BASE_PATH}/**/store.{js,ts}`),
  ])
    // skip folders
    .filter(path => !path.endsWith('/'))

    // skip root store
    .filter(path => !/^areas\/store\.(js|ts)$/.test(path))

    // skip app stores (will have already been registered by Nuxt)
    .filter(path => !path.startsWith(APP_PATH))

    // turn into an object
    .map(path => {
      // convert path to namespace
      let namespace = path
        .replace(BASE_PATH + '/', '')
        .replace(/\/store\//, '/')
        .replace(rxFile, '')

      // store.js and index.js should not include their name
      if (/\/(store|index)\.(js|ts)$/.test(path)) {
        namespace = namespace.replace(/\/[^/]+$/, '')
      }

      // return the object
      return {
        ref: namespace.replace(/\//g, '_'),
        namespace: namespace.split('/'),
        path,
      }
    })

    // sort by namespace (so index.ext files are first)
    .sort(sortBy('namespace'))
}
