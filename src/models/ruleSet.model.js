const { tasks } = require('../tasks')
const LoggingService = require('../services/logging.service')
const DynamicsDalService = require('../services/dynamicsDal.service')

module.exports = class RuleSet {
  static find (id) {
    return tasks[id]
  }

  static async getValidRuleSetIds (context, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(context.authToken)
    const ruleSetIds = []
    Object.entries(tasks)
      .forEach(([prop, { ruleSetId }]) => {
        if (ruleSetId) {
          // TODO: EWC: Remove this check when bespoke tasks are implemented
          if (ruleSetId !== 'defra_wastetypeslistrequired') {
            ruleSetIds.push(ruleSetId)
          }
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
    // TODO: EWC: Remove this when bespoke tasks are implemented
    if (require('../config/featureConfig').hasBespokeFeature) {
      validRuleIds.push('defra_wastetypeslistrequired')
    }
    return validRuleIds
  }
}
