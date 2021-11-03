import { resolve } from 'path'
import { name, version } from '../package.json'
import { getRoutes } from './services/routes.js'
import { getStores } from './services/store.js'

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
    app: 'app'
  }

  // get areas options
  options = Object.assign({}, defaults, this.options.areas, options)

  // constants
  const BASE_PATH = options.base
  const APP_PATH = `${options.base}/${options.app}`

  // @see https://nuxtjs.org/docs/configuration-glossary/configuration-dir
  Object.assign(this.options.dir, {
    layouts: `${APP_PATH}/layouts`,
    pages: `${APP_PATH}/pages`,
    store: `${APP_PATH}/store`,
  })

  // ---------------------------------------------------------------------------------------------------------------------
  // components
  // ---------------------------------------------------------------------------------------------------------------------

  // set component options
  if (!this.options.components) {
    this.options.components = []
  }

  // @see https://nuxtjs.org/docs/configuration-glossary/configuration-components
  this.options.components.push({
      path: BASE_PATH,
      pattern: '*/components/**/*.{vue,js,ts,tsx}',
      pathPrefix: false,
    },
  )

  // ---------------------------------------------------------------------------------------------------------------------
  // routes
  // ---------------------------------------------------------------------------------------------------------------------

  // @see https://nuxtjs.org/docs/configuration-glossary/configuration-router#extendroutes
  this.extendRoutes(function (routes) {
    const areaRoutes = getRoutes(BASE_PATH)
    routes.push(...areaRoutes)
  })

  // ---------------------------------------------------------------------------------------------------------------------
  // store
  // ---------------------------------------------------------------------------------------------------------------------

  // set store
  this.options.store = true

  // get stores
  const stores = getStores(BASE_PATH, APP_PATH)

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

nuxtModule.meta = { name, version }

export default nuxtModule
