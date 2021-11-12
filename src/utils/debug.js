import * as Util from 'util'

export function inspect (data, colors = false) {
  return Util.inspect(data, {
    compact: false,
    depth: null,
    colors,
  })
}
