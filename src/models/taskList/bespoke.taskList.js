const { bespoke,
  tasks: {
    WASTE_WEIGHTS: { shortName: wasteWeightsShortName },
    CLIMATE_CHANGE_RISK_SCREENING: { shortName: climateChangeRiskScreeningShortName },
    CLINICAL_WASTE_APPENDIX: { shortName: clinicalWasteShortName },
    MANAGE_HAZARDOUS_WASTE: { shortName: hazardousWasteShortName }
  }
} = require('../../tasks')

const BaseTaskList = require('./base.taskList')
const Task = require('../../persistence/entities/task.entity')
const DataStore = require('../../models/dataStore.model')

module.exports = class BespokeTaskList extends BaseTaskList {
  get taskListTemplate () {
    return bespoke
  }

  async isAvailable (task = {}) {
    const { context } = this
    const availableTasks = await Task.getAvailableTasks(context)
    const { data: { acceptsClinicalWaste, acceptsHazardousWaste } } = await DataStore.get(context)

    // Remove clinical and hazardous waste from the tasklist when mapping
    // They are only shown if the applicant specifically states they accept those waste types
    const taskNames = availableTasks
      .map(({ shortName }) => shortName)
      .filter((shortName) => shortName !== clinicalWasteShortName && shortName !== hazardousWasteShortName)

    // Add clinical and hazardous waste to the tasklist if applicant has stated they accept them
    if (acceptsClinicalWaste) { taskNames.push(clinicalWasteShortName) }
    if (acceptsHazardousWaste) { taskNames.push(hazardousWasteShortName) }

    taskNames.push(climateChangeRiskScreeningShortName)
    taskNames.push(wasteWeightsShortName)

    return task.required || (task.route && taskNames.includes(task.shortName))
  }
}
