import { resolve, dirname, basename } from 'path'
import { existsSync } from 'fs'
import { getFolders, tryFile } from '../utils/fs.js'

// ---------------------------------------------------------------------------------------------------------------------
// definitions
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Area definition
 *
 * @typedef   {object}    Area
 * @property  {string}    name          The name (folder or package name) of the area
 * @property  {string}    path          The absolute folder path of the area
 * @property  {object}   [config]       An optional configuration if one is found
 * @property  {string}   [route]        An optional route prefix if folder is a group
 * @property  {string}   [namespace]    An optional namespace prefix if folder is a group
 * @property  {Area[]}   [areas]        An optional array of areas if the folder is a group
 */

// ---------------------------------------------------------------------------------------------------------------------
// functions
// ---------------------------------------------------------------------------------------------------------------------

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

/**
 * Get all area files
 *
 * @param   {string}  path
 * @param   {string}  route
 * @param   {string}  namespace
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
    const results = getArea(resolve(path, folder), resolve(route, folder), resolve(namespace, folder))
    if (results) {
      areas.push(results)
    }
  }

  // return
  return areas
}

/**
 * Gets a single Area
 *
 * @param   {string}    path
 * @param   {string}    route
 * @param   {string}    namespace
 * @returns {Area}
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
      namespace = resolve(namespace, '../', config.namespace)
    }
    if ('route' in config) {
      route = resolve(route, '../', config.route)
    }
  }

  // area
  const areas = getAreas(path, route, namespace)
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
 * Gets an Area from a folder or package
 *
 * @param   {string}    path
 * @param   {string}   [route]
 * @param   {string}   [namespace]
 * @returns {Area}
 */
export function getPackage (path, route = '/packages', namespace = '/packages') {
  // fix webpack aliases
  const rxAlias = /^[~@]\//
  if (rxAlias.test(path)) {
    path = path.replace(rxAlias, './')
  }

  // resolve absolute path
  route = resolve('/', route)
  path = resolve(path)

  // check if package
  const packageFile = resolve(path, 'package.json')
  if (existsSync(packageFile)) {
    const data = require(packageFile) || {}
    if (data) {
      const { name, main } = data
      if (main) {
        const folder = dirname(resolve(path, main))
        const area = getArea(folder, route, namespace)
        area.name = name
        return area
      }
    }
  }

  // just get folder
  return getArea(path, route, namespace)
}

/**
 * Reads a configuration file with error trapping
 *
 * @param   {string}    path
 * @returns {object}
 */
export function getConfig (path) {
  try {
    return require(path)
  }
  catch (err) {
    console.warn(`There was a problem reading Area config "${path}". The error is: ${err.message}`)
  }
}
