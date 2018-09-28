'use strict'

const DynamicsDalService = require('../../services/dynamicsDal.service')
const LoggingService = require('../../services/logging.service')
const ApplicationLine = require('../applicationLine.model')
const TaskList = require('../taskList/taskList.model')

module.exports = class Completeness {
  static async _updateCompleteness (context = {}, applicationId, applicationLineId, value) {
    const dynamicsDal = new DynamicsDalService(context.authToken)

    try {
      const applicationLine = await ApplicationLine.getById(context, applicationLineId)

      const query = `defra_wasteparamses(${applicationLine.parametersId})`
      await dynamicsDal.update(query, { [this.completenessParameter]: value && await this.checkComplete(context, applicationId, applicationLineId) })
    } catch (error) {
      LoggingService.logError(`Unable set ${this.name} completeness to ${value}: ${error}`)
      throw error
    }
  }

  static async updateCompleteness (...args) {
    await this._updateCompleteness(...args, true)
  }

  static async clearCompleteness (...args) {
    await this._updateCompleteness(...args, false)
  }

  // Override this inorder to provide a unique check of completeness for each task
  static async checkComplete () {
    return true
  }

  static async isComplete (context, applicationId, applicationLineId) {
    let isComplete = false
    try {
      // Get the completed flag
      const completed = await TaskList.getCompleted(context, applicationLineId, this.completenessParameter)

      isComplete = Boolean(completed && await this.checkComplete(context, applicationId, applicationLineId))
    } catch (error) {
      LoggingService.logError(`Unable to retrieve ${this.name} completeness: ${error.message}`)
      throw error
    }
    return isComplete
  }
}
