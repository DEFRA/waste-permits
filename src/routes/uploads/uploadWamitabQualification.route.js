'use strict'

const Constants = require('../../constants')
const Route = require('./baseUploadRoute')
const {UPLOAD_WAMITAB_QUALIFICATION, TASK_LIST} = Constants.Routes
const UploadWamitabQualificationController = require('../../controllers/uploads/uploadWamitabQualification.controller')
const UploadEntityValidator = require('../../validators/uploadEntity.validator')

const validator = new UploadEntityValidator({
  maxSize: '30MB',
  fileTypes: [
    {type: 'PDF', mimeType: 'application/pdf'},
    {type: 'JPG', mimeType: 'image/jpeg'}
  ]
})

const controller = new UploadWamitabQualificationController(UPLOAD_WAMITAB_QUALIFICATION, true, TASK_LIST, validator)

module.exports = Route.register('GET, POST, REMOVE, UPLOAD', controller)
