'use strict'

const Constants = require('../../../constants')
const Route = require('../base/uploadRoute')
const {SITE_PLAN, TASK_LIST} = Constants.Routes
const SitePlanController = require('../../../controllers/upload/sitePlan/sitePlan.controller')
const UploadValidator = require('../../../validators/upload/upload.validator')

const validator = new UploadValidator()
const controller = new SitePlanController({route: SITE_PLAN, validator, nextRoute: TASK_LIST, viewPath: 'upload/sitePlan/sitePlan'})

module.exports = Route.register('GET, REMOVE, UPLOAD', controller)
