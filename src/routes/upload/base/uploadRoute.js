const BaseRoute = require('../../baseRoute')
const Constants = require('../../../constants')

class UploadRoute extends BaseRoute {
  static POST (controller) {
    const route = super.POST(controller)
    route.config.plugins = {
      crumb: false // Disabled to prevent 403 when testing for missing file upload
    }
    return route
  }

  static REMOVE (controller) {
    return {
      method: 'GET',
      path: `${controller.path}/remove/{id}`,
      config: {
        description: `The REMOVE ${controller.route.pageHeading} page`,
        handler: controller.remove,
        bind: controller
      }
    }
  }

  static UPLOAD (controller) {
    return {
      method: 'POST',
      path: `${controller.path}/upload`,
      config: {
        description: `The UPLOAD ${controller.route.pageHeading} page`,
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
    }
  }
}

module.exports = UploadRoute
