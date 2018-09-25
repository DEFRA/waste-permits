const BaseController = require('../base.controller')
const { RESPONSIBLE_CONTACT_DETAILS } = require('../../dynamics').AddressTypes
const RecoveryService = require('../../services/recovery.service')

const ContactDetailService = require('../../services/contactDetail.service')

module.exports = class PublicBodyOfficerController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const context = await RecoveryService.createApplicationContext(h)
      const contactDetail = await ContactDetailService.get(context, { type: RESPONSIBLE_CONTACT_DETAILS.TYPE })

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

    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const context = await RecoveryService.createApplicationContext(h, { application: true })
      const contactDetail = (await ContactDetailService.get(context, { type: RESPONSIBLE_CONTACT_DETAILS.TYPE })) || new ContactDetailService({ type: RESPONSIBLE_CONTACT_DETAILS.TYPE })

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

      return this.redirect({ request, h, redirectPath: this.nextPath })
    }
  }
}
