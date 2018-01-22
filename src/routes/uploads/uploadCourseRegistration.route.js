'use strict'

const Constants = require('../../constants')
const Route = require('./baseUploadRoute')
const {UPLOAD_COURSE_REGISTRATION, TASK_LIST} = Constants.Routes
const UploadCourseRegistrationController = require('../../controllers/uploads/uploadCourseRegistration.controller')
const UploadEntityValidator = require('../../validators/uploadEntity.validator')

const validator = new UploadEntityValidator({
  maxSize: '30MB',
  fileTypes: [
    {type: 'PDF', mimeType: 'application/pdf'},
    {type: 'JPG', mimeType: 'image/jpeg'}
  ]
})

const controller = new UploadCourseRegistrationController(UPLOAD_COURSE_REGISTRATION, validator, true, TASK_LIST)

module.exports = Route.register('GET, POST, REMOVE, UPLOAD', controller)
