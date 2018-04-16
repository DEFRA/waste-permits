const Merge = require('deepmerge')
const Constants = require('../constants')

class Route {
  static GET (controller, validator) {
    const route = {
      method: 'GET',
      path: controller.path,
      handler: controller.handler,
      options: {
        description: `The GET ${controller.route.pageHeading} page`,
        bind: controller,
        cache: Constants.CacheOptions,
        security: Constants.SecurityOptions
      }
    }
    if (validator) {
      route.options.state = {
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
      handler: controller.handler,
      options: {
        description: `The POST ${controller.route.pageHeading} page`,
        bind: controller,
        cache: Constants.CacheOptions,
        security: Constants.SecurityOptions
      }
    }
    if (validator && validator.getFormValidators) {
      route.options.validate = {
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
      // when routes require any extra options then just add specified route methods as keyed objects: eg {GET: {extra: 'options'}, POST: {extra: 'options'}
      default:
        Object.keys(routes).map((method) => routeArray.push(Merge(this[method](controller, validator), routes[method])))
    }

    return routeArray
  }
}

module.exports = Route
