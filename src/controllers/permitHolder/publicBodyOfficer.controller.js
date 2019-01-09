const BaseController = require('../base.controller')
const { RESPONSIBLE_CONTACT_DETAILS } = require('../../dynamics').AddressTypes
const RecoveryService = require('../../services/recovery.service')

const ContactDetail = require('../../models/contactDetail.model')

module.exports = class PublicBodyOfficerController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const context = await RecoveryService.createApplicationContext(h)
      const contactDetail = await ContactDetail.get(context, { type: RESPONSIBLE_CONTACT_DETAILS.TYPE })

      if (contactDetail) {
        const { firstName, lastName, jobTitle, email } = contactDetail
        pageContext.formValues = {
          'first-name': firstName,
          'last-name': lastName,
          'job-title': jobTitle,
          email
        }
      }
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const { applicationId } = context
    const type = RESPONSIBLE_CONTACT_DETAILS.TYPE
    const contactDetail = (await ContactDetail.get(context, { type })) || new ContactDetail({ applicationId, type })

    const {
      'first-name': firstName,
      'last-name': lastName,
      'job-title': jobTitle,
      email
    } = request.payload

    contactDetail.firstName = firstName
    contactDetail.lastName = lastName
    contactDetail.jobTitle = jobTitle
    contactDetail.email = email

    await contactDetail.save(context)

    return this.redirect({ h })
  }
}
