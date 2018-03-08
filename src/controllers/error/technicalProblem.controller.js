'use strict'

const BaseController = require('../base.controller')

module.exports = class TechnicalProblemController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)

    return this.showView(request, reply, 'error/technicalProblem', pageContext)
  }
}
