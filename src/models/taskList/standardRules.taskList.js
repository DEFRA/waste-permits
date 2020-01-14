
const { standardRules } = require('../../tasks')
const BaseTaskList = require('./base.taskList')
const RuleSet = require('../ruleSet.model')
const DataStore = require('../../models/dataStore.model')

const { PRE_APPLICATION_REFERENCE } = require('../../tasks').tasks

module.exports = class StandardRulesTaskList extends BaseTaskList {
  get taskListTemplate () {
    return standardRules
  }

  async isAvailable (task = {}) {
    const { context } = this
    const { data: { receivedPreApplicationAdvice } } = await DataStore.get(context)

    // Pre-application reference task is available if user indicated they received advice
    if (receivedPreApplicationAdvice && task === PRE_APPLICATION_REFERENCE) { return true }

    const ruleSetIds = await RuleSet.getValidRuleSetIds(this.context)
    return task.required || (task.route && ruleSetIds.includes(task.ruleSetId))
  }

  static get isStandardRules () {
    return true
  }
}
