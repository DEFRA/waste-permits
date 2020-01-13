const { mcpBespoke,
  tasks: {
    PRE_APPLICATION_REFERENCE: { shortName: preApplicationShortName }
  }
} = require('../../tasks')

const BaseTaskList = require('./base.taskList')
const DataStore = require('../../models/dataStore.model')

module.exports = class mcpBespokeTaskList extends BaseTaskList {
  get taskListTemplate () {
    return mcpBespoke
  }

  async isAvailable (task = {}) {
    const { context } = this
    const { taskDeterminants } = context
    const currentTaskDeterminants = task.determinants
    const { data: { receivedPreApplicationAdvice } } = await DataStore.get(context)

    // get list of tasks and flatten it
    // reduce is used since flat method isn't supported in Node 10
    const tasksFromTasklist = this.taskListTemplate.map(item => {
      return item.tasks.map(task => {
        return task.id
      })
    }).reduce((prev, curr) => prev.concat(curr))

    // Add pre-application reference number to the tasklist if applicant has stated they received advice
    if (receivedPreApplicationAdvice) { tasksFromTasklist.push(preApplicationShortName) }

    // if current task isn't in list of tasks then return false straight away
    // as no further checks are necessary
    if (!tasksFromTasklist.includes(task.id)) {
      return false
    }

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
