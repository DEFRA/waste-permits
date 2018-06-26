'use strict'

const Dynamics = require('../dynamics')
const Routes = require('../routes')
const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const {WAMITAB_QUALIFICATION, REGISTERED_ON_A_COURSE, DEEMED_COMPETENCE, ESA_EU_SKILLS} = Dynamics.TechnicalQualification

module.exports = class TechnicalQualificationController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {application} = await RecoveryService.createApplicationContext(h, {application: true})

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

    return this.showView({request, h, pageContext})
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const context = await RecoveryService.createApplicationContext(h, {application: true})
      const {application} = context

      application.technicalQualification = request.payload['technical-qualification']
      await application.save(context)

      return this.redirect({request, h, redirectPath: await TechnicalQualificationController._getPath(application.technicalQualification)})
    }
  }

  static async _getPath (technicalQualification) {
    switch (parseInt(technicalQualification)) {
      case WAMITAB_QUALIFICATION.TYPE:
        return Routes.UPLOAD_WAMITAB_QUALIFICATION.path
      case REGISTERED_ON_A_COURSE.TYPE:
        return Routes.UPLOAD_COURSE_REGISTRATION.path
      case DEEMED_COMPETENCE.TYPE:
        return Routes.UPLOAD_DEEMED_EVIDENCE.path
      case ESA_EU_SKILLS.TYPE:
        return Routes.UPLOAD_ESA_EU_SKILLS.path
      default:
        throw new Error(`Unexpected technical qualification (${technicalQualification})`)
    }
  }
}
