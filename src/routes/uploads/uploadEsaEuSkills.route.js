'use strict'

const Constants = require('../../constants')
const Route = require('./baseUploadRoute')
const {UPLOAD_ESA_EU_SKILLS, TASK_LIST} = Constants.Routes
const UploadEsaEuSkillsController = require('../../controllers/uploads/uploadEsaEuSkills.controller')
const UploadEntityValidator = require('../../validators/uploadEntity.validator')

const validatorOptions = {
  maxSize: '30MB',
  fileTypes: [
    {type: 'PDF', mimeType: 'application/pdf'},
    {type: 'JPG', mimeType: 'image/jpeg'}
  ]
}

const controller = new UploadEsaEuSkillsController(UPLOAD_ESA_EU_SKILLS, true, TASK_LIST, new UploadEntityValidator(validatorOptions))

module.exports = Route.register('GET, POST, REMOVE, UPLOAD', controller)
