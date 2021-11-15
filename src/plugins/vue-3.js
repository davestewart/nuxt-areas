// imports
import { defineNuxtPlugin, useState } from '#app';

<% options.stores.forEach(function(store) {
%>import * as <%= store.ref %> from '<%= store.path %>'
<%
}); %>

// plugin function
export default defineNuxtPlugin(function (nuxt) {
  <% options.stores.forEach(function(store) {
  %>initState('<%= store.namespace || "" %>', <%= store.ref %>)
  <% }); %>
  console.log('Providing store...')
  nuxt.provide('initStore', async function () {
    console.log('Initializing store...')
    return Promise.resolve(true)
  })
})

// helper function
function initState (namespace, module) {
  const { state, init } = module
  if (module.namespace) {
    namespace = module.namespace
  }
  if (typeof state === 'function') {
    useState(namespace, state)
  }
}
