
const { bespoke } = require('../../tasks')
const BaseTaskList = require('./base.taskList')
const Task = require('../../persistence/entities/task.entity')

module.exports = class BespokeTaskList extends BaseTaskList {
  get taskListTemplate () {
    return bespoke
  }

  async isAvailable (task = {}) {
    const { context } = this
    if (!context.availableTasks) {
      context.availableTasks = (await Task.getAvailableTasks(context)).map(({ shortName }) => shortName)
    }
    return task.required || (task.route && context.availableTasks.includes(task.shortName))
  }
}
