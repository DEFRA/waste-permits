'use strict'

const BaseController = require('../../base.controller')
const CookieService = require('../../../services/cookie.service')
const RecoveryService = require('../../../services/recovery.service')
const Address = require('../../../models/address.model')

module.exports = class PostcodeController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)
    const {applicationId, applicationLineId} = await RecoveryService.createApplicationContext(h)

    if (request.payload) {
      // If we have Address details in the payload then display them in the form
      pageContext.formValues = request.payload
    } else {
      const address = await this.getModel().getAddress(request, applicationId, applicationLineId)
      if (address) {
        // If the manual entry flag is set then redirect off to the mamual address entry page instead
        if (!address.fromAddressLookup) {
          return this.redirect({request, h, redirectPath: this.getManualEntryRoute()})
        }
        pageContext.formValues = {
          postcode: address.postcode
        }
      } else {
        // Get the postcode out of the Cookie if there is one
        let postcode = CookieService.get(request, this.getPostcodeCookieKey())
        if (postcode) {
          postcode = postcode.toUpperCase()
        }
        pageContext.formValues = {
          postcode: postcode
        }
      }
    }

    this.customisePageContext(pageContext)
    pageContext.manualAddressLink = this.getManualEntryRoute()

    return this.showView({request, h, pageContext})
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    }

    const context = await RecoveryService.createApplicationContext(h)
    const postcode = request.payload['postcode']
    const errorPath = 'postcode'

    // Save the postcode in the cookie
    CookieService.set(request, this.getPostcodeCookieKey(), postcode)

    let addresses
    try {
      addresses = await Address.listByPostcode(context, postcode)
    } catch (error) {
      return this.redirect({request, h, redirectPath: `${this.getManualEntryRoute()}?addressLookupFailed=true`})
    }

    if (!errors && addresses && addresses.length === 0) {
      // Add error if there are no addresses found
      errors = this._addCustomError(errorPath, `"${errorPath}" is required`, 'none.found')
    }

    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      return this.redirect({request, h, redirectPath: this.getAddressSelectionPath()})
    }
  }

  _addCustomError (errorPath, message, type) {
    return {
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
