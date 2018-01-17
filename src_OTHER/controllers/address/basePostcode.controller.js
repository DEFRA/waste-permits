'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const PostcodeValidator = require('../../validators/address/postcode.validator')
const CookieService = require('../../services/cookie.service')
const LoggingService = require('../../services/logging.service')
const SiteNameAndLocation = require('../../models/taskList/siteNameAndLocation.model')

module.exports = class BasePostcodeController extends BaseController {
  constructor (route, cookieValidationRequired, nextRoute, validator) {
    super(route, cookieValidationRequired)
    this.validator = validator
    this.nextPath = nextRoute.path
  }

  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors, new PostcodeValidator())
    const authToken = CookieService.getAuthToken(request)
    const applicationId = CookieService.getApplicationId(request)
    const applicationLineId = CookieService.getApplicationLineId(request)

    if (request.payload) {
      // If we have Address details in the payload then display them in the form
      pageContext.formValues = request.payload
    } else {
      const address = await SiteNameAndLocation.getAddress(request, authToken, applicationId, applicationLineId)
      if (address) {
        pageContext.formValues = {
          'postcode': address.postcode
        }
      }
    }

    pageContext.manualAddressLink = Constants.Routes.ADDRESS.MANUAL_INVOICE.path

    return reply.view('address/postcode', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      const authToken = CookieService.getAuthToken(request)
      const applicationId = CookieService.getApplicationId(request)
      const applicationLineId = CookieService.getApplicationLineId(request)

      const address = {
        postcode: request.payload['postcode']
      }
      await SiteNameAndLocation.saveAddress(request, address,
        authToken, applicationId, applicationLineId)

      return reply.redirect(Constants.Routes.ADDRESS.SELECT_INVOICE.path)
    }
  }

  // TODO remove this

  // async doGet (request, reply, errors) {
  //   const pageContext = this.createPageContext(errors, this.validator)
  //   pageContext.uploadFormAction = `${this.path}/upload`
  //   const authToken = CookieService.getAuthToken(request)
  //   const applicationId = CookieService.getApplicationId(request)
  //   const list = await Annotation.listByApplicationId(authToken, applicationId)
  //   pageContext.annotations = list.map(({filename, id}) => ({filename, removeAction: `${this.path}/remove/${id}`}))

  //   pageContext.canContinue = pageContext.annotations && pageContext.annotations.length

  //   pageContext.fileTypes = this.validator.formatValidTypes()
  //   pageContext.maxSize = this.validator.getMaxSize()
  //   Object.assign(pageContext, this.getSpecificPageContext())

  //   return reply.view('uploadEvidence', pageContext)
  // }

  // async doPost (request, reply, errors) {
  //   if (errors && errors.data.details) {
  //     return this.doGet(request, reply, errors)
  //   } else {
  //     const authToken = CookieService.getAuthToken(request)
  //     const applicationId = CookieService.getApplicationId(request)
  //     const applicationLineId = CookieService.getApplicationLineId(request)
  //     if (this.updateCompleteness) {
  //       await this.updateCompleteness(authToken, applicationId, applicationLineId)
  //     }
  //     return reply.redirect(this.nextPath)
  //   }
  // }
}
