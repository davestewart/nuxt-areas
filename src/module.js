import { resolve, join } from 'path'
import { existsSync } from 'fs'
import { name, version } from '../package.json'
import { getRoutes } from './services/routes.js'
import { getStores } from './services/store.js'
import { getAreas, getPackage, getAreasConfigFiles } from './services/areas.js'
import { getAliasedPath } from './utils/fs.js'

const nuxtModule = function (options) {
  // ---------------------------------------------------------------------------------------------------------------------
  // options
  // ---------------------------------------------------------------------------------------------------------------------

  // defaults
  const defaults = {
    base: 'areas',
    app: 'app',
    aliases: true,
    debug: false,
  }

  // get areas options
  options = Object.assign({}, defaults, this.options.areas, options)

  // paths
  const REL_BASE_PATH = options.base
  const REL_APP_PATH = join(REL_BASE_PATH, options.app)
  const ABS_BASE_PATH = resolve(REL_BASE_PATH)
  const ABS_APP_PATH = resolve(REL_APP_PATH)

  // debug
  const debug = {
    options,
    nuxt: {}
  }

  // watch
  const watch = [
    __dirname + '/**', // this package
  ]

  // ---------------------------------------------------------------------------------------------------------------------
  // areas
  // ---------------------------------------------------------------------------------------------------------------------

  // get areas
  const areas = getAreas(ABS_BASE_PATH)
    .filter(area => area.path !== ABS_APP_PATH)

  // add external packages
  if (options.packages) {
    options.packages.forEach(entry => {
      const area = getPackage(entry.src, entry.route, entry.namespace)
      areas.push(area)
    })
  }

  // add any config files to watch
  watch.push(...getAreasConfigFiles(areas))

  // debug
  debug.areas = areas

  // ---------------------------------------------------------------------------------------------------------------------
  // folders + aliases
  // ---------------------------------------------------------------------------------------------------------------------

  // webpack aliases
  const aliases = {}

  // reconfigure nuxt dirs from areas/app/* if folders exist
  if (existsSync(ABS_APP_PATH)) {
    const dirs = ['components', 'layouts', 'pages', 'store']
    for (const dir of dirs) {
      const dirPath = join(REL_APP_PATH, dir)
      if (existsSync(dirPath)) {
        // @see https://nuxtjs.org/docs/configuration-glossary/configuration-dir
        this.options.dir[dir] = dirPath

        // webpack aliases
        aliases['~/' + dir] = './' + dirPath

        // debug
        debug.nuxt.dir = this.options.dir
      }
    }
  }

  // update webpack aliases
  if (options.aliases) {
    // @see https://nuxtjs.org/docs/internals-glossary/internals-module-container#extendbuild-fn
    this.extendBuild((config) => {
      // solves a bug where `areas` is sometimes not found
      aliases[options.base] = './' + REL_BASE_PATH

      // udpate
      config.resolve.alias = Object.assign(aliases, config.resolve.alias)
    })
  }

  // ---------------------------------------------------------------------------------------------------------------------
  // components
  // ---------------------------------------------------------------------------------------------------------------------

  // ensure components is an array
  if (this.options.components === true) {
    this.options.components = [
      `~/${this.options.dir.components || 'components'}`,
    ]
  }
  else if (!this.options.components) {
    this.options.components = []
  }

  // @see https://nuxtjs.org/docs/configuration-glossary/configuration-components
  // @see https://github.com/nuxt/components#directories
  const components = []
  areas.forEach(area => {
    components.push({
      path: getAliasedPath(area.path),
      pattern: 'components/**/*.{vue,js,ts,tsx}',
      pathPrefix: false,
    })
  })

  this.options.components.push(...components)

  // debug
  debug.nuxt.components = this.options.components

  // ---------------------------------------------------------------------------------------------------------------------
  // routes
  // ---------------------------------------------------------------------------------------------------------------------

  // routes
  const routes = getRoutes(areas, this.options)

  // @see https://nuxtjs.org/docs/configuration-glossary/configuration-router#extendroutes
  this.extendRoutes((allRoutes) => {
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

  // debug
  debug.routes = routes

  // ---------------------------------------------------------------------------------------------------------------------
  // store
  // ---------------------------------------------------------------------------------------------------------------------

  // get stores
  const stores = getStores(areas)
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

    // debug
    debug.stores = stores
  }

  // ---------------------------------------------------------------------------------------------------------------------
  // watch
  // ---------------------------------------------------------------------------------------------------------------------

  // @see https://nuxtjs.org/docs/configuration-glossary/configuration-watch#the-watch-property
  if (this.options.dev) {
    this.options.watch.push(...watch)

    // debug
    debug.watch = watch
  }
}

nuxtModule.meta = { name, version }

export default nuxtModule
