function convertToCamel(name) {
  const array = name.split('_').map((word, index) => {
    if (index > 0) {
      return word[0].toUpperCase() + word.substring(1)
    }
    return word
  })
  return array.join('')
}

function convertKeys(record) {
  const converted = {}
  for (let key of Object.keys(record)) {
    const value = record[key]
    const convertedKey = convertToCamel(key)
    converted[convertedKey] = value
  }
  return converted
}

module.exports = convertKeys
