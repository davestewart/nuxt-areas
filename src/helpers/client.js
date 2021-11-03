export function route (path, page, children, options = {}) {
  return { path, page: `pages/${page}.vue`, children, options }
}
