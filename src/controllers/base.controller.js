'use strict'

const Constants = require('../constants')

module.exports = class BaseController {
  static createPageContext (route, errors, ValidatorSubClass) {
    const pageContext = {
      pageTitle: Constants.buildPageTitle(route.pageHeading),
      pageHeading: route.pageHeading,
      formAction: route.path
    }

    if (errors && errors.data.details) {
      new ValidatorSubClass().addErrorsToPageContext(errors, pageContext)

      // Add the error prefix to the page title
      pageContext.pageTitle = `${Constants.PAGE_TITLE_ERROR_PREFIX} ${pageContext.pageTitle}`
    }

    return pageContext
  }

  static handler (request, reply, errors, controllerSubclass, validateToken = true) {
    if (validateToken) {
      // Validate the session cookie
      let token = request.server.methods.validateToken(request.state[Constants.COOKIE_KEY])
      if (!token) {
        // Redirect off an error screen
        return reply.redirect(Constants.Routes.ERROR.path)
      }
    }
    if (request.method.toUpperCase() === 'GET') {
      return controllerSubclass.doGet(request, reply, errors)
    } else if (request.method.toUpperCase() === 'POST') {
      return controllerSubclass.doPost(request, reply, errors)
    }
  }
}
