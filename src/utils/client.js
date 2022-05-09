/**
 * This file makes available some convenience functions to the user via:
 *
 * import { page, route } from 'nuxt-areas'
 */

/**
 * Convenience function to build a route
 *
 * @param   {string}        path          The route path
 * @param   {string}        component     The component path
 * @param   {Route[]}      [children]     An optional list of child routes
 * @param   {object}       [options]      An optional object of additional router options
 * @returns {Route}
 */
export function route (path, component, children, options = {}) {
  if (!/\.(vue|js|ts|tsx)$/.test(component)) {
    component = component + '.vue'
  }
  const route = { path, component }
  if (children) {
    route.children = children
  }
  return { ...route, ...options }
}

/**
 * Convenience function to build a page route
 *
 * @param   {string}        path          The route path
 * @param   {string}        component     The component path
 * @param   {Route[]}      [children]     An optional list of child routes
 * @param   {*}            [options]      An optional object of additional router options
 * @returns {Route}
 */
export function page (path, component, children, options = {}) {
  return route(path, `pages/${component}`, children, options)
}
