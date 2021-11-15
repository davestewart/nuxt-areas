// imports
import { defineNuxtPlugin, useState, useAsyncData } from '#app'

// store imports
<%= options.stores.map(store => `import * as ${store.module} from '${store.relPath}'`).join('\n') %>

// store info
const stores = [
  <%= options.stores.map(store => `{ module: ${store.module}, namespace: '${store.namespace}' }`).join(',\n  ') %>
]

// plugin function
export default defineNuxtPlugin(async function (nuxt) {
  // async
  const asyncStores = []

  // sync
  for (const store of stores) {
    // store contents
    const { namespace, module } = store

    // state functions
    const { state, initState } = module

    // state
    if (typeof state === 'function') {
      // sync state
      const data = useState(namespace, state)

      // async state
      // FIXME: no idea if this is even possible
      if (typeof initState === 'function') {
        // attempt to set state now?
        if (!nuxt.isHydrating) {
          // data.todo = await useAsyncData(namespace, async () => 123)
        }

        // or, attempt to set state later?
        else {
          // this works but makes the network calls in the client
          asyncStores.push({ namespace, initState })
        }
      }
    }
  }

  // final attempt: provide state in app
  // FIXME: not sure *where* to call it in app though - is there a global init-style hook?
  nuxt.provide('initState', function () {
    console.log('Initializing async state')
    return Promise.all(asyncStores.map(async (store) => {
      const state = useState(store.namespace)
      await store.initState(state.value)
      console.log('updated state:', state)
      return state
    }))
  })
})
