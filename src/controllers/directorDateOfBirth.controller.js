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
    try {
      const pageContext = this.createPageContext(Constants.Routes.DIRECTOR_DATE_OF_BIRTH, errors, DirectorDateOfBirthValidator)
      const authToken = CookieService.getAuthToken(request)
      const applicationId = CookieService.getApplicationId(request)

      let account = await Account.getByApplicationId(authToken, applicationId)
      if (!account) {
        // TODO apply this when the account has been created in Dynamics by the previous screen
        // LoggingService.logError(`Application ${applicationId} does not have an Account`, request)
        // return reply.redirect(Constants.Routes.ERROR.path)

        // TODO use this:
        // return reply.redirect(Constants.Routes.COMPANY_NUMBER.path)
        // return reply.redirect(Constants.Routes.TASK_LIST.path)

        // TODO remove this when the account has been created in Dynamics by the previous screen
        account = new Account({
          id: undefined,
          companyNumber: '02456473',
          companyName: undefined,
          tradingName: undefined
        })
      }

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

      return reply.view('directorDateOfBirth', pageContext)
    } catch (error) {
      LoggingService.logError(error, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return DirectorDateOfBirthController.doGet(request, reply, errors)
    } else {
      // const authToken = CookieService.getAuthToken(request)
      // const applicationId = CookieService.getApplicationId(request)
      // const applicationLineId = CookieService.getApplicationLineId(request)

      try {
        // await SiteNameAndLocation.saveSiteName(request, request.payload['site-name'],
        //   authToken, applicationId, applicationLineId)

        return reply.redirect(Constants.Routes.COMPANY_DECLARE_OFFENCES.path)
      } catch (error) {
        LoggingService.logError(error, request)
        return reply.redirect(Constants.Routes.ERROR.path)
      }
    }
  }
}
