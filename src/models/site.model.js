'use strict'

const DynamicsService = require('../services/dynamics.service')

module.exports = class Site {
  constructor (site) {
    if (site) {
      this.siteName = site.siteName
      this.gridRef = site.gridRef
    }
  }

  isValid () {
    // TODO validation
    return (this.siteName && this.siteTelephone && this.siteEmail)
  }

  save (crmToken) {
    const dynamicsService = new DynamicsService(crmToken)

    // Define the query
    const query = 'sites'

    // Save the Site
    dynamicsService.create(this, query)

    // TODO error handling
    return true
  }

  list (crmToken) {
    const dynamicsService = new DynamicsService(crmToken)

    // Define the query
    const query = 'sites?$select=ABC,DEF'

    // List the Sites
    return dynamicsService.list(query)
  }

  toString () {
    return 'Site: { \n' +
      '  siteName: ' + this.siteName + '\n' +
      '  gridRef: ' + this.gridRef + '\n' +
      '}'
  }
}
