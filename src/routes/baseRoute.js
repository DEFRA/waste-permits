const Merge = require('lodash.merge')

class Route {
  constructor (routes, controller, validator) {
    const baseRoutes = {
      GET: Route._baseGet(controller),
      POST: Route._basePost(controller, validator)
    }

    this.routes = routes.map((route) => Merge(baseRoutes[route.method], route))
  }

  static _baseGet (controller) {
    return {
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
    }
  }

  static _basePost (controller, validator) {
    return {
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

  register () {
    return this.routes
  }
}

module.exports = Route
