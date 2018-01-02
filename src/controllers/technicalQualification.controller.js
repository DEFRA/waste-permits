'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const TechnicalQualificationValidator = require('../validators/technicalQualification.validator')
const CookieService = require('../services/cookie.service')
const Application = require('../models/application.model')
const {WAMITAB_QUALIFICATION, REGISTERED_ON_A_COURSE, DEEMED_COMPETENCE, ESA_EU_SKILLS} = Constants.Dynamics.TechnicalQualification

module.exports = class TechnicalQualificationController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors, new TechnicalQualificationValidator())

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const authToken = CookieService.getAuthToken(request)
      const applicationId = CookieService.getApplicationId(request)
      const application = await Application.getById(authToken, applicationId)
      if (application) {
        pageContext.formValues = {
          'technical-qualification': application.technicalQualification,
          'wamitab': WAMITAB_QUALIFICATION,
          'getting-qualification': REGISTERED_ON_A_COURSE,
          'deemed': DEEMED_COMPETENCE,
          'esa-eu': ESA_EU_SKILLS
        }
      }
    }
    switch (pageContext.formValues['technical-qualification']) {
      case WAMITAB_QUALIFICATION:
        pageContext.wamitabChecked = true
        break
      case REGISTERED_ON_A_COURSE:
        pageContext.gettingCourseChecked = true
        break
      case DEEMED_COMPETENCE:
        pageContext.deemedChecked = true
        break
      case ESA_EU_SKILLS:
        pageContext.esaEuChecked = true
        break
    }
    return reply
      .view('technicalQualification', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      const authToken = CookieService.getAuthToken(request)
      const applicationId = CookieService.getApplicationId(request)
      const application = await Application.getById(authToken, applicationId)
      application.technicalQualification = request.payload['technical-qualification']
      await application.save(authToken)
      return reply.redirect(await TechnicalQualificationController._getPath(application.technicalQualification))
    }
  }

  static async _getPath (technicalQualification) {
    switch (parseInt(technicalQualification)) {
      case WAMITAB_QUALIFICATION:
        return Constants.Routes.UPLOAD_WAMITAB_QUALIFICATION.path
      case REGISTERED_ON_A_COURSE:
        return Constants.Routes.UPLOAD_COURSE_REGISTRATION.path
      case DEEMED_COMPETENCE:
        return Constants.Routes.UPLOAD_DEEMED_EVIDENCE.path
      case ESA_EU_SKILLS:
        return Constants.Routes.UPLOAD_ESA_EU_SKILLS.path
      default:
        throw new Error(`Unexpected technical qualification (${technicalQualification})`)
    }
  }
}
