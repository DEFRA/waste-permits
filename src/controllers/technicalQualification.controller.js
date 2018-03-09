'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const {WAMITAB_QUALIFICATION, REGISTERED_ON_A_COURSE, DEEMED_COMPETENCE, ESA_EU_SKILLS} = Constants.Dynamics.TechnicalQualification

module.exports = class TechnicalQualificationController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    const {application} = await this.createApplicationContext(request, {application: true})

    if (application.isSubmitted()) {
      return this.redirect(request, reply, Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
    }

    if (request.payload) {
      pageContext.formValues = request.payload
    } else if (application) {
      pageContext.formValues = {
        'technical-qualification': application.technicalQualification
      }
    }

    Object.assign(pageContext.formValues, {
      'wamitab': WAMITAB_QUALIFICATION.TYPE,
      'getting-qualification': REGISTERED_ON_A_COURSE.TYPE,
      'deemed': DEEMED_COMPETENCE.TYPE,
      'esa-eu': ESA_EU_SKILLS.TYPE
    })

    switch (pageContext.formValues['technical-qualification']) {
      case WAMITAB_QUALIFICATION.TYPE:
        pageContext.wamitabChecked = true
        break
      case REGISTERED_ON_A_COURSE.TYPE:
        pageContext.gettingCourseChecked = true
        break
      case DEEMED_COMPETENCE.TYPE:
        pageContext.deemedChecked = true
        break
      case ESA_EU_SKILLS.TYPE:
        pageContext.esaEuChecked = true
        break
    }

    return this.showView(request, reply, 'technicalQualification', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.details) {
      return this.doGet(request, reply, errors)
    } else {
      const {authToken, application} = await this.createApplicationContext(request, {application: true})

      application.technicalQualification = request.payload['technical-qualification']
      await application.save(authToken)

      return this.redirect(request, reply, await TechnicalQualificationController._getPath(application.technicalQualification))
    }
  }

  static async _getPath (technicalQualification) {
    switch (parseInt(technicalQualification)) {
      case WAMITAB_QUALIFICATION.TYPE:
        return Constants.Routes.UPLOAD_WAMITAB_QUALIFICATION.path
      case REGISTERED_ON_A_COURSE.TYPE:
        return Constants.Routes.UPLOAD_COURSE_REGISTRATION.path
      case DEEMED_COMPETENCE.TYPE:
        return Constants.Routes.UPLOAD_DEEMED_EVIDENCE.path
      case ESA_EU_SKILLS.TYPE:
        return Constants.Routes.UPLOAD_ESA_EU_SKILLS.path
      default:
        throw new Error(`Unexpected technical qualification (${technicalQualification})`)
    }
  }
}
