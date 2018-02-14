'use strict'

const Constants = require('../../../constants')
const Route = require('../base/uploadRoute')
const {UPLOAD_DEEMED_EVIDENCE, TASK_LIST} = Constants.Routes
const DeemedEvidenceController = require('../../../controllers/upload/technicalQualification/deemedEvidence.controller')
const UploadValidator = require('../../../validators/upload/upload.validator')

const validator = new UploadValidator({
  maxSize: '30MB',
  fileTypes: [
    {type: 'PDF', mimeType: 'application/pdf'},
    {type: 'JPG', mimeType: 'image/jpeg'}
  ]
})

const controller = new DeemedEvidenceController(UPLOAD_DEEMED_EVIDENCE, validator, true, TASK_LIST)

module.exports = Route.register('GET, REMOVE, UPLOAD', controller)
