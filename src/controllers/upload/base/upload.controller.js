'use strict'

const Constants = require('../../../constants')
const BaseController = require('../../base.controller')
const CookieService = require('../../../services/cookie.service')
const LoggingService = require('../../../services/logging.service')
const RecoveryService = require('../../../services/recovery.service')
const UploadService = require('../../../services/upload.service')
const Annotation = require('../../../models/annotation.model')

module.exports = class UploadController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const context = await RecoveryService.createApplicationContext(h)
    const {applicationId} = context

    const list = await Annotation.listByApplicationIdAndSubject(context, applicationId, this.subject)

    if (request.payload) {
      pageContext.formValues = request.payload
    }

    pageContext.uploadFormAction = `${this.path}/upload`
    pageContext.annotations = list.map(({filename, id}) => ({filename, removeAction: `${this.path}/remove/${id}`}))
    pageContext.fileTypes = this.validator.formatValidTypes()
    pageContext.maxSize = this.validator.getMaxSize()
    pageContext.subject = this.subject

    if (this.getSpecificPageContext) {
      Object.assign(pageContext, await this.getSpecificPageContext(h))
    }

    return this.showView({request, h, pageContext})
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const context = await RecoveryService.createApplicationContext(h)
      const {applicationId, applicationLineId} = context

      const list = await Annotation.listByApplicationIdAndSubject(context, applicationId, this.subject)
      if (!list.length) {
        return this.handler(request, h, undefined, this.setCustomError('noFilesUploaded', 'file'))
      }
      if (this.updateCompleteness) {
        await this.updateCompleteness(context, applicationId, applicationLineId)
      }
      return this.redirect({request, h, redirectPath: this.nextPath})
    }
  }

  async upload (request, h, errors) {
    try {
      // Validate the cookie
      if (!CookieService.validateCookie(request)) {
        const message = 'Upload failed validating cookie'
        LoggingService.logError(message, request)
        return this.redirect({request, h, redirectPath: Constants.Routes.ERROR.TECHNICAL_PROBLEM.path, error: {message}})
      }

      // Post if it's not an attempt to upload a file
      if (!request.payload['is-upload-file']) {
        return this.doPost(request, h, errors)
      }

      // Apply custom validation if required
      if (this.validator && this.validator.customValidators) {
        errors = await this.validator.customValidate(request.payload, errors)
      }

      if (errors && errors.details) {
        return this.doGet(request, h, errors)
      }

      const context = await RecoveryService.createApplicationContext(h, {application: true})
      const {application} = context

      try {
        await UploadService.upload(context, application, request.payload.file, this.subject)
      } catch (err) {
        if (err.message === UploadService.DUPLICATE) {
          return this.handler(request, h, this.setCustomError(err.message, 'file'))
        } else if (err.message === UploadService.VIRUS) {
          return this.handler(request, h, this.setCustomError(err.message, 'file'))
        } else {
          throw err
        }
      }

      return this.redirect({request, h, redirectPath: this.path})
    } catch (error) {
      LoggingService.logError(error, request)
      return this.redirect({request, h, redirectPath: Constants.Routes.ERROR.TECHNICAL_PROBLEM.path, error})
    }
  }

  async remove (request, h) {
    // Validate the cookie
    if (!CookieService.validateCookie(request)) {
      const message = 'Remove failed validating cookie'
      LoggingService.logError(message, request)
      return this.redirect({request, h, redirectPath: Constants.Routes.ERROR.TECHNICAL_PROBLEM.path, error: {message}})
    }

    const context = await RecoveryService.createApplicationContext(h)
    const {applicationId} = context
    const annotationId = request.params.id
    const annotation = await Annotation.getById(context, annotationId)

    // make sure this annotation belongs to this application
    if (annotation.applicationId !== applicationId) {
      const message = 'Annotation and application mismatch'
      LoggingService.logError(message, request)
      return this.redirect({request, h, redirectPath: Constants.Routes.ERROR.TECHNICAL_PROBLEM.path, error: {message}})
    }
    await annotation.delete(context, annotationId)
    return this.redirect({request, h, redirectPath: this.path})
  }

  async uploadFailAction (request, h, errors) {
    if (errors && errors.output && errors.output.statusCode === Constants.Errors.REQUEST_ENTITY_TOO_LARGE) {
      errors = this.setCustomError('fileTooBig', 'file')
    }
    const result = await this.doGet(request, h, errors)
    return result.takeover()
  }
}
