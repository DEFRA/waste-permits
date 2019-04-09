
'use strict'

const BaseController = require('./base.controller')
const { FACILITY_TYPES } = require('../dynamics')

module.exports = class FacilityTypeController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    pageContext.facilityTypes = Object.keys(FACILITY_TYPES)
      .map((facilityType) => FACILITY_TYPES[facilityType])

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const { 'facility-type': facilityType } = request.payload

    return this.redirect({ h, path: `/select/bespoke/${facilityType}` })
  }
}
