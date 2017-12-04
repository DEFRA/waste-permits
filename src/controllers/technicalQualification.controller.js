'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const TechnicalQualification = require('../models/taskList/technicalQualification.model')
const TechnicalQualificationValidator = require('../validators/technicalQualification.validator')
const CookieService = require('../services/cookie.service')
const Application = require('../models/application.model')

module.exports = class TechnicalQualificationController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors, TechnicalQualificationValidator)
    const {WAMITAB_QUALIFICATION, REGISTERED_ON_A_COURSE, DEEMED_COMPETENCE, ESA_EU_SKILLS} = Constants.TechnicalQualification

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
      const applicationLineId = CookieService.getApplicationLineId(request)
      const application = await Application.getById(authToken, applicationId)
      application.technicalQualification = request.payload['technical-qualification']
      await application.save(authToken)
      await TechnicalQualification.updateCompleteness(authToken, applicationId, applicationLineId)
      return reply.redirect(Constants.Routes.TASK_LIST.path)
    }
  }
}
