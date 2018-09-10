'use strict'

const Routes = require('../routes')
const BaseController = require('./base.controller')

module.exports = class RootController extends BaseController {
  async doGet (request, h) {
    // For now we are re-directing off to the 'Apply for a standard rules permit' page
    return this.redirect({ request, h, redirectPath: Routes.START_OR_OPEN_SAVED.path })
  }
}
