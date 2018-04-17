'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')

module.exports = class RootController extends BaseController {
  async doGet (request, h) {
    // For now we are re-directing off to the 'Apply for a standard rules permit' page
    return this.redirect({request, h, redirectPath: Constants.Routes.START_OR_OPEN_SAVED.path})
  }
}
