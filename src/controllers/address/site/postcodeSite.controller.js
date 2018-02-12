'use strict'

const Constants = require('../../../constants')
const BaseController = require('../../base.controller')
const CookieService = require('../../../services/cookie.service')
const Address = require('../../../models/address.model')
const SiteNameAndLocation = require('../../../models/taskList/siteNameAndLocation.model')

module.exports = class PostcodeSiteController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    const authToken = CookieService.getAuthToken(request)
    const applicationId = CookieService.getApplicationId(request)
    const applicationLineId = CookieService.getApplicationLineId(request)

    if (request.payload) {
      // If we have Address details in the payload then display them in the form
      pageContext.formValues = request.payload
    } else {
      const address = await SiteNameAndLocation.getAddress(request, authToken, applicationId, applicationLineId)
      if (address) {
        // If the manual entry flag is set then redirect off to the mamual address entry page instead
        if (!address.fromAddressLookup) {
          return reply.redirect(Constants.Routes.ADDRESS.MANUAL_SITE.path)
        }
        pageContext.formValues = {
          postcode: address.postcode
        }
      } else {
        // Get the postcode out of the Cookie if there is one
        let postcode = CookieService.get(request, Constants.CookieValue.SITE_POSTCODE)
        if (postcode) {
          postcode = postcode.toUpperCase()
        }
        pageContext.formValues = {
          postcode: postcode
        }
      }
    }

    pageContext.manualAddressLink = Constants.Routes.ADDRESS.MANUAL_SITE.path

    return reply.view('address/postcode', pageContext)
  }

  async doPost (request, reply, errors) {
    const authToken = CookieService.getAuthToken(request)
    const postcode = request.payload['postcode']
    const errorPath = 'postcode'

    // Save the postcode in the cookie
    CookieService.set(request, Constants.CookieValue.SITE_POSTCODE, postcode)

    let addresses
    try {
      addresses = await Address.listByPostcode(authToken, postcode)
    } catch (error) {
      if (!errors) {
        // Add error if the entered postcode led to an error being returned from AddressBase
        errors = this._addCustomError(errorPath, `"${errorPath}" is invalid`, 'invalid')
      }
    }

    if (!errors && addresses && addresses.length === 0) {
      // Add error if there are no addresses found
      errors = this._addCustomError(errorPath, `"${errorPath}" is required`, 'none.found')
    }

    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      return reply.redirect(Constants.Routes.ADDRESS.SELECT_SITE.path)

        // Add the updated cookie
        .state(Constants.COOKIE_KEY, request.state[Constants.COOKIE_KEY], Constants.COOKIE_PATH)
    }
  }

  _addCustomError (errorPath, message, type) {
    return {
      data: {
        details: [
          {
            message: message,
            path: [errorPath],
            type: type,
            context: { key: errorPath, label: errorPath }
          }]
      }
    }
  }
}
