'use strict'

const BaseController = require('../../base.controller')
const CookieService = require('../../../services/cookie.service')
const RecoveryService = require('../../../services/recovery.service')
const Address = require('../../../persistence/entities/address.entity')

module.exports = class AddressSelectController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const context = await RecoveryService.createApplicationContext(h)
    let addresses, address
    let postcode = CookieService.get(request, this.getPostcodeCookieKey())
    if (postcode) {
      postcode = postcode.toUpperCase()

      addresses = await Address.listByPostcode(context, postcode)
      address = await this.task.getAddress(request)

      if (!errors && address && addresses) {
        // Set a flag on the selected address
        const selectedAddress = addresses.find(({ uprn }) => uprn === address.uprn)
        if (selectedAddress) {
          selectedAddress.selected = true
        }
      }
    }

    // Handle missing values in case the user accesses this route without having been to the Enter Postcode route beforehand
    if (!postcode) {
      postcode = 'Not entered'
    }
    if (!addresses) {
      addresses = []
    }

    pageContext.formValues = {
      postcode: postcode,
      address: address,
      addresses: addresses
    }

    if (this.customisePageContext) {
      await this.customisePageContext(pageContext, request)
    }

    pageContext.changePostcodeLink = this.getPostcodePath(request.params)
    pageContext.manualAddressLink = this.getManualEntryPath(request.params)

    const { charityDetail } = context

    if (charityDetail && charityDetail.charityPermitHolder && this.route.pageHeadingCharity) {
      pageContext.pageHeading = this.route.pageHeadingCharity
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    // Load entity context within the request object
    await RecoveryService.createApplicationContext(h)

    const addressDto = {
      uprn: request.payload['select-address'],
      postcode: CookieService.get(request, this.getPostcodeCookieKey())
    }
    await this.task.saveSelectedAddress(request, addressDto)

    return this.redirect({ h })
  }
}
