import { join } from 'path'
import glob from 'glob'

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
    // .replace(/:\w+$/g, '/view')
    // .replace(/:\w+/g, '')
    .replace(/[/:-]+/g, '-')
    .replace(/(^-+|-+$)/g, '')
}

/**
 * Prefix routes with a folder name
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
 * Remove name and chunk name from routes
 *
 * @param   {Route[]}   routes
 */
export function cleanRoutes (routes) {
  routes.forEach(route => {
    delete route.name
    delete route.chunkName
    if (route.children) {
      cleanRoutes(route.children)
    }
  })
}

/**
 * Resolve route files
 *
 * @param   {string}    path
 * @param   {string[]}  extensions
 * @param   {boolean}   follow
 * @return {*}
 */
export function resolveFiles (path, extensions = ['vue', 'js'], follow = false) {
  return glob.sync(`${path}/**/*.{${extensions.join(',')}}`, { follow })
    .slice(0)
    .filter(file => file.endsWith('.vue'))
    .map(file => file.replace(path + '/', ''))
}
