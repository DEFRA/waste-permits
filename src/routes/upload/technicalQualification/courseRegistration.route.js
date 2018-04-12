'use strict'

const Constants = require('../../../constants')
const Route = require('../base/uploadRoute')
const {UPLOAD_COURSE_REGISTRATION, TASK_LIST} = Constants.Routes
const CourseRegistrationController = require('../../../controllers/upload/technicalQualification/courseRegistration.controller')
const UploadValidator = require('../../../validators/upload/upload.validator')

const validator = new UploadValidator()
const controller = new CourseRegistrationController(UPLOAD_COURSE_REGISTRATION, validator, true, TASK_LIST)

module.exports = Route.register('GET, REMOVE, UPLOAD', controller)
