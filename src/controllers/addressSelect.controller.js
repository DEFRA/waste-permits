'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const AddressSelectValidator = require('../validators/addressSelect.validator')
const AddressLookupService = require('../services/addressLookup.service')
const CookieService = require('../services/cookie.service')
const SiteNameAndLocation = require('../models/taskList/siteNameAndLocation.model')

module.exports = class AddressSelectController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors, AddressSelectValidator)
    const authToken = CookieService.getAuthToken(request)
    const applicationId = CookieService.getApplicationId(request)
    const applicationLineId = CookieService.getApplicationLineId(request)

    if (request.payload) {
      // TODO confirm if we need this
      // If we have Address details in the payload then display them in the form
      // pageContext.formValues = request.payload
    } else {
      const address = await SiteNameAndLocation.getAddress(request, authToken, applicationId, applicationLineId)
      if (address) {
        pageContext.formValues = {
          postcode: address.postcode,
          addresses: await AddressLookupService.getAddressesFromPostcode(address.postcode)
        }
      }
    }
    pageContext.changePostcodeLink = Constants.Routes.POSTCODE.path
    pageContext.manualAddressLink = Constants.Routes.ADDRESS_MANUAL.path

    return reply.view('addressSelect', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      return reply.redirect(Constants.Routes.TASK_LIST.path)
    }
  }
}
