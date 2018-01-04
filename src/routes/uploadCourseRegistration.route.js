'use strict'

const Constants = require('../constants')
const {UPLOAD_COURSE_REGISTRATION, TASK_LIST} = Constants.Routes
const UploadCourseRegistrationController = require('../controllers/uploadCourseRegistration.controller')
const UploadEntityValidator = require('../validators/uploadEntity.validator')

const validatorOptions = {
  maxSize: '30MB',
  fileTypes: [
    {type: 'PDF', mimeType: 'application/pdf'},
    {type: 'JPG', mimeType: 'image/jpeg'}
  ]
}

const controller = new UploadCourseRegistrationController(UPLOAD_COURSE_REGISTRATION, true, TASK_LIST, new UploadEntityValidator(validatorOptions))

module.exports = [{
  method: 'GET',
  path: controller.path,
  config: {
    description: `The GET Please upload your Course registration`,
    handler: controller.handler,
    bind: controller
  }
}, {
  method: 'GET',
  path: `${controller.path}/remove/{id}`,
  config: {
    description: `The GET Remove your Course registration`,
    handler: controller.remove,
    bind: controller
  }
}, {
  method: 'POST',
  path: controller.path,
  config: {
    description: `The POST Please upload your Course registration`,
    handler: controller.handler,
    bind: controller
  }
}, {
  method: 'POST',
  path: `${controller.path}/upload`,
  config: {
    description: `The POST actual Upload your Course registration`,
    handler: controller.upload,
    bind: controller,
    plugins: {
      disinfect: false, // Disabled to allow payload to contain file data
      crumb: false // Disabled to prevent 403 when testing for max file size
    },
    payload: {
      timeout: false,
      output: 'stream',
      parse: true,
      allow: 'multipart/form-data',
      maxBytes: Constants.MAX_FILE_SIZE,
      failAction: controller.uploadFailAction.bind(controller)
    },
    validate: {
      options: {
        allowUnknown: true
      },
      payload: controller.validator.getFormValidators(),
      failAction: controller.failAction
    }
  }
}]
