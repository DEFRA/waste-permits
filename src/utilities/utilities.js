'use strict'

module.exports = class Utilities {
  // This method iterates though the data object properties and converts any null values to undefined
  static convertFromDynamics (dataObject) {
    for (let [key, value] of Object.entries(dataObject)) {
      dataObject[key] = Utilities._replaceNull(value)
    }
    return dataObject
  }

  // This method iterates though the data object properties and converts any undefined values to null
  static convertToDynamics (dataObject) {
    for (let [key, value] of Object.entries(dataObject)) {
      dataObject[key] = Utilities._replaceUndefined(value)
    }
    return dataObject
  }

  static stripWhitespace (value) {
    if (value) {
      value = value.replace(/\s/g, '')
    }
    return value
  }

  static _replaceNull (value) {
    if (value === null) {
      value = undefined
    }
    return value
  }

  static _replaceUndefined (value) {
    if (value === undefined) {
      value = null
    }
    return value
  }
}
