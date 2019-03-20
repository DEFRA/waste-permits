'use strict'

const { DEFRA_COOKIE_KEY, COOKIE_KEY: { APPLICATION_ID } } = require('../../constants')
const BaseController = require('../base.controller')
const Application = require('../../models/triage/application.model')
const ActiveDirectoryAuthService = require('../../services/activeDirectoryAuth.service')
const RecoveryService = require('../../services/recovery.service')
const DataStore = require('../../models/dataStore.model')

module.exports = class CreateApplicationController extends BaseController {
  // TODO: I think this should be in a POST (not a GET) as it is writing to Dynamics.  If so, how can we do this?  Alternatively the better way will be to skip this controller, go straight to the CONFIRM_COSTS page, which will ask Dynamics for the costs (without creating the lines...Kas says this is possible) then when the user clicks 'Start Application', create the lines in that POST
  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h)
    const { data: dataStoreData } = await DataStore.get(context)

    // Get the existing application from Dynamics
    // This includes the existing application.wasteActivities
    const application = await Application.getApplicationForId(context)

    // TODO (WE-2307) - If the McpType is not stored explicitly in Dynamics (rather an activity is created for it), then we can remove the application.model setMcpType method.  We should also remove the call to it from the triage.contollor
    // application.setMcpType({ id: dataStoreData.mcpType })

    // Set the MCP activity
    // Possible change - Ideally change the air dispersion modelling controller to use true/false, rather than yes/no (to match the other assessment questions below)
    const activitiesArray = []
    dataStoreData.airDispersionModelling === 'yes'
      ? activitiesArray.push({ id: '1-10-2' }) // Medium combustion plant site – requires dispersion modelling
      : activitiesArray.push({ id: '1-10-3' }) // Medium combustion plant site – does not require dispersion modelling
    application.setWasteActivities(activitiesArray)

    // TODO (WE-2308) - Set the assessments
    // const assessmentsArray = []
    // if (dataStoreData.energyEfficiencyReportRequired) assessmentsArray.push({ id: 'TODO' })
    // if (dataStoreData.bestAvailableTechniquesAssessment) assessmentsArray.push({ id: 'TODO' })
    // if (dataStoreData.habitatAssessment) assessmentsArray.push({ id: 'TODO' })
    // application.setWasteAssessments(assessmentsArray.items)

    // Save the application lines chosen by the user
    await application.save(context)

    // Now we've saved the application, move on to the confirm costs page
    return this.redirect({ h })
  }
}
