'use strict'

module.exports = class BaseModel {
  toString () {
    // Class name
    let returnValue = `${this.constructor.name}: {\n`

    // Properties
    for (let key in this) {
      if (this.hasOwnProperty(key) && typeof this[key] !== 'function') {
        returnValue += `  ${key}: ${this[key]},\n`
      }
    }
    // Strip the final comma and append closing brace
    returnValue = returnValue.replace(/,([^,]*)$/, '$1')
    returnValue += `}`

    return returnValue
  }
}
