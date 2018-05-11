'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')

module.exports = class PermitHolderNameAndDateOfBirthController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    
    if (request.payload) {
        pageContext.formValues = request.payload
    }

    return this.showView({request, h, pageContext})
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      // TODO: Save details

      return this.redirect({request, h, redirectPath: Constants.Routes.COMPANY_DECLARE_OFFENCES.path})
    }
  }
}