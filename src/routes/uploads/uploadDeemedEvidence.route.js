'use strict'

const Constants = require('../../constants')
const Route = require('./baseUploadRoute')
const {UPLOAD_DEEMED_EVIDENCE, TASK_LIST} = Constants.Routes
const UploadDeemedEvidenceController = require('../../controllers/uploads/uploadDeemedEvidence.controller')
const UploadEntityValidator = require('../../validators/uploadEntity.validator')

const validator = new UploadEntityValidator({
  maxSize: '30MB',
  fileTypes: [
    {type: 'PDF', mimeType: 'application/pdf'},
    {type: 'JPG', mimeType: 'image/jpeg'}
  ]
})

const controller = new UploadDeemedEvidenceController(UPLOAD_DEEMED_EVIDENCE, validator, true, TASK_LIST)

module.exports = Route.register('GET, REMOVE, UPLOAD', controller)
