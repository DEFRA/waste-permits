'use strict'

const Constants = require('../../../constants')
const Route = require('../base/uploadRoute')
const {TECHNICAL_MANAGERS, TASK_LIST} = Constants.Routes
const TechnicalManagersController = require('../../../controllers/upload/technicalQualification/technicalManagers.controller')
const UploadValidator = require('../../../validators/upload/upload.validator')

const validator = new UploadValidator({
  fileTypes: [
    {type: 'PDF', mimeType: 'application/pdf'},
    {type: 'JPG', mimeType: 'image/jpeg'}
  ]})
const controller = new TechnicalManagersController({route: TECHNICAL_MANAGERS, validator, nextRoute: TASK_LIST, viewPath: 'upload/technicalQualification/technicalManagers'})

module.exports = Route.register('GET, REMOVE, UPLOAD', controller)
