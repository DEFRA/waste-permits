const Merge = require('deepmerge')
const Constants = require('../constants')
const Joi = require('@hapi/joi')

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
    if (validator && validator.formValidators) {
      route.options.validate = {
        options: {
          allowUnknown: true
        },
        // As of v19 Hapi no longer provides a default validation compiler. To fix this we use Joi.compile() which will
        // either compile an uncompiled schema or return an already-compiled schema (which is the case with validators
        // which return a Joi object, eg. NeedToConsultValidator)
        payload: Joi.compile(validator.formValidators),
        failAction: controller.failAction
      }
    }
    if (controller.route.allowEmptyParametersInPayload) {
      route.options.plugins = route.options.plugins || {}
      route.options.plugins.sanitize = { enabled: false }
      route.options.plugins.disinfect = route.options.plugins.disinfect || {}
      route.options.plugins.disinfect.deleteEmpty = false
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
