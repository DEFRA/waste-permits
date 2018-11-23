
const { standardRules } = require('../../tasks')
const BaseTaskList = require('./base.taskList')
const RuleSet = require('../ruleSet.model')

module.exports = class StandardRulesTaskList extends BaseTaskList {
  get taskListTemplate () {
    return standardRules
  }

  async isAvailable (task = {}) {
    const ruleSetIds = await RuleSet.getValidRuleSetIds(this.context)
    return task.required || ruleSetIds.includes(task.ruleSetId)
  }

  static get isStandardRules () {
    return true
  }
}
