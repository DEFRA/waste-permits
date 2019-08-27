'use strict'

const BaseController = require('./base.controller')
const Routes = require('../routes')

module.exports = class EmissionsAndMonitoringController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    // Redirect to upload page if response is yes or back to the task list otherwise
    if (request.payload['emissions-made'] === 'yes') {
      return this.redirect({ h })
    } else {
      return this.redirect({ h, route: Routes.TASK_LIST })
    }

  }
}
