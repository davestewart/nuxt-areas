import Fs from 'fs'
import Path from 'upath'
import * as NuxtUtils from '@nuxt/utils'
import { resolveFiles, cleanRoutes, prefixRoutes, makeName } from '../utils/route.js'
import { getAliasedPath } from '../utils/paths.js'
import { tryFile } from '../utils/fs.js'

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
 * @param   {string}    areaPath  The area folder to scan for pages
 * @param   {object}    options   Nuxt's options
 * @return  {Route[]}             An array of Route definitions
 */
function createRoutes (areaPath, options) {
  // @see https://github.com/nuxt/nuxt.js/blob/dev/packages/builder/src/builder.js#L43
  const supportedExtensions = ['vue', 'js', ...(options.build.additionalExtensions || [])]
  const pagesDir = 'pages'

  // @see https://github.com/nuxt/nuxt.js/blob/dev/packages/builder/src/builder.js#L291
  const pages = resolveFiles(areaPath, pagesDir, supportedExtensions, options.build.followSymlinks)

  // @see https://github.com/nuxt/nuxt.js/blob/dev/packages/builder/src/builder.js#L352
  const files = {}
  const ext = new RegExp(`\\.(${supportedExtensions.join('|')})$`)
  for (const page of pages) {
    const key = page.replace(ext, '')
    // .vue file takes precedence over other extensions
    if (/\.vue$/.test(page) || !files[key]) {
      files[key] = page.replace(/(['"])/g, '\\$1')
    }
  }

  // payload
  const { routeNameSplitter, trailingSlash } = options.router

  // @see https://github.com/nuxt/nuxt.js/blob/dev/packages/utils/src/route.js#L164
  const routes = NuxtUtils.createRoutes({
    files: Object.values(files),
    srcDir: areaPath,
    pagesDir,
    routeNameSplitter,
    supportedExtensions,
    trailingSlash,
  })

  // clean routes
  cleanRoutes(routes)

  // return
  return routes
}

/**
 * Ensure routes exist, have correct names / chunk names
 *
 * @param     {Route[]}       routes        An array of route definitions
 * @param     {string}        areaPath      The absolute file path to the parent area
 * @param     {string}        routePrefix   The ancestor route path to this route
 * @return    {Route[]}
 */
function finishRoutes (routes, areaPath, routePrefix = '') {
  // process routes
  routes.forEach(route => {
    // path: convert windows path to posix
    route.path = Path.toUnix(route.path)

    // check for absolute path
    if (!Path.isAbsolute(route.component)) {
      route.component = Path.resolve(areaPath, route.component)

      // warn if route does not exist
      if (!Fs.existsSync(route.component)) {
        console.warn(`[ AREAS ] Component "${route.component}" does not exist`)
        route.component = Path.join(__dirname, '../components/Missing.vue')
      }
    }

    // chunk name: based on relative path
    route.chunkName = Path
      .relative('.', route.component)
      .replace(/\.\.\//g, '')
      .replace(/\.\w+$/, '')

    // route name: based on route path
    if (!route.name) {
      route.name = makeName(routePrefix, route.path)
    }

    // component: alias path for brevity
    route.component = getAliasedPath(route.component)

    // process children
    if (route.children && Array.isArray(route.children)) {
      finishRoutes(route.children, areaPath, Path.join(routePrefix, route.path))

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
 * @param   {number}    depth
 * @return  {Route[]}
 */
export function getRoutes (areas, nuxtOptions, depth = 0) {
  // all route definitions
  const allRoutes = []

  // process folders
  for (const area of areas) {
    // variables
    const { route, path } = area
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
      }

      // otherwise, have nuxt create them
      else {
        routes = createRoutes(path, nuxtOptions)
      }

      // if we have routes, check and add them
      routes = prefixRoutes(routes, prefix)
      routes = finishRoutes(routes, path)
    }

    if (Array.isArray(routes)) {
      // sort routes at this level
      routes = NuxtUtils.sortRoutes(routes)

      // add to main routes
      allRoutes.push(...routes)
    }
  }

  // return
  return allRoutes
}
