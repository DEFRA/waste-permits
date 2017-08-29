'use strict'

const BaseModel = require('./base.model')

module.exports = class Site extends BaseModel {
  constructor (site) {
    super()
    this.siteName = site.siteName
    this.gridRef = site.gridRef
  }
}
