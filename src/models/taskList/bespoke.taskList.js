
const { bespoke } = require('../../tasks')
const BaseTaskList = require('./base.taskList')
const Task = require('../../persistence/entities/task.entity')

module.exports = class BespokeTaskList extends BaseTaskList {
  get taskListTemplate () {
    return bespoke
  }

  async getSections () {
    const { context } = this
    // preload available tasks for use in isAvailable
    await Task.getAvailableTasks(context)
    return super.getSections()
  }

  async isAvailable (task = {}) {
    const { context } = this
    const availableTasks = context.availableTasks.map(({ shortName }) => shortName)
    return task.required || (task.route && availableTasks.includes(task.shortName))
  }
}
