import Path from 'path-browserify'

/**
 * Resolves a sequence of paths or path segments into an absolute path
 * @see https://nodejs.org/api/path.html#pathresolvepaths
 *
 * @param   {...string[]}  paths
 * @returns {string}
 */
export function resolve (...paths) {
  return Path.resolve(...paths)
}

/**
 * Joins all given path segments together then normalizes the resulting path
 * @see https://nodejs.org/api/path.html#pathjoinpaths
 *
 * @param   {...string[]}  paths
 * @returns {string}
 */
export function join (...paths) {
  return Path.join(...paths.map(path => fixPath(path)))
}

/**
 * Get the relative path from one to another
 * @see https://nodejs.org/api/path.html#pathrelativefrom-to
 *
 * @param   {string}  from
 * @param   {string}  to
 * @returns {string}
 */
export function relative (from, to) {
  return Path.relative(fixPath(from), fixPath(to))
}

/**
 * Fix a windows path so it plays nicely with resolve, join, etc
 *
 * @param   {string}  path
 * @returns {string}
 */
export function fixPath (path) {
  return path.replace(/\\/g, '/').replace(/^\w:/, '')
}
