'use strict'

const Constants = require('../../../constants')
const Route = require('../base/uploadRoute')
const {UPLOAD_WAMITAB_QUALIFICATION, TASK_LIST} = Constants.Routes
const WamitabQualificationController = require('../../../controllers/upload/technicalQualification/wamitabQualification.controller')
const UploadValidator = require('../../../validators/upload/upload.validator')

const validator = new UploadValidator({
  maxSize: '30MB',
  fileTypes: [
    {type: 'PDF', mimeType: 'application/pdf'},
    {type: 'JPG', mimeType: 'image/jpeg'}
  ]
})

const controller = new WamitabQualificationController(UPLOAD_WAMITAB_QUALIFICATION, validator, true, TASK_LIST)

module.exports = Route.register('GET, REMOVE, UPLOAD', controller)
