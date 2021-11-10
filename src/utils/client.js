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

export function page (path, component, children, options = {}) {
  return route(path, `pages/${component}`, children, options)
}
