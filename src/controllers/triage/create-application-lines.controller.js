'use strict'

const BaseController = require('../base.controller')
const Application = require('../../models/triage/application.model')
const RecoveryService = require('../../services/recovery.service')
const DataStore = require('../../models/dataStore.model')

module.exports = class CreateApplicationLinesController extends BaseController {
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
    const activitiesArray = []
    dataStoreData.airDispersionModellingRequired
      ? activitiesArray.push({ id: '1-10-2' }) // Medium combustion plant site – requires dispersion modelling
      : activitiesArray.push({ id: '1-10-3' }) // Medium combustion plant site – does not require dispersion modelling
    application.setWasteActivities(activitiesArray)

    // Set the assessments
    const assessmentsArray = []
    if (dataStoreData.energyEfficiencyReportRequired) assessmentsArray.push({ id: 'MCP-EER' }) // Energy efficiency report
    if (dataStoreData.bestAvailableTechniquesAssessment) assessmentsArray.push({ id: 'MCP-BAT' }) // Best available techniques assessment
    if (dataStoreData.habitatAssessmentRequired) assessmentsArray.push({ id: '1-19-2' }) // Habitats assessment
    application.setWasteAssessments(assessmentsArray)

    // Save the application lines chosen by the user
    await application.save(context)

    // Now we've saved the application, move on to the confirm costs page
    return this.redirect({ h })
  }
}
