'use strict'

const Constants = require('../../../constants')
const Route = require('../base/uploadRoute')
const {TECHNICAL_MANAGERS, TASK_LIST} = Constants.Routes
const TechnicalManagersController = require('../../../controllers/upload/technicalQualification/technicalManagers.controller')
const UploadValidator = require('../../../validators/upload/upload.validator')

const validator = new UploadValidator({
  fileTypes: [
    {type: 'DOC', mimeType: 'application/msword'},
    {type: 'DOCX', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'},
    {type: 'PDF', mimeType: 'application/pdf'},
    {type: 'ODT', mimeType: 'application/vnd.oasis.opendocument.text'}
  ]})
const controller = new TechnicalManagersController({route: TECHNICAL_MANAGERS, validator, nextRoute: TASK_LIST})

module.exports = Route.register('GET, REMOVE, UPLOAD', controller)
