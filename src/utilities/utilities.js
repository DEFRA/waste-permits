'use strict'

module.exports = class Utilities {
  static replaceNull (value) {
    if (value === null) {
      value = undefined
    }
    return value
  }

  static UndefinedToNull (value) {
    if (value === undefined) {
      value = null
    }
    return value
  }

  static stripWhitespace (value) {
    if (value) {
      value = value.replace(/\s/g, '')
    }
    return value
  }
}
