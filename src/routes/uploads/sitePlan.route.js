'use strict'

const Constants = require('../../constants')
const Route = require('./baseUploadRoute')
const {SITE_PLAN, TASK_LIST} = Constants.Routes
const SitePlanController = require('../../controllers/uploads/sitePlan.controller')
const UploadEntityValidator = require('../../validators/uploadEntity.validator')

const validator = new UploadEntityValidator({
  maxSize: '30MB',
  fileTypes: [
    {type: 'PDF', mimeType: 'application/pdf'},
    {type: 'JPG', mimeType: 'image/jpeg'}
  ]
})

const controller = new SitePlanController(SITE_PLAN, validator, true, TASK_LIST)

module.exports = Route.register('GET, REMOVE, UPLOAD', controller)
