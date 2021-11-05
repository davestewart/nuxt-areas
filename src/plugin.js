// imports
<% options.stores.forEach(function(store) {
%>import * as <%= store.ref %> from '~/<%= store.path %>'
<%
}); %>

// plugin function
export default async function ({ store }) {
  <% options.stores.forEach(function(store) {
  %>registerModule(store, <%= JSON.stringify(store.namespace) %>, <%= store.ref %>)
  <% }); %>
}

// helper function
function registerModule (store, namespace, module) {
  // check module namespace
  if (module.namespace) {
    namespace = Array.isArray(module.namespace)
      ? module.namespace
      : module.namespace.split(/[/.]/)
  }

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
  store.registerModule(namespace, {
    namespaced: true,
    modules: {},
    ...(module.default || module || {})
  })
}
