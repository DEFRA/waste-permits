'use strict'

const config = require('../../config/config')
const { sections } = require('../../tasks')

const LoggingService = require('../../services/logging.service')
const RuleSet = require('../ruleSet.model')

class TaskList {
  static async getTaskListModel (taskListModelId) {
    return require(`./${taskListModelId}.task`)
  }

  static async getByApplicationLineId (context, applicationLineId) {
    let ruleSetIds
    const taskList = new TaskList()
    try {
      ruleSetIds = await RuleSet.getValidRuleSetIds(context, applicationLineId)
    } catch (error) {
      LoggingService.logError(`Unable to get Task List by applicationLineId: ${error}`)
      throw error
    }

    const getItem = async (item) => {
      const taskListModel = item.taskListModel ? await this.getTaskListModel(item.taskListModel) : undefined
      const complete = taskListModel ? await taskListModel.isComplete(context, context.applicationId, applicationLineId) : false
      const task = {
        href: item.route.path,
        available: item.required || ruleSetIds.includes(item.ruleSetId),
        complete
      }
      return Object.assign({}, item, task)
    }

    const getSection = async ({ id, label: sectionName, tasks }, index) => {
      const items = await Promise.all(tasks.map(getItem))
      const sectionNumber = index + 1
      return { id, sectionNumber, sectionName, sectionItems: items.filter(({ available }) => available) }
    }

    taskList.sections = await Promise.all(sections.map(getSection))

    return taskList
  }

  // Iterates through all of the task list items and calls the isComplete() function of each one,
  // combining the results into a single boolean value if all task list items are complete
  static async isComplete (context, applicationId, applicationLineId) {
    if (config.bypassCompletenessCheck) {
      return true
    }
    try {
      const taskList = await this.getByApplicationLineId(context, applicationLineId)
      const incompleteList = taskList.sections
        // Flatten sections into one array of tasks
        .reduce((last, next) => last.sectionItems ? last.sectionItems.concat(next.sectionItems) : last.concat(next.sectionItems))
        // Extract the model names
        .filter(({ complete, taskListModel }) => taskListModel && !complete)
      // False if there are any incomplete tasks
      return incompleteList.length === 0
    } catch (err) {
      console.error('Error calculating completeness:', err.message)
      throw err
    }
  }
}

module.exports = TaskList
