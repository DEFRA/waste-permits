'use strict'

const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

const PartnerDetails = require('../../models/taskList/partnerDetails.task')

const { TECHNICAL_PROBLEM, POSTCODE_PARTNER } = require('../../routes')

module.exports = class PartnershipContactDetailsController extends BaseController {
  async doGet (request, h, errors) {
    // Load entity context within the request object
    await RecoveryService.createApplicationContext(h)
    const contactDetail = await PartnerDetails.getContactDetail(request)

    if (!contactDetail) {
      return this.redirect({ request, h, redirectPath: TECHNICAL_PROBLEM.path })
    }

    this.route.pageHeading = await PartnerDetails.getPageHeading(request, this.orginalPageHeading)
    const pageContext = this.createPageContext(request, errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const { email, telephone } = contactDetail
      pageContext.formValues = { email, telephone }
    }

    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const context = await RecoveryService.createApplicationContext(h)
      const contactDetail = await PartnerDetails.getContactDetail(request)

      if (!contactDetail) {
        return this.redirect({ request, h, redirectPath: TECHNICAL_PROBLEM.path })
      }

      const {
        email,
        telephone
      } = request.payload

      contactDetail.email = email
      contactDetail.telephone = telephone

      await contactDetail.save(context)

      return this.redirect({ request, h, redirectPath: `${POSTCODE_PARTNER.path}/${request.params.partnerId}` })
    }
  }
}
