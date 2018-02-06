'use strict'

const Constants = require('../../../constants')
const BaseController = require('../../base.controller')

// This is part of the Site Details story that is a later development
// const CookieService = require('../../../services/cookie.service')
// const SiteNameAndLocation = require('../../../models/taskList/siteNameAndLocation.model')

module.exports = class AddressManualSiteController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    // This is part of the Site Details story that is a later development

    // const authToken = CookieService.getAuthToken(request)
    // const applicationId = CookieService.getApplicationId(request)
    // const applicationLineId = CookieService.getApplicationLineId(request)

    // if (request.payload) {
    //   // If we have Address details in the payload then display them in the form
    //   pageContext.formValues = request.payload
    // } else {
    //   const address = await SiteNameAndLocation.getAddress(request, authToken, applicationId, applicationLineId)
    //   if (address) {
    //     pageContext.formValues = {
    //       'postcode': address.postcode
    //     }
    //   }
    // }

    return reply.view('address/manualEntry', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
    // This is part of the Site Details story that is a later development

    //   const authToken = CookieService.getAuthToken(request)
    //   const applicationId = CookieService.getApplicationId(request)
    //   const applicationLineId = CookieService.getApplicationLineId(request)

    //   const address = {
    //     postcode: request.payload['postcode']
    //   }
    //   await SiteNameAndLocation.saveAddress(request, address,
    //     authToken, applicationId, applicationLineId)

      return reply.redirect(Constants.Routes.TASK_LIST.path)
    }
  }
}
