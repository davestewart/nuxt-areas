import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { inspect } from 'util'

const comments = {
  areas: 'Areas generates this configuration to extend routes and register stores',
  components: 'these options are passed to Nuxt\'s components module',
  options: 'these are the final options used by the Areas module',
  routes: 'these are the route definitions generated by Areas to extend the core routes',
  stores: 'these are the store definitions generated by Areas to register Vuex stores',
  watch: 'these folders will be watched for changes in development mode',
  alias: 'Areas updated your webpack config.resolve.alias to look like this',
  nuxt: 'Areas updated your Nuxt options as follows',
}

export function getLogPath (path) {
  return resolve(path, '.debug')
}

export function setupDebugFolder (path) {
  // areas folder
  if (!existsSync(path)) {
    mkdirSync(path)
  }

  // debug folder
  const logsPath = getLogPath(path)
  if (!existsSync(logsPath)) {
    mkdirSync(logsPath)
    writeFileSync(resolve(logsPath, '.gitignore'), '*', 'utf8')
  }

  // return
  return logsPath
}

export function saveDebugData (path, data) {
  setupDebugFolder(path)
  Object.keys(data).forEach(key => {
    saveDebugFile(path, key, data[key])
  })
}

export function saveDebugFile (path, key, payload) {
  const logsPath = setupDebugFolder(path)
  const comment = comments[key]
  const file = resolve(logsPath, `${key}.js`)
  const data = `// ${comment}\nexport const ${key} = ` + inspect(payload, {
    depth: null,
    colors: false,
    compact: false
  })
  writeFileSync(file, data, 'utf8')
}