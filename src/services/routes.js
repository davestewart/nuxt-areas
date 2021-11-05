import { createRoutes, sortRoutes } from '@nuxt/utils'
import { isAbsolute, resolve } from 'path'
import { existsSync } from 'fs'
import { getFolders, tryFile } from '../utils/fs.js'
import { cleanRoutes, makeName, prefixRoutes, resolveFiles } from '../utils/route.js'

// ---------------------------------------------------------------------------------------------------------------------
// definitions
// ---------------------------------------------------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------------------------------------------------
// main functions
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Build routes using Nuxt's own createRoutes() utility
 * @param srcDir
 * @param options
 * @return {*}
 */
function buildRoutes (srcDir, options) {
  // @see https://github.com/nuxt/nuxt.js/blob/dev/packages/builder/src/builder.js#L43
  const supportedExtensions = ['vue', 'js', ...(options.build.additionalExtensions || [])]

  // @see https://github.com/nuxt/nuxt.js/blob/dev/packages/builder/src/builder.js#L352
  const files = {}
  const ext = new RegExp(`\\.(${supportedExtensions.join('|')})$`)
  for (const page of resolveFiles(srcDir, supportedExtensions, options.build.followSymlinks)) {
    const key = page.replace(ext, '')
    // .vue file takes precedence over other extensions
    if (/\.vue$/.test(page) || !files[key]) {
      files[key] = page.replace(/(['"])/g, '\\$1')
    }
  }

  // payload
  const { routeNameSplitter, trailingSlash } = options.router
  return createRoutes({
    files: Object.values(files),
    srcDir,
    pagesDir: 'pages',
    routeNameSplitter,
    supportedExtensions,
    trailingSlash,
  })
}

/**
 * Ensure routes exist, have correct names / chunk names
 *
 * @param     {Route[]}       routes        The routes to pass in
 * @param     {string}        srcDir        The base file path to resolve components to
 * @param     {string}        routePrefix   The route prefix to build up the name and chunk name
 * @return    {Route[]}
 */
function checkRoutes (routes, srcDir, routePrefix = '') {
  // process routes
  routes.forEach(route => {
    // ensure component has extension
    if (!route.component.endsWith('.vue')) {
      route.component += '.vue'
    }

    // check for absolute path
    if (!isAbsolute(route.component)) {
      route.component = resolve(srcDir, route.component)

      // warn if route does not exist
      if (!existsSync(route.component)) {
        console.warn(`Component "${route.component.replace(__dirname, '')}" does not exist`)
        route.component = resolve(__dirname, '../components/Missing.vue')
      }
    }

    // make sure route has name
    if (!route.name) {
      route.name = makeName(routePrefix, route.path)
    }

    // make sure route has chunk name
    route.chunkName = 'areas/' + makeName(routePrefix, route.path).replace(/-/g, '/')

    // process children
    if (route.children && Array.isArray(route.children)) {
      checkRoutes(route.children, srcDir, routePrefix + '/' + route.path)

      // remove name if there is a default child route
      if (route.children.find(child => child.name === route.name)) {
        delete route.name
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
 * @param   {string}    APP_PATH     The app folder path (normally "areas/app")
 * @param   {object}    nuxtOptions   Nuxt's options
 * @return  {Route[]}
 */
export function getRoutes (BASE_PATH, APP_PATH, nuxtOptions) {
  // get base directories
  const areasPath = resolve(BASE_PATH)
  const appPath = resolve(APP_PATH)
  if (!existsSync(areasPath)) {
    return []
  }

  // get folders
  const folders = getFolders(areasPath)

  // process folders
  const allRoutes = []
  for (const folder of folders) {
    // full path
    const modulePath = resolve(areasPath, folder)

    // skip app path
    if (modulePath === appPath) {
      continue
    }

    // check for routes configuration file
    const file = tryFile(modulePath, ['area.config.js', 'area.config.ts'])

    // variables
    let routes

    // attempt to get configuration file
    if (existsSync(file)) {
      // get initial data
      const data = require(file)

      // test for a route
      try {
        routes = data.routes
      }
      catch (err) {
        console.warn(`There was a problem reading area config "${file}". The error is: ${err.message}`)
      }

      // if areas, rescan this folder for sub-areas
      if (data.areas || 'path' in data) {
        routes = getRoutes(modulePath, APP_PATH, nuxtOptions)
        routes = prefixRoutes(routes, data.path || '')
      }
    }

    // otherwise generate routes from folder
    else {
      routes = buildRoutes(modulePath, nuxtOptions)
      routes = prefixRoutes(routes, folder)
      cleanRoutes(routes)
    }

    // add routes
    if (Array.isArray(routes)) {
      routes = checkRoutes(routes, modulePath)
      allRoutes.push(...routes)
    }
  }

  // return
  return sortRoutes(allRoutes)
}
