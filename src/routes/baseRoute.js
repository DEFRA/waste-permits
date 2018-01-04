const Merge = require('lodash.merge')

class Route {
  static GET (controller, validator) {
    const route = {
      method: 'GET',
      path: controller.path,
      config: {
        description: `The GET ${controller.route.pageHeading} page`,
        handler: controller.handler,
        bind: controller
      }
    }
    if (validator) {
      route.config.state = {
        parse: true,
        failAction: 'error'
      }
    }
    return route
  }

  static POST (controller, validator) {
    const route = {
      method: 'POST',
      path: controller.path,
      config: {
        description: `The POST ${controller.route.pageHeading} page`,
        handler: controller.handler,
        bind: controller
      }
    }
    if (validator) {
      route.config.validate = {
        options: {
          allowUnknown: true
        },
        payload: validator.getFormValidators(),
        failAction: controller.failAction
      }
    }
    return route
  }

  static register (routes, controller, validator) {
    const routeArray = []
    switch (typeof routes) {
      // when routes don't require any extra options then just add specified route methods as a string: eg 'GET, POST'
      case 'string':
        routes
          .replace(/\s+/g, '')
          .split(',')
          .forEach((method) => routeArray.push(this[method](controller, validator)))
        break
      // when routes require any extra options then just add specified route methods as keyed objects: eg {GET: {extra: 'config'}, POST: {extra: 'config'}
      default:
        Object.keys(routes).map((method) => routeArray.push(Merge(this[method](controller, validator), routes[method])))
    }

    return routeArray
  }
}

module.exports = Route
