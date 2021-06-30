'use strict'

const Dynamics = require('../dynamics')
const Routes = require('../routes')
const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const { WAMITAB_QUALIFICATION, REGISTERED_ON_A_COURSE, DEEMED_COMPETENCE, ESA_EU_SKILLS } = Dynamics.TechnicalQualification

module.exports = class TechnicalQualificationController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const { application } = await RecoveryService.createApplicationContext(h, { application: true })

    if (request.payload) {
      pageContext.formValues = request.payload
    } else if (application) {
      pageContext.formValues = {
        'technical-qualification': application.technicalQualification
      }
    }

    Object.assign(pageContext.formValues, {
      wamitab: WAMITAB_QUALIFICATION.TYPE,
      'getting-qualification': REGISTERED_ON_A_COURSE.TYPE,
      deemed: DEEMED_COMPETENCE.TYPE,
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

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const { application } = context

    application.technicalQualification = request.payload['technical-qualification']
    await application.save(context)

    return this.redirect({ h, route: await TechnicalQualificationController._getRoute(application.technicalQualification) })
  }

  static async _getRoute (technicalQualification) {
    switch (parseInt(technicalQualification)) {
      case WAMITAB_QUALIFICATION.TYPE:
        return Routes.UPLOAD_WAMITAB_QUALIFICATION
      case REGISTERED_ON_A_COURSE.TYPE:
        return Routes.UPLOAD_COURSE_REGISTRATION
      case DEEMED_COMPETENCE.TYPE:
        return Routes.UPLOAD_DEEMED_EVIDENCE
      case ESA_EU_SKILLS.TYPE:
        return Routes.UPLOAD_ESA_EU_SKILLS
      default:
        throw new Error(`Unexpected technical qualification (${technicalQualification})`)
    }
  }
}
