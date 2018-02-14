'use strict'

const Constants = require('../../../constants')
const Route = require('../base/uploadRoute')
const {SITE_PLAN, TASK_LIST} = Constants.Routes
const SitePlanController = require('../../../controllers/upload/sitePlan/sitePlan.controller')
const UploadValidator = require('../../../validators/upload/upload.validator')

const validator = new UploadValidator({
  maxSize: '30MB',
  fileTypes: [
    {type: 'PDF', mimeType: 'application/pdf'},
    {type: 'JPG', mimeType: 'image/jpeg'}
  ]
})

const controller = new SitePlanController(SITE_PLAN, validator, true, TASK_LIST)

module.exports = Route.register('GET, REMOVE, UPLOAD', controller)
