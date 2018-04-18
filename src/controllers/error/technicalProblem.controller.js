'use strict'

const Config = require('../../config/config')
const BaseController = require('../base.controller')

module.exports = class TechnicalProblemController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {error} = request.query || {}
    if (Config.isDevelopment && error) {
      pageContext.error = error
    }

    return this.showView({request, h, viewPath: 'error/technicalProblem', pageContext})
  }
}
