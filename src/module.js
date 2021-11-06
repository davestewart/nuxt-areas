import { resolve } from 'path'
import { name, version } from '../package.json'
import { getRoutes } from './services/routes.js'
import { getStores } from './services/store.js'
import { existsSync } from 'fs'

const nuxtModule = function (options) {

  // ---------------------------------------------------------------------------------------------------------------------
  // dev
  // ---------------------------------------------------------------------------------------------------------------------

  // @see https://nuxtjs.org/docs/configuration-glossary/configuration-watch#the-watch-property
  if (process.env.NODE_ENV === 'development') {
    if (!this.options.watch) {
      this.options.watch = []
    }
    this.options.watch.push(__dirname + '/**')
  }

  // ---------------------------------------------------------------------------------------------------------------------
  // paths
  // ---------------------------------------------------------------------------------------------------------------------

  // defaults
  const defaults = {
    base: 'areas',
    app: 'app',
  }

  // get areas options
  options = Object.assign({}, defaults, this.options.areas, options)

  // constants
  const BASE_PATH = options.base
  const APP_PATH = `${options.base}/${options.app}`

  // reconfigure nuxt dirs from areas/app/* if folders exist
  if (existsSync(APP_PATH)) {
    const dirs = ['components', 'layouts', 'pages', 'store']
    for (const dir of dirs) {
      const dirPath = `${APP_PATH}/${dir}`
      if (existsSync(dirPath)) {
        // @see https://nuxtjs.org/docs/configuration-glossary/configuration-dir
        this.options.dir[dir] = dirPath
      }
    }
  }

  // ---------------------------------------------------------------------------------------------------------------------
  // components
  // ---------------------------------------------------------------------------------------------------------------------

  // set component options
  if (this.options.components === true) {
    this.options.components = [
      `~/${this.options.dir.components || 'components'}`
    ]
  }
  else if (!this.options.components) {
    this.options.components = []
  }

  // @see https://nuxtjs.org/docs/configuration-glossary/configuration-components
  this.options.components.push({
      path: BASE_PATH,
      pattern: '**/components/**/*.{vue,js,ts,tsx}',
      pathPrefix: false,
    },
  )

  // ---------------------------------------------------------------------------------------------------------------------
  // routes
  // ---------------------------------------------------------------------------------------------------------------------

  // @see https://nuxtjs.org/docs/configuration-glossary/configuration-router#extendroutes
  this.extendRoutes((allRoutes) => {
    const routes = getRoutes(BASE_PATH, APP_PATH, this.options)
    routes.forEach(route => {
      // remove old matching routes (HMR)
      const index = allRoutes.findIndex(oldRoute => oldRoute.path === route.path)
      if (index > -1) {
        allRoutes.splice(index, 1)
      }

      // add new route
      allRoutes.push(route)
    })
  })

  // ---------------------------------------------------------------------------------------------------------------------
  // store
  // ---------------------------------------------------------------------------------------------------------------------

  // get stores
  const stores = getStores(BASE_PATH, APP_PATH)
  if (stores.length) {
    // ensure store is enabled
    if (!this.options.store) {
      this.options.store = true
    }

    // setup plugin
    this.addPlugin({
      src: resolve(__dirname, 'plugin.js'),
      fileName: 'areas.js',
      options: {
        ...options,
        stores,
      },
    })
  }

}

nuxtModule.meta = { name, version }

export default nuxtModule
