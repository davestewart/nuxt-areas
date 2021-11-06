export function sortBy (prop) {
  return function (a, b) {
    const aVal = a[prop]
    const bVal = b[prop]
    return aVal < bVal
      ? -1
      : aVal > bVal
        ? 1
        : 0
  }
}
