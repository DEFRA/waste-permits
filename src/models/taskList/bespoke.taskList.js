const { bespoke, tasks: { WASTE_WEIGHTS: { shortName: wasteWeightsShortName } } } = require('../../tasks')
const BaseTaskList = require('./base.taskList')
const Task = require('../../persistence/entities/task.entity')

module.exports = class BespokeTaskList extends BaseTaskList {
  get taskListTemplate () {
    return bespoke
  }

  async isAvailable (task = {}) {
    const { context } = this
    const availableTasks = await Task.getAvailableTasks(context)
    const taskNames = availableTasks.map(({ shortName }) => shortName)
    taskNames.push(wasteWeightsShortName)
    return task.required || (task.route && taskNames.includes(task.shortName))
  }
}
