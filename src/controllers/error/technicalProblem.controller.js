'use strict'

const BaseController = require('../base.controller')

module.exports = class TechnicalProblemController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)

    return this.showView({request, h, viewPath: 'error/technicalProblem', pageContext})
  }
}
