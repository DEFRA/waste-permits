'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const DirectorDateOfBirthValidator = require('../validators/directorDateOfBirth.validator')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const CompanyLookupService = require('../services/companyLookup.service')
const Account = require('../models/account.model')

module.exports = class DirectorDateOfBirthController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors, DirectorDateOfBirthValidator)
    const authToken = CookieService.getAuthToken(request)
    const applicationId = CookieService.getApplicationId(request)

    let account = await Account.getByApplicationId(authToken, applicationId)
    if (!account) {
      // TODO apply this when the account has been created in Dynamics by the previous screen
      LoggingService.logError(`Application ${applicationId} does not have an Account`, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }

    // TODO get Directors from Dynamics instead
    pageContext.directors = await CompanyLookupService.getDirectors(account.companyNumber)

    if (pageContext.directors.length > 1) {
      pageContext.pageHeading = Constants.Routes.DIRECTOR_DATE_OF_BIRTH.pageHeadingAlternate
      pageContext.pageTitle = Constants.buildPageTitle(Constants.Routes.DIRECTOR_DATE_OF_BIRTH.pageHeadingAlternate)
      // TODO change page title if there is an error using the following
      // if (errors && errors.data.details) {
      //   pageContext.pageTitle = `${Constants.PAGE_TITLE_ERROR_PREFIX} ${pageContext.pageTitle}`
      // }
    }

    pageContext.hasDirectors = pageContext.directors.length > 0

    // TOOD handle payload
    // if (request.payload) {
    //   // If we have Location name in the payload then display them in the form
    //   pageContext.formValues = request.payload
    // } else {
    //   pageContext.formValues = {
    //     'site-name': await SiteNameAndLocation.getSiteName(request, authToken, applicationId, applicationLineId)
    //   }
    // }

    return reply.view('directorDateOfBirth', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      // console.log(request.payload)

      // TODO save DOBs

      // const authToken = CookieService.getAuthToken(request)
      // const applicationId = CookieService.getApplicationId(request)
      // const applicationLineId = CookieService.getApplicationLineId(request)

      // await SiteNameAndLocation.saveSiteName(request, request.payload['site-name'],
      //   authToken, applicationId, applicationLineId)

      return reply.redirect(Constants.Routes.COMPANY_DECLARE_OFFENCES.path)
    }
  }
}
