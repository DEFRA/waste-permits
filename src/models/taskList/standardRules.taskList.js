const { standardRules,
  tasks: {
    PRE_APPLICATION_REFERENCE: { ruleSetId: preApplicationRuleSet }
  }
} = require('../../tasks')

const BaseTaskList = require('./base.taskList')
const RuleSet = require('../ruleSet.model')
const DataStore = require('../../models/dataStore.model')

module.exports = class StandardRulesTaskList extends BaseTaskList {
  get taskListTemplate () {
    return standardRules
  }

  async isAvailable (task = {}) {
    const { context } = this
    const { data: { receivedPreApplicationAdvice } } = await DataStore.get(context)

    const ruleSetIds = await RuleSet.getValidRuleSetIds(this.context)

    // Add pre-application reference available to rulesets if applicant indicated they received advice
    if (receivedPreApplicationAdvice) { ruleSetIds.push(preApplicationRuleSet) }

    return task.required || (task.route && ruleSetIds.includes(task.ruleSetId))
  }

  static get isStandardRules () {
    return true
  }
}
