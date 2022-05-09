import Path from 'path-browserify'

/**
 * Convenience function to resolve one or more path segments into a proper path
 *
 * @param   {string}    segments   An array of path segments
 * @returns {string|*}             The resolved path
 */
export function resolve (...segments) {
  return Path.resolve(...segments)
}
