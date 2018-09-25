const Merge = require('deepmerge')
const Routes = require('../routes')

const routes = []

/** Using the Route constants, generate the routing configuration for each route including the instantiation of the controllers and validators if required **/

Object.entries(Routes)
  .forEach(([id, options]) => {
    let { types, controller, validator, baseRoute = 'baseRoute', cookieValidationRequired, applicationRequired, submittedRequired, validatorOptions = {} } = options
    if (controller) {
      try {
        // Add parameters to the route path eg "/recover/application/{slug?}" where "slug?" is an item in the route params and "/recover/application" was the original path
        const route = Merge({}, options)
        if (route.params) {
          route.params.forEach((param) => {
            route.path += `/{${param}}`
          })
        }
        // Instantiate the validator (if required)
        if (validator && typeof validator === 'string') {
          const Validator = require(`../validators/${validator}.validator`)
          validator = new Validator(validatorOptions)
        }

        // Instantiate the controller
        const Controller = require(`../controllers/${controller}.controller`)
        controller = new Controller({ route, validator, cookieValidationRequired, applicationRequired, submittedRequired })

        // Get the appropriate base route
        const BaseRoute = require(`./${baseRoute}`)

        // Register each 'Route type'
        BaseRoute.register(types, controller, validator).forEach((route) => routes.push(route))
      } catch (error) {
        console.log(`Problem registering route: ${id}`)
        throw error
      }
    }
  })

module.exports = routes
