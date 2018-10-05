const BaseRoute = require('./baseRoute')
const Constants = require('../constants')

class UploadRoute extends BaseRoute {
  static POST (controller) {
    const route = super.POST(controller)
    route.options.plugins = {
      crumb: false // Disabled to prevent 403 when testing for missing file upload
    }
    return route
  }

  static REMOVE (controller) {
    return {
      method: 'GET',
      path: `${controller.path}/remove/{id}`,
      handler: controller.remove,
      options: {
        description: `The REMOVE ${controller.route.pageHeading} page`,
        bind: controller,
        cache: Constants.CacheOptions,
        security: Constants.SecurityOptions
      }
    }
  }

  static UPLOAD (controller) {
    return {
      method: 'POST',
      path: `${controller.path}/upload`,
      handler: controller.upload,
      options: {
        description: `The UPLOAD ${controller.route.pageHeading} page`,
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
        cache: Constants.CacheOptions,
        security: Constants.SecurityOptions,
        validate: {
          options: {
            allowUnknown: true
          },
          payload: controller.validator.formValidators,
          failAction: controller.failAction
        }
      }
    }
  }
}

module.exports = UploadRoute
