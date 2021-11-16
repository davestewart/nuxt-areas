// store imports
<%= options.stores.map(store => `import * as ${store.module} from '${store.relPath}'`).join('\n') %>

// store info
const stores = [
  <%= options.stores.map(store => `{ module: ${store.module}, namespace: '${store.namespace}' }`).join(',\n  ') %>
]

// plugin function
export default async function ({ store }) {
  // add all stores to vuex
  for (const info of stores) {
    // get namespace in vuex format
    const namespace = info.namespace.split('/')

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
    const module = info.module
    store.registerModule(namespace, {
      namespaced: true,
      modules: {},
      ...(module.default || module || {})
    })
  }
}
