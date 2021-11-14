import { resolve, join } from 'upath'
import { existsSync } from 'fs'
import { name, version } from '../package.json'
import { getRoutes, makeRouteOptions } from './services/routes.js'
import { getStores } from './services/store.js'
import { getAreas, getExternal, getAreasConfigFiles } from './services/areas.js'
import { saveDebugData, saveDebugFile } from './services/debug.js'
import { getAliasedPath } from './utils/paths.js'

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

  // ---------------------------------------------------------------------------------------------------------------------
  // areas
  // ---------------------------------------------------------------------------------------------------------------------

  // get areas
  const areas = getAreas(ABS_BASE_PATH)
    .filter(area => area.path !== ABS_APP_PATH)

  // add external packages
  if (options.external) {
    options.external.forEach(entry => {
      const { src, route, namespace } = entry
      if (!route) {
        console.warn(`[ AREAS ] External area "${src}" must be configured with a route`)
        return
      }
      const area = getExternal(src, route, namespace)
      if (area) {
        areas.push(area)
      }
    })
  }

  // debug
  debug.areas = areas

  // ---------------------------------------------------------------------------------------------------------------------
  // watch
  // ---------------------------------------------------------------------------------------------------------------------

  // @see https://nuxtjs.org/docs/configuration-glossary/configuration-watch#the-watch-property
  if (this.options.dev) {
    // watch
    const watch = [
      __dirname + '/**', // this package
    ]

    // add any config files to watch
    watch.push(...getAreasConfigFiles(areas))

    this.options.watch.push(...watch)

    // debug
    debug.watch = watch
  }

  // ---------------------------------------------------------------------------------------------------------------------
  // folders + aliases
  // ---------------------------------------------------------------------------------------------------------------------

  // webpack aliases
  const aliases = {}

  // reconfigure nuxt dirs from areas/app/* if folders exist
  if (existsSync(ABS_APP_PATH)) {
    const dirs = ['components', 'layouts', 'pages', 'store']
    for (const dir of dirs) {
      const absDirPath = join(ABS_APP_PATH, dir)
      const relDirPath = join(REL_APP_PATH, dir)
      if (existsSync(absDirPath)) {
        // @see https://nuxtjs.org/docs/configuration-glossary/configuration-dir
        this.options.dir[dir] = relDirPath

        // @see https://nuxtjs.org/docs/configuration-glossary/configuration-alias/
        this.options.alias[dir] = absDirPath

        // @see https://webpack.js.org/configuration/resolve/#resolvealias
        aliases['~/' + dir] = absDirPath

        // if store has moved, update options
        if (dir === 'store') {
          this.options.store = true
          debug.nuxt.store = true
        }

        // debug
        debug.nuxt.dir = this.options.dir
        debug.nuxt.alias = this.options.alias
      }
    }
  }

  // update webpack aliases
  if (options.aliases) {
    // @see https://nuxtjs.org/docs/internals-glossary/internals-module-container#extendbuild-fn
    this.extendBuild((config) => {
      // solves a bug where `areas` is sometimes not found during build
      aliases[options.base] = ABS_BASE_PATH

      // update
      config.resolve.alias = Object.assign(aliases, config.resolve.alias)

      // debug
      if (config.name === 'server') {
        saveDebugFile(ABS_BASE_PATH, 'webpack', { resolve: { alias: config.resolve.alias }})
      }
    })
  }

  // ---------------------------------------------------------------------------------------------------------------------
  // components
  // ---------------------------------------------------------------------------------------------------------------------

  // ensure nuxt components is an array
  const optionsComponents = this.options.components
  if (!Array.isArray(optionsComponents)) {
    this.options.components = []
  }

  // add current components folder
  const pattern = '**/*.{vue,js,ts,tsx}'
  const components = [{
    path: `~/${this.options.dir.components || 'components'}`,
    pattern,
    pathPrefix: false,
  }]

  // add areas components folders
  areas.forEach(function (area) {
    components.push({
      path: getAliasedPath(area.path),
      pattern: `components/${pattern}`,
      pathPrefix: false,
    })
  })

  // @see https://nuxtjs.org/docs/configuration-glossary/configuration-components
  // @see https://github.com/nuxt/components#directories
  this.options.components.push(...components)

  // debug
  debug.nuxt.components = this.options.components

  // ---------------------------------------------------------------------------------------------------------------------
  // routes
  // ---------------------------------------------------------------------------------------------------------------------

  // routes
  const routes = getRoutes(areas, makeRouteOptions(this))

  // @see https://nuxtjs.org/docs/configuration-glossary/configuration-router#extendroutes
  this.extendRoutes((allRoutes) => {
    routes.forEach(route => {
      // Nuxt 2: passes in existing routes during HMR, so remove old ones to prevent duplicates
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
      debug.nuxt.store = true
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
  // debug
  // ---------------------------------------------------------------------------------------------------------------------

  if (options.debug) {
    console.info(' [ AREAS ] Dumping debug info')
    saveDebugData(ABS_BASE_PATH, debug)
  }
}

nuxtModule.meta = {
  name,
  version
}

export default nuxtModule
