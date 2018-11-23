
const { bespoke } = require('../../tasks')
const BaseTaskList = require('./base.taskList')

module.exports = class BespokeTaskList extends BaseTaskList {
  get taskListTemplate () {
    return bespoke
  }

  async isAvailable (task = {}) {
    // ToDo: Filter tasks correctly for bespoke
    return Boolean(task.shortName)
  }
}
