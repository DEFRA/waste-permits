'use strict'

const config = require('../../config/config')
const DataStore = require('../../models/dataStore.model')
const { BESPOKE: { id: BESPOKE }, STANDARD_RULES: { id: STANDARD_RULES } } = require('../../constants').PermitTypes

class BaseTaskList {
  constructor (context) {
    this.context = context
  }

  get taskListTemplate () {
    // This must be declared in the sub class
    throw new Error('taskListTemplate getter function must be defined in sub class')
  }

  async isAvailable () {
    throw new Error('isAvailable function must be defined in sub class')
  }

  static async getTaskListClass (context) {
    const dataStore = await DataStore.get(context)
    context.permitType = dataStore.data.permitType
    switch (context.permitType) {
      case undefined: // Default to standard rules for missing values as these will pre-date the introduction of bespoke
      case STANDARD_RULES: return require('./standardRules.taskList')
      case BESPOKE: return require('./bespoke.taskList')
      default: throw new Error(`Unexpected permitType: ${context.permitType}`)
    }
  }

  async getTaskModel (taskListModelId) {
    return require(`./${taskListModelId}.task`)
  }

  async getAvailableTasks (tasks) {
    return Promise.all(tasks.map(async (task) => {
      const TaskModel = task.taskListModel && await this.getTaskModel(task.taskListModel)
      return Object.assign({}, task, {
        href: task.route && task.route.path,
        available: await this.isAvailable(task),
        complete: TaskModel && await TaskModel.isComplete(this.context)
      })
    }))
  }

  async getSections () {
    return Promise.all(this.taskListTemplate.map(async ({ id, label: sectionName, tasks }, index) => {
      const availableTasks = await this.getAvailableTasks(tasks)
      const sectionNumber = index + 1
      return { id, sectionNumber, sectionName, sectionItems: availableTasks.filter(({ available }) => available) }
    }))
  }

  static async buildTaskList (context) {
    const taskList = new this(context)
    taskList.sections = await taskList.getSections()
    return taskList
  }

  // Iterates through all of the task list items and calls the isComplete() function of each one,
  // combining the results into a single boolean value if all task list items are complete
  static async isComplete (context) {
    if (config.bypassCompletenessCheck) {
      return true
    }
    try {
      const taskList = await this.buildTaskList(context)
      const incompleteList = taskList.sections
        // Flatten sections into one array of tasks
        .reduce((last, next) => last.sectionItems ? last.sectionItems.concat(next.sectionItems) : last.concat(next.sectionItems))
        // Extract the model names
        .filter(({ complete, taskListModel }) => taskListModel && !complete)
      return incompleteList.length === 0
    } catch (err) {
      console.error('Error calculating completeness:', err.message)
      throw err
    }
  }
}

module.exports = BaseTaskList
