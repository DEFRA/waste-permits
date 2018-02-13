'use strict'

const fs = require('fs')
const path = require('path')
const { Stream } = require('stream')
const Constants = require('../../constants')
const BaseController = require('../base.controller')
const CookieService = require('../../services/cookie.service')
const LoggingService = require('../../services/logging.service')
const Annotation = require('../../models/annotation.model')
const Application = require('../../models/application.model')

const UPLOAD_PATH = path.resolve(`${__dirname}/../../uploads`)

module.exports = class BaseUploadEvidenceController extends BaseController {
  constructor (...args) {
    const nextRoute = args[3]
    super(...args)
    this.nextPath = nextRoute.path
  }

  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    if (request.payload) {
      pageContext.formValues = request.payload
    }
    const authToken = CookieService.getAuthToken(request)
    const applicationId = CookieService.getApplicationId(request)
    const list = await Annotation.listByApplicationId(authToken, applicationId)

    pageContext.uploadFormAction = `${this.path}/upload`
    pageContext.annotations = list.map(({filename, id}) => ({filename, removeAction: `${this.path}/remove/${id}`}))
    pageContext.fileTypes = this.validator.formatValidTypes()
    pageContext.maxSize = this.validator.getMaxSize()
    Object.assign(pageContext, this.getSpecificPageContext())

    return reply.view('uploadEvidence', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      const authToken = CookieService.getAuthToken(request)
      const applicationId = CookieService.getApplicationId(request)
      const applicationLineId = CookieService.getApplicationLineId(request)
      const list = await Annotation.listByApplicationId(authToken, applicationId)
      if (!list.length) {
        return this.handler(request, reply, undefined, BaseUploadEvidenceController._customError('noFilesUploaded'))
      }
      if (this.updateCompleteness) {
        await this.updateCompleteness(authToken, applicationId, applicationLineId)
      }
      return reply.redirect(this.nextPath)
    }
  }

  async upload (request, reply, errors) {
    try {
      // Validate the cookie
      if (!CookieService.validateCookie(request)) {
        return reply.redirect(Constants.Routes.ERROR.path)
      }

      // Post if it's not an attempt to upload a file
      if (!request.payload['is-upload-file']) {
        return this.doPost(request, reply, errors)
      }

      // Apply custom validation if required
      if (this.validator && this.validator.customValidators) {
        errors = this.validator.customValidate(request.payload, errors)
      }

      if (errors && errors.data.details) {
        return this.doGet(request, reply, errors)
      }

      const authToken = CookieService.getAuthToken(request)
      const applicationId = CookieService.getApplicationId(request)
      const {name: applicationReference} = await Application.getById(authToken, applicationId)
      const annotationsList = await Annotation.listByApplicationId(authToken, applicationId)
      const {subject} = this.getSpecificPageContext()
      const fileData = this._getFileData(request.payload.file, applicationReference)

      // Make sure no duplicate files are uploaded
      if (this._haveDuplicateFiles(fileData, annotationsList)) {
        return this.handler(request, reply, undefined, BaseUploadEvidenceController._customError('duplicateFile'))
      }

      // Save each file as an attachment to an annotation
      const uploadPromises = fileData.map(async ({file, filename, path}) => {
        const documentBody = await this._uploadFile(file, filename, path)
        const annotation = new Annotation({subject, filename, applicationId, documentBody})
        return annotation.save(authToken)
      })
      await Promise.all(uploadPromises)
      return reply.redirect(this.path)
    } catch (error) {
      LoggingService.logError(error, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  async remove (request, reply) {
    // Validate the cookie
    if (!CookieService.validateCookie(request)) {
      return reply.redirect(Constants.Routes.ERROR.path)
    }
    // const result = this.getRequestData(request)
    const authToken = CookieService.getAuthToken(request)
    const applicationId = CookieService.getApplicationId(request)
    const annotationId = request.params.id
    const annotation = await Annotation.getById(authToken, annotationId)

    // make sure this annotation belongs to this application
    if (annotation.applicationId !== applicationId) {
      return reply.redirect(Constants.Routes.ERROR.path)
    }
    await annotation.delete(authToken, annotationId)
    return reply.redirect(this.path)
  }

  async uploadFailAction (request, reply, errors) {
    if (errors && errors.output && errors.output.statusCode === Constants.Errors.REQUEST_ENTITY_TOO_LARGE) {
      errors = BaseUploadEvidenceController._customError('fileTooBig')
    }
    return this.doGet(request, reply, errors)
  }

  _containsFilename (filename, fileList) {
    const containsFilename = fileList.filter((file) => file.filename === filename)
    return !!containsFilename.length
  }

  _haveDuplicateFiles (listA, listB) {
    const haveDuplicateFiles = listA.filter(({filename}) => this._containsFilename(filename, listB))
    return !!haveDuplicateFiles.length
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

  _getFileData (file, applicationReference) {
    if (!fs.existsSync(UPLOAD_PATH)) {
      fs.mkdirSync(UPLOAD_PATH)
    }
    const uploadPath = path.resolve(UPLOAD_PATH, applicationReference)
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath)
    }
    const files = file.hapi ? [file] : file
    return files.map((file) => {
      const filename = file.hapi.filename
      const savedFileName = path.resolve(UPLOAD_PATH, filename)
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

      fileStream.on('error', function (err) {
        reject(err)
      })

      fileStream.on('finish', function () {
        resolve('ok')
      })

      if (fileStream instanceof Stream) {
        file.pipe(fileStream)
      }
    })

    // Stream the file from the node server into a base24 string as required by the CRM
    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(path)
      const chunks = []
      stream.on('error', function (err) {
        reject(err)
      })
      stream.on('data', function (chunk) {
        chunks.push(chunk)
      })
      stream.on('end', function () {
        const documentBody = Buffer.concat(chunks).toString('base64')
        // Delete the file on the node server
        fs.unlink(path, (err) => {
          if (err) {
            reject(err)
          } else {
            resolve(documentBody)
          }
        })
      })
    })
  }
}
