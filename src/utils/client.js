export function route (path, component, children, options = {}) {
  if (!/\.(vue|js|ts|tsx)$/.test(component)) {
    component = component + '.vue'
  }
  return { path, component, children, ...options }
}

export function page (path, component, children, options = {}) {
  return route(path, `pages/${component}`, children, options)
}
