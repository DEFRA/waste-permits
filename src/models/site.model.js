'use strict'

const BaseModel = require('./base.model')

module.exports = class Site extends BaseModel {
  constructor (site) {
    super()
    this.siteName = site.siteName
    this.gridRef = site.gridRef
  }

  isValid () {
    // TODO validation
    return (typeof this.gridRef !== 'undefined' && this.gridRef !== '' &&
      typeof this.siteName !== 'undefined' && this.siteName !== '')
  }
}
