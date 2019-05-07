
const { mcpBespoke } = require('../../tasks')
const BaseTaskList = require('./base.taskList')

module.exports = class mcpBespokeTaskList extends BaseTaskList {
  get taskListTemplate () {
    return mcpBespoke
  }

  async isAvailable (task = {}) {
    const { context } = this
    const { taskDeterminants } = context
    const currentTaskDeterminants = task.determinants

    // this task is available if there are no determinants listed
    // or if none of the listed determinants are false in taskDeterminants
    const available = !currentTaskDeterminants ||
     !currentTaskDeterminants.some(item => {
       return taskDeterminants[item] === false
     })

    return task.required || (task.route && available)
  }
}
