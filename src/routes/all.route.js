const Routes = require('../routes')

const routes = []

/** Using the Route constants, generate the routing configuration for each route including the instantiation of the controllers and validators if required **/

Object.entries(Routes)
  .forEach(([id, route]) => {
    let {types, controller, validator, baseRoute = 'baseRoute', cookieValidationRequired, applicationRequired, paymentRequired, submittedRequired, validatorOptions = {}} = route
    if (controller) {
      try {
        // Instantiate the validator (if required)
        if (validator && typeof validator === 'string') {
          const Validator = require(`../validators/${validator}.validator`)
          validator = new Validator(validatorOptions)
        }

        // Instantiate the controller
        const Controller = require(`../controllers/${controller}.controller`)
        controller = new Controller({route, validator, cookieValidationRequired, applicationRequired, paymentRequired, submittedRequired})

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
