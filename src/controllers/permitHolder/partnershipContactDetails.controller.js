'use strict'

const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

const PartnerDetails = require('../../models/taskList/partnerDetails.task')

module.exports = class PartnershipContactDetailsController extends BaseController {
  async doGet (request, h, errors) {
    // Load entity context within the request object
    await RecoveryService.createApplicationContext(h)
    const contactDetail = await PartnerDetails.getContactDetail(request)

    if (!contactDetail) {
      throw new Error('Partner details not found')
    }

    this.route.pageHeading = await PartnerDetails.getPageHeading(request, this.orginalPageHeading)
    const pageContext = this.createPageContext(h, errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const { email, telephone } = contactDetail
      pageContext.formValues = { email, telephone }
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const contactDetail = await PartnerDetails.getContactDetail(request)

    if (!contactDetail) {
      throw new Error('Partner details not found')
    }

    const {
      email,
      telephone
    } = request.payload

    contactDetail.email = email
    contactDetail.telephone = telephone

    await contactDetail.save(context)

    return this.redirect({ h, path: `${this.nextPath}/${request.params.partnerId}` })
  }
}
