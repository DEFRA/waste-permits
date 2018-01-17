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
      let month = inputDate.month.toString()
      if (month && month.length === 1) {
        // Pad with a leading zero if required
        month = '0' + month
      }
      returnValue = moment(`${inputDate.year}-${month}-01`).format('MMMM YYYY')
    } else {
      returnValue = 'Unknown date'
    }
    return returnValue
  }
}
