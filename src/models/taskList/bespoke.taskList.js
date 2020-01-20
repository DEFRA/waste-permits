const { bespoke,
  tasks: {
    WASTE_WEIGHTS: { shortName: wasteWeightsShortName },
    CLIMATE_CHANGE_RISK_SCREENING: { shortName: climateChangeRiskScreeningShortName },
    CLINICAL_WASTE_APPENDIX: { shortName: clinicalWasteShortName },
    MANAGE_HAZARDOUS_WASTE: { shortName: hazardousWasteShortName },
    PRE_APPLICATION_REFERENCE: { shortName: preApplicationShortName }
  }
} = require('../../tasks')

const shortNamesToFilter = [
  clinicalWasteShortName,
  hazardousWasteShortName,
  preApplicationShortName
]

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
    const { data: { acceptsClinicalWaste, acceptsHazardousWaste, receivedPreApplicationAdvice } } = await DataStore.get(context)

    // When mapping, remove tasks that we are about to check for
    const taskNames = availableTasks
      .map(({ shortName }) => shortName)
      .filter((shortName) => !shortNamesToFilter.includes(shortName))

    // Add clinical and hazardous waste to the tasklist if applicant has specifically stated they accept them
    if (acceptsClinicalWaste) { taskNames.push(clinicalWasteShortName) }
    if (acceptsHazardousWaste) { taskNames.push(hazardousWasteShortName) }

    // Add pre-application reference number to the tasklist if applicant has stated they received advice
    if (receivedPreApplicationAdvice) { taskNames.push(preApplicationShortName) }

    taskNames.push(climateChangeRiskScreeningShortName)
    taskNames.push(wasteWeightsShortName)

    return task.required || (task.route && taskNames.includes(task.shortName))
  }

  static get isBespoke () {
    return true
  }
}
