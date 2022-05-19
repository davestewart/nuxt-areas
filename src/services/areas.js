import { resolve, basename } from 'upath'
import { existsSync } from 'fs'
import { getFolders, tryFile, tryModule } from '../utils/fs'
import * as Namespace from '../utils/namespace.js'

// ---------------------------------------------------------------------------------------------------------------------
// definitions
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Area definition
 *
 * @typedef   {object}    Area
 * @property  {string}    name            The name (folder or package name) of the area
 * @property  {string}    path            The absolute folder path of the area
 * @property  {object}   [configFile]     An optional configuration file if one is found
 * @property  {string}   [route]          An optional route prefix if folder is a group
 * @property  {string}   [namespace]      An optional namespace prefix if folder is a group
 * @property  {Area[]}   [areas]          An optional array of nested areas if the folder is a group
 */

// ---------------------------------------------------------------------------------------------------------------------
// functions
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Gets all Area definitions for a given path
 *
 * Note this function is called to get root-level areas, but is also called recursively
 * from getArea() to get nested areas where a target folder doesn't contain a pages folder,
 * routes file, or areas config file
 *
 * @param   {string}    path          The path to a folder containing area sub-folders
 * @param   {string}    route         The base route for any pages
 * @param   {string}    namespace     The base namespace for any stores
 * @returns {Area[]}
 */
export function getAreas (path, route = '/', namespace = '/') {
  // areas
  const areas = []

  // bail if not exists
  if (!existsSync(path)) {
    return areas
  }

  // get folders
  const folders = getFolders(path)

  // process folders
  for (const folder of folders) {
    const results = getArea(resolve(path, folder), Namespace.resolve(route, folder), Namespace.resolve(namespace, folder))
    if (results) {
      areas.push(results)
    }
  }

  // return
  return areas
}

/**
 * Gets a single Area definition
 *
 * @param   {string}    path          The folder path of a single area
 * @param   {string}    route         The route prefix to use for the pages of that area
 * @param   {string}   [namespace]    The store namespace prefix to use for stores of that area
 * @returns {Area}                    An Area configuration object
 */
export function getArea (path, route = '/', namespace = '/') {
  // basic values
  const name = basename(path)

  // single area: should contain `pages` folder
  if (existsSync(resolve(path, 'pages'))) {
    const area = { name, route, namespace, path }
    const configPath = tryFile(path, ['routes.js', 'routes.ts'])
    if (configPath) {
      area.configFile = basename(configPath)
    }
    return area
  }

  // otherwise: check for area config
  const configPath = tryFile(path, ['areas.js', 'areas.ts'])

  // if we have a configuration file, merge the config
  if (configPath) {
    // load config
    const config = getConfig(configPath) || {}

    // variables
    if ('namespace' in config) {
      namespace = Namespace.resolve(namespace, '../', config.namespace)
    }
    if ('route' in config) {
      route = Namespace.resolve(route, '../', config.route)
    }
  }

  // area
  const areas = getAreas(path, route, namespace)

  /**
   * Area definition
   * @type {Area}
   */
  const area = {
    name,
    route,
    namespace,
    path,
  }

  // add config file so it can be watched
  if (configPath) {
    area.configFile = basename(configPath)
  }

  // return if we have areas
  if (areas.length) {
    area.areas = areas
    return area
  }
}

/**
 * Gets a so-called "external" Area from a folder or package
 *
 * Getting an external area has a few issues that need to be handled:
 *
 * - an external area could be a folder (./), alias (~/ @/), package (name) or scoped package (@name)
 * - in order to resolve packages, we need to use require.resolve() which works on files not folders
 * - alias only requires the path to a folder, so we need to account for this discrepancy
 * - @ aliases and scoped packages could be confused, so we need to determine intention based on existence
 *
 * Thus, we need to check for paths in a somewhat unorthadox manner
 *
 * @param   {string}    src           The src file path to the area's folder, or an installed package name
 * @param   {string}   [route]        The route the area's pages should be accessible under
 * @param   {string}   [namespace]    The namespace the area's store files should install to
 * @returns {Area|undefined}          An Area definition
 */
export function getExternal (src, route = '/external', namespace = '/') {
  // get route
  route = Namespace.resolve('/', route)

  // variables
  let path = src

  // check for folder (./, ../, ~/ or @/)
  if (/^[.\/\\~@]/.test(src)) {
    // if path is a common src/ aliase (~/ or @/)
    const rxAlias = /^[~@]\//
    if (rxAlias.test(path)) {
      path = path.replace(rxAlias, './')
    }

    // otherwise, check for namespaced module (@...)
    else if (path.startsWith('@')) {
      const area = getModule(src, route, namespace)
      if (area) {
        return area
      }
    }

    // resolve absolute path
    path = resolve(path)
    if (existsSync(path)) {
      return getArea(path, route, namespace)
    }
  }

  // check for non-namespaced module
  else {
    path = tryModule(src)
    if (path) {
      return getModule(src, route, namespace)
    }
  }

  // otherwise
  console.warn(`[ AREAS ] Package "${src}" does not exist`)
}

/**
 * Attempts to load an Area from node modules
 *
 * @param   {string}    src           The src file path to the area's folder, or an installed package name
 * @param   {string}   [route]        The route the area's pages should be accessible under
 * @param   {string}   [namespace]    The namespace the area's store files should install to
 * @returns {Area|undefined}          An Area definition
 */
function getModule (src, route, namespace) {
  const path = tryModule(src)
  if (path) {
    const area = getArea(path, route, namespace)
    area.name = src
    return area
  }
}

/**
 * Reads a configuration file with error trapping
 *
 * @internal
 * @param   {string}    path          The filepath of the config file
 * @returns {object}                  The data in the config file
 */
export function getConfig (path) {
  try {
    return require(path)
  }
  catch (err) {
    console.warn(`[ AREAS ] There was a problem reading Area config "${path}". The error is: ${err.message}`)
  }
}

/**
 * Utility function to collate all Area config files, so they can be watched
 *
 * @internal
 * @param   {Area[]}      areas       An array of Area definitions
 * @returns {string[]}                An array of Area config file paths
 */
export function getAreasConfigFiles (areas) {
  return areas.reduce((paths, area) => {
    if (area.configFile) {
      paths.push(area.path + '/' + area.configFile)
    }
    if (area.areas) {
      paths.push(...getAreasConfigFiles(area.areas))
    }
    return paths
  }, [])
}
