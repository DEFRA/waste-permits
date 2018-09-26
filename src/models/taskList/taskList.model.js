'use strict'

const Path = require('path')

const config = require('../../config/config')
const { sections, tasks } = require('../../tasks')

const LoggingService = require('../../services/logging.service')
const DynamicsDalService = require('../../services/dynamicsDal.service')

const currentFilename = Path.basename(__filename)

class TaskList {
  static async getTaskListModels (requiredModels) {
    const files = require('fs').readdirSync('./src/models/taskList')
    return files
      // Ignore this file
      .filter((file) => file !== currentFilename)
      // Only include files that are required
      .filter((file) => !requiredModels || (requiredModels && requiredModels.includes(file.split('.')[0])))
      // Return the model
      .map((file) => require(Path.join(__dirname, file)))
  }

  static async getByApplicationLineId (context, applicationLineId) {
    let ruleSetIds
    const taskList = new TaskList()
    try {
      ruleSetIds = await this.getValidRuleSetIds(context, applicationLineId)
    } catch (error) {
      LoggingService.logError(`Unable to get Task List by applicationLineId: ${error}`)
      throw error
    }
    taskList.sections = sections.map(({ id, label: sectionName, tasks }, index) => {
      const sectionItems = tasks
        .map((item) => Object.assign({}, item, {
          href: item.route.path,
          available: item.required || ruleSetIds.includes(item.ruleSetId),
          complete: ruleSetIds.includes(item.completedId)
        }))
        .filter(({ available }) => available)
      const sectionNumber = index + 1
      return { id, sectionNumber, sectionName, sectionItems }
    })

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
      const availableTaskListModels = taskList.sections
        // Flatten sections into one array of tasks
        .reduce((last, next) => last.sectionItems ? last.sectionItems.concat(next.sectionItems) : last.concat(next.sectionItems))
        // Extract the model names
        .map(({ taskListModel }) => taskListModel)
        // Filter out those that are undefined
        .filter((taskListModel) => taskListModel)
      const taskListModels = await this.getTaskListModels(availableTaskListModels)
      const completeList = await Promise.all(taskListModels.map((task) => task.isComplete(context, applicationId, applicationLineId)))
      // False if there are any incomplete tasks
      return completeList.filter((taskComplete) => !taskComplete).length === 0
    } catch (err) {
      console.error('Error calculating completeness:', err.message)
      throw err
    }
  }

  static get RuleSetIds () {
    const ruleSetIds = {}
    Object.entries(tasks).forEach(([prop, { ruleSetId }]) => {
      ruleSetIds[prop] = ruleSetId
    })
    return ruleSetIds
  }

  static get CompletedParameters () {
    const completedParameters = {}
    Object.entries(tasks).forEach(([prop, { completedId }]) => {
      completedParameters[prop] = completedId
    })
    return completedParameters
  }

  static async getValidRuleSetIds (context, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(context.authToken)
    const ruleSetIds = []
    Object.entries(tasks)
      .forEach(([prop, { ruleSetId, completedId }]) => {
        if (ruleSetId) {
          ruleSetIds.push(ruleSetId)
        }
        if (completedId) {
          ruleSetIds.push(completedId)
        }
      })
    const query = encodeURI(`defra_applicationlines(${applicationLineId})?$expand=defra_parametersId($select=${ruleSetIds.join()})`)
    let validRuleIds = []
    try {
      const result = await dynamicsDal.search(query)
      if (result && result.defra_parametersId) {
        // return only those ruleSetIds with a value of true
        validRuleIds = ruleSetIds.filter((ruleSetId) => result.defra_parametersId[ruleSetId])
      }
    } catch (error) {
      LoggingService.logError(`Unable to get RuleSetId list by applicationLineId: ${error}`)
      throw error
    }
    return validRuleIds
  }

  static async getCompleted (context, applicationLineId, completedId) {
    const dynamicsDal = new DynamicsDalService(context.authToken)
    const query = encodeURI(`defra_applicationlines(${applicationLineId})?$expand=defra_parametersId($select=${completedId})`)
    let completed
    try {
      const result = await dynamicsDal.search(query)

      if (result && result.defra_parametersId) {
        completed = result.defra_parametersId[completedId]
      }
    } catch (error) {
      LoggingService.logError(`Unable to get completed by ${completedId}: ${error}`)
      throw error
    }
    return completed
  }
}

module.exports = TaskList
