import { extname, isAbsolute, resolve } from 'path'
import { existsSync, readdirSync } from 'fs'
import { tryFile } from '../helpers/utils.js'

/**
 * Route definition
 *
 * @typedef   {Object}    Route
 * @property  {string}    path
 * @property  {string}    component
 * @property  {Route[]}   children
 */
class Route {
  path
  component
  children
  constructor (path, component, children) {
    this.path = path
    this.component = component
    this.children = children
  }
}

/**
 * Makes routes for a single area folder
 *
 * @param     {Route[]}       routes      The routes to pass in
 * @param     {string}        basePath    A base path
 * @return    {Route[]}
 */
function processRoutes (routes, basePath) {
  // process routes
  routes.forEach(route => {
    if (!isAbsolute(route.component)) {
      // get component path
      route.component = resolve(basePath, 'pages', route.component)
      if (!route.component.endsWith('.vue')) {
        route.component += '.vue'
      }

      // warn if route does not exist
      if (!existsSync(route.component)) {
        console.warn(`Component "${route.component.replace(__dirname, '')}" does not exist`)
        route.component = resolve(__dirname, '../components/Missing.vue')
      }

      // process children
      if (route.children) {
        // TODO chunk names https://stackoverflow.com/questions/66444681/nuxt-how-to-explicitly-name-js-chunks
        processRoutes(route.children, basePath)
      }
    }
  })

  // return
  return routes
}

/**
 * Gets or generates routes for all areas sub-folders
 *
 * - if a routes file exists, it is processed
 * - if one doesn't exist, the folders are scanned
 *
 * @param   {string}    BASE_PATH    The base areas path (normally "areas")
 * @return  {Route[]}
 */
export function getRoutes (BASE_PATH) {
  // exports
  const routes = []
  const areasPath = resolve(BASE_PATH)

  // get folders
  const folders = readdirSync(areasPath)

  // process folders
  for (const folder of folders) {
    if (!extname(folder)) {
      // paths
      const modulePath = resolve(areasPath, folder)
      // const moduleMembers = readdirSync(__dirname)

      // routes
      try {
        const file = tryFile(modulePath, ['routes.js', 'routes.ts'])
        const input = require(file).default
        const output = processRoutes(input, modulePath)
        routes.push(...output)
      }
      catch (err) {
        // console.warn(`folder "${folder}" is missing a routes file`)
      }
    }
  }

  // return
  return routes
}
