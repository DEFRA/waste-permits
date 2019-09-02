const { bespoke } = require('../../tasks')
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
    return task.required || (task.route && taskNames.includes(task.shortName))
  }
}
