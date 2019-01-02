'use strict'

const Routes = require('../routes')
const BaseController = require('./base.controller')

module.exports = class RootController extends BaseController {
  async doGet (request, h) {
    // If there is a permit type parameter indicating bespoke or standard rules then pass it through
    const permitType = request.query['permit-type']
    let path = Routes.START_OR_OPEN_SAVED.path
    if (permitType && (permitType === 'bespoke' || permitType === 'standard-rules')) {
      path += `?permit-type=${permitType}`
    }

    // We always start by asking if there is an existing application to continue with
    return this.redirect({ h, path })
  }
}
