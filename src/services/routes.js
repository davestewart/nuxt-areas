import * as NuxtUtils from '@nuxt/utils'
import { isAbsolute, resolve } from 'path'
import { existsSync } from 'fs'
import { cleanRoutes, prefixRoutes, resolveFiles, makeName } from '../utils/route.js'
import { getAliasedPath, tryFile } from '../utils/fs.js'

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
// functions
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Create routes using Nuxt's own createRoutes() utility
 *
 * @param   {string}    srcDir    The source folder to scan for pages
 * @param   {object}    options   Nuxt's options
 * @return  {Route[]}             An array of Route definitions
 */
function createRoutes (srcDir, options) {
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
  return NuxtUtils.createRoutes({
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
    // check for absolute path
    if (!isAbsolute(route.component)) {
      route.component = resolve(srcDir, route.component)

      // warn if route does not exist
      if (!existsSync(route.component)) {
        console.warn(`Component "${route.component.replace(__dirname, '')}" does not exist`)
        route.component = resolve(__dirname, '../components/Missing.vue')
      }
    }


    // reset component to project
    route.component = getAliasedPath(route.component)

    // make sure route has chunk name
    route.chunkName = route.component
      .replace(/^~\//, '')
      .replace(resolve('.') + '/', '')
      .replace(/\.\w+$/, '')
      .replace(/-/g, '/')

    // make sure route has name
    if (!route.name) {
      route.name = makeName(routePrefix, route.path)
    }

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
 * Gets or generates routes for passed areas
 *
 * - if an area config file exists, it is processed
 * - if one doesn't exist, the folders are scanned
 *
 * @param   {Area[]}    areas         An array of areas to process
 * @param   {object}    nuxtOptions   Nuxt's options
 * @return  {Route[]}
 */
export function getRoutes (areas, nuxtOptions, depth = 0) {
  // all route definitions
  const allRoutes = []

  // process folders
  for (const area of areas) {
    // variables
    const { name, route, path } = area
    const prefix = route
    let routes = []

    // CHILD AREAS
    if (area.areas) {
      routes = getRoutes(area.areas, nuxtOptions, depth + 1)
    }

    // SINGLE AREA
    else {
      // check for config file
      const configPath = tryFile(path, ['routes.js', 'routes.ts'])

      // routes are configured
      if (configPath) {
        const config = require(configPath)
        routes = config.routes
        routes = prefixRoutes(routes, prefix)
      }

      // otherwise, build them
      else {
        routes = createRoutes(path, nuxtOptions)
        routes = prefixRoutes(routes, prefix)
        cleanRoutes(routes)
      }

      // if we have routes, check and add them
      routes = checkRoutes(routes, path)
    }

    if (Array.isArray(routes)) {
      // routes = NuxtUtils.sortRoutes(routes)
      allRoutes.push(...routes)
    }
  }

  // return
  return NuxtUtils.sortRoutes(allRoutes)
}
