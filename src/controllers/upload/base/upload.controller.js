'use strict'

const fs = require('fs')
const path = require('path')
const del = require('del')
const { Stream } = require('stream')
const Constants = require('../../../constants')
const BaseController = require('../../base.controller')
const CookieService = require('../../../services/cookie.service')
const LoggingService = require('../../../services/logging.service')
const Annotation = require('../../../models/annotation.model')
const Application = require('../../../models/application.model')

const UPLOAD_PATH = path.resolve(`${process.cwd()}/temp`)

module.exports = class UploadController extends BaseController {
  constructor (...args) {
    const nextRoute = args[3]
    super(...args)
    this.nextPath = nextRoute.path
  }

  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    const authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)
    const applicationId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_ID)
    const application = await Application.getById(authToken, applicationId)
    const list = await Annotation.listByApplicationIdAndSubject(authToken, applicationId, this.subject)

    if (application.isSubmitted()) {
      return reply
        .redirect(Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
        .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
    }

    if (request.payload) {
      pageContext.formValues = request.payload
    }

    pageContext.uploadFormAction = `${this.path}/upload`
    pageContext.annotations = list.map(({filename, id}) => ({filename, removeAction: `${this.path}/remove/${id}`}))
    pageContext.fileTypes = this.validator.formatValidTypes()
    pageContext.maxSize = this.validator.getMaxSize()
    pageContext.subject = this.subject

    if (this.getSpecificPageContext) {
      Object.assign(pageContext, await this.getSpecificPageContext(request))
    }

    return reply
      .view(this.view, pageContext)
      .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      const authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)
      const applicationId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_ID)
      const applicationLineId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_LINE_ID)
      const list = await Annotation.listByApplicationIdAndSubject(authToken, applicationId, this.subject)
      if (!list.length) {
        return this.handler(request, reply, undefined, UploadController._customError('noFilesUploaded'))
      }
      if (this.updateCompleteness) {
        await this.updateCompleteness(authToken, applicationId, applicationLineId)
      }
      return reply
        .redirect(this.nextPath)
        .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
    }
  }

  async upload (request, reply, errors) {
    try {
      // Validate the cookie
      if (!CookieService.validateCookie(request)) {
        return reply.redirect(Constants.Routes.ERROR.TECHNICAL_PROBLEM.path)
      }

      // Post if it's not an attempt to upload a file
      if (!request.payload['is-upload-file']) {
        return this.doPost(request, reply, errors)
      }

      // Apply custom validation if required
      if (this.validator && this.validator.customValidators) {
        errors = await this.validator.customValidate(request.payload, errors)
      }

      if (errors && errors.data.details) {
        return this.doGet(request, reply, errors)
      }

      const authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)
      const applicationId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_ID)
      const {applicationName: applicationReference} = await Application.getById(authToken, applicationId)
      const annotationsList = await Annotation.listByApplicationIdAndSubject(authToken, applicationId, this.subject)

      // create temporary uploads directory
      const uploadPath = path.resolve(UPLOAD_PATH, applicationReference)
      this._createTempUploadDirectory(uploadPath)

      const fileData = this._getFileData(request.payload.file, uploadPath)

      // Make sure no duplicate files are uploaded
      if (this._haveDuplicateFiles(fileData, annotationsList)) {
        return this.handler(request, reply, undefined, UploadController._customError('duplicateFile'))
      }

      // Save each file as an attachment to an annotation
      const uploadPromises = fileData.map(async ({file, filename, path}) => {
        const documentBody = await this._uploadFile(file, filename, path)
        const {subject} = this
        const annotation = new Annotation({subject, filename, applicationId, documentBody})
        return annotation.save(authToken)
      })
      await Promise.all(uploadPromises)

      // Remove temporary uploads directory
      await this._removeTempUploadDirectory(uploadPath)
      return reply.redirect(this.path)
    } catch (error) {
      LoggingService.logError(error, request)
      return reply
        .redirect(Constants.Routes.ERROR.TECHNICAL_PROBLEM.path)
        .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
    }
  }

  async remove (request, reply) {
    // Validate the cookie
    if (!CookieService.validateCookie(request)) {
      return reply.redirect(Constants.Routes.ERROR.TECHNICAL_PROBLEM.path)
    }
    // const result = this.getRequestData(request)
    const authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)
    const applicationId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_ID)
    const annotationId = request.params.id
    const annotation = await Annotation.getById(authToken, annotationId)

    // make sure this annotation belongs to this application
    if (annotation.applicationId !== applicationId) {
      return reply.redirect(Constants.Routes.ERROR.TECHNICAL_PROBLEM.path)
    }
    await annotation.delete(authToken, annotationId)
    return reply
      .redirect(this.path)
      .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
  }

  async uploadFailAction (request, reply, errors) {
    if (errors && errors.output && errors.output.statusCode === Constants.Errors.REQUEST_ENTITY_TOO_LARGE) {
      errors = UploadController._customError('fileTooBig')
    }
    return this.doGet(request, reply, errors)
  }

  _containsFilename (filename, fileList) {
    const containsFilename = fileList.filter((file) => file.filename === filename)
    return Boolean(containsFilename.length)
  }

  _haveDuplicateFiles (listA, listB) {
    const haveDuplicateFiles = listA.filter(({filename}) => this._containsFilename(filename, listB))
    return Boolean(haveDuplicateFiles.length)
  }

  static _customError (type) {
    return {
      data: {
        details: [{
          type,
          path: ['file']
        }]
      }
    }
  }

  _createTempUploadDirectory (uploadPath) {
    if (!fs.existsSync(UPLOAD_PATH)) {
      fs.mkdirSync(UPLOAD_PATH)
    }
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath)
    }
    return uploadPath
  }

  _removeTempUploadDirectory (uploadPath) {
    if (fs.existsSync(uploadPath)) {
      del(uploadPath)
    }
    return uploadPath
  }

  _getFileData (file, uploadPath) {
    const files = file.hapi ? [file] : file
    return files.map((file) => {
      const filename = file.hapi.filename
      const savedFileName = path.resolve(uploadPath, filename)
      return {
        fieldname: file.hapi.name,
        filename,
        mimetype: file.hapi.headers['content-type'],
        destination: uploadPath,
        path: savedFileName,
        file
      }
    })
  }

  async _uploadFile (file, filename, path) {
    // Upload the file to the server
    await new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream(path)
      fileStream.on('error', (err) => reject(err))
      fileStream.on('finish', () => resolve('ok'))

      if (fileStream instanceof Stream) {
        file.pipe(fileStream)
      }
    })

    // Stream the file from the node server into a base24 string as required by the CRM
    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(path)
      const chunks = []
      stream.on('error', (err) => reject(err))
      stream.on('data', (chunk) => chunks.push(chunk))
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('base64')))
    })
  }
}
