// store imports
<%= options.stores.map(store => `import * as ${store.module} from '${store.relPath}'`).join('\n') %>

// store info
const stores = [
  <%= options.stores.map(store => `{ module: ${store.module}, namespace: '${store.namespace}' }`).join(',\n  ') %>
]

// plugin function
export default async function ({ store }) {
  stores.forEach(info =>{
    registerModule(store, info.namespace, info.module)
  })
}

// helper function
function registerModule (store, namespace, module) {
  // split
  namespace = namespace.split('/')

  // ensure parent namespaces have been registered
  if (namespace.length > 1) {
    for (let i = 0; i < namespace.length - 1; i++) {
      const moduleName = namespace.slice(0, i + 1)
      if (!store.hasModule(moduleName)) {
        store.registerModule(moduleName, { namespaced: true, modules: {} })
      }
    }
  }

  // register module
  // also @see https://github.com/nuxt/nuxt.js/issues/2267
  store.registerModule(namespace, {
    namespaced: true,
    modules: {},
    ...(module.default || module || {})
  })
}
