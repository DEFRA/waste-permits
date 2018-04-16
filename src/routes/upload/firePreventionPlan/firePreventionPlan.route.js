'use strict'

const Constants = require('../../../constants')
const Route = require('../base/uploadRoute')
const {FIRE_PREVENTION_PLAN, TASK_LIST} = Constants.Routes
const FirePreventionPlanController = require('../../../controllers/upload/firePreventionPlan/firePreventionPlan.controller')
const UploadValidator = require('../../../validators/upload/upload.validator')

const validator = new UploadValidator()
const controller = new FirePreventionPlanController(FIRE_PREVENTION_PLAN, validator, true, TASK_LIST)

module.exports = Route.register('GET, REMOVE, UPLOAD', controller)
