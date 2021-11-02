function processRoutes (routes) {
  return routes.map(route => {
    const { path, name, component, children } = route
    const data = { path, component: String(component) }
    if (children) {
      data.children = processRoutes(children)
    }
    return data
  })
}

function processStore (store) {
  const output = {}
  const modules = store._modules || store._children
  const keys = Object.keys(modules)
  if (keys.length) {
    keys.forEach(key => {
      output[key] = processStore(modules[key])
    })
    return output
  }
  return true
}

export default function ($nuxt) {
  const routes = processRoutes($nuxt.$router.options.routes)
  const store = processStore($nuxt.$store._modules.root)
  return { routes, store }
}
