'use strict'

const Constants = require('../../../constants')
const Route = require('../base/uploadRoute')
const {UPLOAD_COURSE_REGISTRATION, TECHNICAL_MANAGERS} = Constants.Routes
const CourseRegistrationController = require('../../../controllers/upload/technicalQualification/courseRegistration.controller')
const UploadValidator = require('../../../validators/upload/upload.validator')

const validator = new UploadValidator()
const controller = new CourseRegistrationController({route: UPLOAD_COURSE_REGISTRATION, validator, nextRoute: TECHNICAL_MANAGERS, viewPath: 'upload/technicalQualification/courseRegistration'})

module.exports = Route.register('GET, REMOVE, UPLOAD', controller)
