'use strict'

const dateformat = require('dateformat')
const LoggingService = require('../../services/logging.service')
const DataStore = require('../dataStore.model')

module.exports = class BaseTask {
  static async _updateCompleteness (context = {}, applicationId, applicationLineId, value) {
    try {
      const dataStore = await DataStore.get(context)
      const { data } = dataStore
      if (!data.completeness) {
        data.completeness = {}
      }
      data.completeness[this.name] = value
      await dataStore.save(context)
    } catch (error) {
      LoggingService.logError(`Unable set ${this.name} completeness to ${value}: ${error}`)
      throw error
    }
  }

  static async updateCompleteness (...args) {
    await this._updateCompleteness(...args, dateformat(Date.now(), 'yyyy-mm-dd'))
  }

  static async clearCompleteness (...args) {
    await this._updateCompleteness(...args, undefined)
  }

  // Override this inorder to provide a unique check of completeness for each task

  static async checkComplete (context) {
    const { data } = await DataStore.get(context)
    return Boolean(data.completeness && data.completeness[this.name])
  }

  static async isComplete (context, applicationId, applicationLineId) {
    return Boolean(this.checkComplete && await this.checkComplete(context, applicationId, applicationLineId))
  }
}
