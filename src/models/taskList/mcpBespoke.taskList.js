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

    // get list of tasks and flatten it
    // reduce is used since flat method isn't supported in Node 10
    const tasksFromTasklist = this.taskListTemplate.map(item => {
      return item.tasks.map(task => {
        return task.id
      })
    }).reduce((prev, curr) => prev.concat(curr))

    // if current task isn't in list of tasks then return false straight away
    // as no further checks are necessary
    if (!tasksFromTasklist.includes(task.id)) { return false }

    // this task is available if there are no determinants listed
    // or if none of the listed determinants are false in taskDeterminants
    const available = !currentTaskDeterminants ||
      !currentTaskDeterminants.some(item => {
        return taskDeterminants[item] === false
      })

    return task.required || (task.route && available)
  }

  static get isMcpBespoke () {
    return true
  }
}
