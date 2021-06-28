'use strict'

const BaseController = require('./base.controller')
const Routes = require('../routes')
const RecoveryService = require('../services/recovery.service')
const DataStore = require('../models/dataStore.model')

module.exports = class EmissionsAndMonitoringController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    const context = await RecoveryService.createApplicationContext(h)
    const { data: { emissionsAndMonitoringDetailsRequired } } = await DataStore.get(context)

    // Both required due to handlebars not differentiating between false and undefined
    pageContext.formValues = {
      'emissions-made-yes': emissionsAndMonitoringDetailsRequired,
      'emissions-made-no': emissionsAndMonitoringDetailsRequired === false
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)

    const emissionsAndMonitoringDetailsRequired = request.payload['emissions-made'] === 'yes'
    await DataStore.save(context, { emissionsAndMonitoringDetailsRequired })

    // Redirect to upload page if response is yes or back to the task list otherwise
    if (emissionsAndMonitoringDetailsRequired) {
      return this.redirect({ h })
    } else {
      return this.redirect({ h, route: Routes.TASK_LIST })
    }
  }
}
