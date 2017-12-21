const Merge = require('lodash.merge')

class Route {
  constructor (routes, controller, validator) {
    const baseRoutes = {
      GET: {
        path: controller.path,
        config: {
          description: `The GET ${controller.route.pageHeading} page`,
          handler: controller.handler,
          bind: controller,
          state: {
            parse: true,
            failAction: 'error'
          }
        }
      },
      POST: {
        path: controller.path,
        config: {
          description: `The POST ${controller.route.pageHeading} page`,
          handler: controller.handler,
          bind: controller,
          validate: {
            options: {
              allowUnknown: true
            },
            payload: validator ? validator.getFormValidators() : undefined,
            failAction: controller.failAction
          }
        }
      }
    }

    this.routes = routes.map((route) => Merge(baseRoutes[route.method], route))
  }

  register () {
    return this.routes
  }
}

module.exports = Route
