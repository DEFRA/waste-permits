'use strict'

const BaseModel = require('./base.model')

module.exports = class Site extends BaseModel {
  constructor (site) {
    super()
    if (site) {
      this.siteName = site.siteName
      this.gridRef = site.gridRef
    }
  }

  isValid () {
    // TODO validation
    return (this.siteName && this.siteTelephone && this.siteEmail)
  }
}
