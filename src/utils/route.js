import glob from 'glob'
import { join, relative } from 'upath'

/**
 * Create a route name "foo-bar-baz" from multiple strings
 *
 * @param   {...string[]}  parts
 * @return  {string}
 */
export function makeName (...parts) {
  return parts
    .join('-')
    .toLowerCase()
    .replace(/\?/g, '')
    .replace(/[/:-]+/g, '-')
    .replace(/(^-+|-+$)/g, '')
}

/**
 * Prefix (top level) routes with a folder name
 *
 * @param   {Route[]}   routes
 * @param   {string}    prefix
 * @return  {Route[]}
 */
export function prefixRoutes (routes, prefix) {
  return routes.map(route => {
    route.path = join('/', prefix, route.path)
    return route
  })
}

/**
 * Clean up routes created by Nuxt
 *
 * - remove name and chunk name
 * - fix windows slashes
 *
 * @param   {Route[]}   routes
 */
export function cleanRoutes (routes) {
  routes.forEach(route => {
    delete route.name
    delete route.chunkName
    route.component = route.component
      .replace(/\\\\/g, '/')
      .replace(/\\/g, '/')
    if (route.children) {
      cleanRoutes(route.children)
    }
  })
}

/**
 * Resolve pages and return relative paths
 *
 * @param   {string}    areaPath        Absolute path to the area
 * @param   {string}    pagesDir        Relative path to the pages dir
 * @param   {string[]}  extensions      Extensions
 * @param   {boolean}   follow
 * @return  {string[]}
 */
export function resolveFiles (areaPath, pagesDir, extensions = ['vue', 'js'], follow = false) {
  // @see https://github.com/nuxt/nuxt.js/blob/dev/packages/builder/src/builder.js#L199
  return glob
    .sync(`${areaPath}/${pagesDir}/**/*.{${extensions.join(',')}}`, { follow })
    .map(file => relative(areaPath, file))
}
