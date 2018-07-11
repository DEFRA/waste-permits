'use strict'

const moment = require('moment')

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

  static _leftPad (value, len) {
    let str = '' + value
    while (str.length < len) {
      str = `0${str}`
    }
    return str
  }

  // Extracts the day from a date that is in YYYY-MM-DD format
  static extractDayFromDate (inputDate) {
    // Return the day of birth, with the leading zero Stripped if there is one
    return parseInt(inputDate.split('-').pop())
  }

  // Formats the date object (e.g. { day: 31, month: 1, year: 1970 }) into YYYY-MM-DD format (e.g. 1970-01-31) ready for persistence
  static formatDateForPersistence (inputDate) {
    return `${inputDate.year}-${inputDate.month}-${inputDate.day}`
  }

  // Formats the date object (e.g. { day: 31, month: 1, year: 1970 }) into MMMM YYYY format (e.g. January 1970) for display
  static formatDateForDisplay (inputDate) {
    let returnValue
    if (inputDate && inputDate.month && inputDate.year) {
      returnValue = moment(`${inputDate.year}-${Utilities._leftPad(inputDate.month, 2, 0)}-01`).format('MMMM YYYY')
    } else {
      returnValue = 'Unknown date'
    }
    return returnValue
  }

  // Formats the date object (e.g. { day: 3, month: 1, year: 1970 }) into D MMMM YYYY format (e.g. 3 January 1970) for display
  static formatFullDateForDisplay (inputDate) {
    let returnValue
    if (inputDate && inputDate.day && inputDate.month && inputDate.year) {
      returnValue = moment(`${inputDate.year}-${Utilities._leftPad(inputDate.month, 2)}-${Utilities._leftPad(inputDate.day, 2)}`).format('D MMMM YYYY')
    } else {
      returnValue = 'Unknown date'
    }
    return returnValue
  }

  static firstCharToLowercase (str) {
    return str[0].toLowerCase() + str.substr(1)
  }
}
