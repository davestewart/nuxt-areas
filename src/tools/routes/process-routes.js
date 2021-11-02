/**
 * Extract the file path from a Vue route component import
 *
 * @param   {function| string}  component
 * @return  {string}
 */
export function getFile (component) {
  // convert
  component = String(component)

  // webpack
  if (component.includes('WEBPACK_IMPORTED_MODULE')) {
    const matches = component.toString().match(/"(\.\/pages\/.+?\.vue)\"/)
    if (matches) {
      return matches[1].replace('./pages/', '')
    }
  }

  // vite
  else {
    const matches = component.toString().match(/'(.+?)'/)
    if (matches) {
      return matches[1].replace('/pages/', '')
    }
  }

  // unknown
  return component
}

/**
 * Convert incoming route definition components to files paths
 *
 * @param   {path: string, component: string }  route
 * @return  {{path: string, file: string, children: {path: string, file: string, children: *}[]}}
 */
export function processRoute (route) {
  const { path, component } = route
  const file = getFile(component)
  const children = Array.isArray(route.children)
    ? route.children.map(processRoute)
    : undefined
  return { path, file, children }
}

/**
 * Rebuild folder structure from route definitions
 *
 * @param output
 * @param route
 * @return {*}
 */
export function buildFolders (output, route) {
  // route
  const { file, children } = route

  // process children first
  if (children) {
    children.forEach(child => buildFolders(output, child))
  }

  // walk file path segments
  const segments = file.split('/')
  let target = output
  for (let segment of segments) {
    const isVue = segment.endsWith('.vue')
    if (!target[segment]) {
      target[segment] = isVue ? true : {}
    }
    target = target[segment]
  }

  // return output
  return output
}

export default function (routes) {
  return routes
    .map(processRoute)
    .reduce(buildFolders, {})
}
