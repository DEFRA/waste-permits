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

const UPLOAD_PATH = path.resolve(`${process.cwd()}/temp`)

module.exports = class UploadController extends BaseController {
  constructor (...args) {
    const nextRoute = args[3]
    super(...args)
    this.nextPath = nextRoute.path
  }

  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {authToken, applicationId, application, payment} = await this.createApplicationContext(request, {application: true, payment: true})

    const list = await Annotation.listByApplicationIdAndSubject(authToken, applicationId, this.subject)

    const redirectPath = await this.checkRouteAccess(application, payment)
    if (redirectPath) {
      return this.redirect(request, h, redirectPath)
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

    return this.showView(request, h, this.view, pageContext)
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const {authToken, applicationId, applicationLineId} = await this.createApplicationContext(request)

      const list = await Annotation.listByApplicationIdAndSubject(authToken, applicationId, this.subject)
      if (!list.length) {
        return this.handler(request, h, undefined, this.setCustomError('noFilesUploaded', 'file'))
      }
      if (this.updateCompleteness) {
        await this.updateCompleteness(authToken, applicationId, applicationLineId)
      }
      return this.redirect(request, h, this.nextPath)
    }
  }

  async upload (request, h, errors) {
    try {
      // Validate the cookie
      if (!CookieService.validateCookie(request)) {
        return this.redirect(request, h, Constants.Routes.ERROR.TECHNICAL_PROBLEM.path)
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

      const {authToken, applicationId, application} = await this.createApplicationContext(request, {application: true})
      const {applicationName: applicationReference} = application

      const annotationsList = await Annotation.listByApplicationIdAndSubject(authToken, applicationId, this.subject)

      // create temporary uploads directory
      const uploadPath = path.resolve(UPLOAD_PATH, applicationReference)
      this._createTempUploadDirectory(uploadPath)

      const fileData = this._getFileData(request.payload.file, uploadPath)

      // Make sure no duplicate files are uploaded
      if (this._haveDuplicateFiles(fileData, annotationsList)) {
        return this.handler(request, h, this.setCustomError('duplicateFile', 'file'))
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
      return this.redirect(request, h, this.path)
    } catch (error) {
      LoggingService.logError(error, request)
      return this.redirect(request, h, Constants.Routes.ERROR.TECHNICAL_PROBLEM.path)
    }
  }

  async remove (request, h) {
    // Validate the cookie
    if (!CookieService.validateCookie(request)) {
      return this.redirect(request, h, Constants.Routes.ERROR.TECHNICAL_PROBLEM.path)
    }

    const {authToken, applicationId} = await this.createApplicationContext(request)
    const annotationId = request.params.id
    const annotation = await Annotation.getById(authToken, annotationId)

    // make sure this annotation belongs to this application
    if (annotation.applicationId !== applicationId) {
      return this.redirect(request, h, Constants.Routes.ERROR.TECHNICAL_PROBLEM.path)
    }
    await annotation.delete(authToken, annotationId)
    return this.redirect(request, h, this.path)
  }

  async uploadFailAction (request, h, errors) {
    if (errors && errors.output && errors.output.statusCode === Constants.Errors.REQUEST_ENTITY_TOO_LARGE) {
      errors = this.setCustomError('fileTooBig', 'file')
    }
    return this.doGet(request, h, errors).takeover()
  }

  _containsFilename (filename, fileList) {
    const containsFilename = fileList.filter((file) => file.filename === filename)
    return Boolean(containsFilename.length)
  }

  _haveDuplicateFiles (listA, listB) {
    const haveDuplicateFiles = listA.filter(({filename}) => this._containsFilename(filename, listB))
    return Boolean(haveDuplicateFiles.length)
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
