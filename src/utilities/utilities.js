'use strict'

module.exports = class Utilities {
  static stripWhitespace (value) {
    if (value) {
      value = value.replace(/\s/g, '')
    }
    return value
  }

  // This method iterates though the data object properties and converts any null values to undefined
  // in order to convert the values for use in the application
  static convertFromDynamics (dataObject) {
    Utilities._deepReplaceNull(dataObject)
    return dataObject
  }

  // This method iterates though the data object properties and converts any undefined values to null
  // in order to the values to be stored in Dynamics
  static convertToDynamics (dataObject) {
    Utilities._deepReplaceUndefined(dataObject)
    return dataObject
  }

  static _deepReplaceNull (dataObject) {
    for (let [key, value] of Object.entries(dataObject)) {
      if (typeof (value) === 'object' && value !== null) {
        Utilities._deepReplaceNull(value)
      } else {
        dataObject[key] = Utilities._replaceNull(value)
      }
    }
  }

  static _deepReplaceUndefined (dataObject) {
    for (let [key, value] of Object.entries(dataObject)) {
      if (typeof (value) === 'object' && value !== undefined) {
        Utilities._deepReplaceUndefined(value)
      } else {
        dataObject[key] = Utilities._replaceUndefined(value)
      }
    }
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
