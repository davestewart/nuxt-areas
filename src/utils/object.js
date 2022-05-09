/**
 * Simple clone function
 *
 * @param   {any}   data     The object to clone
 * @returns {any}
 */
export function clone (data) {
  return JSON.parse(JSON.stringify(data))
}
