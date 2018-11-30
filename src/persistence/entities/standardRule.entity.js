'use strict'

const BaseEntity = require('./base.entity')
const ApplicationLine = require('./applicationLine.entity')

class StandardRule extends BaseEntity {
  static get dynamicsEntity () {
    return 'defra_standardrules'
  }

  static get readOnly () {
    return true
  }

  static get mapping () {
    return [
      { field: 'id', dynamics: 'defra_standardruleid' },
      { field: 'standardRuleTypeId', dynamics: '_defra_standardruletypeid_value' },
      { field: 'permitName', dynamics: 'defra_rulesnamegovuk' },
      { field: 'limits', dynamics: 'defra_limits' },
      { field: 'code', dynamics: 'defra_code', encode: true },
      { field: 'wamitabRiskLevel', dynamics: 'defra_wamitabrisklevel' },
      { field: 'guidanceUrl', dynamics: 'defra_guidanceurl' },
      { field: 'canApplyFor', dynamics: 'defra_canapplyfor' },
      { field: 'canApplyOnline', dynamics: 'defra_canapplyonline' }
    ]
  }

  constructor (...args) {
    super(...args)
    const [standardRule] = args
    this.codeForId = StandardRule.transformPermitCode(standardRule.code)
  }

  static async getByCode (context, code) {
    return super.getBy(context, { code })
  }

  static async getByApplicationLineId (context) {
    const { applicationLineId } = context
    const { standardRuleId } = await ApplicationLine.getById(context, applicationLineId)
    if (standardRuleId) {
      return StandardRule.getById(context, standardRuleId)
    }
  }

  static async list (context, standardRuleTypeId) {
    return this.listBy(context, { canApplyFor: true, standardRuleTypeId }, 'permitName')
  }

  // Transform the code into kebab-case for ID
  static transformPermitCode (code) {
    return code.replace(/\s+/g, '-').toLowerCase()
  }
}

StandardRule.setDefinitions()

module.exports = StandardRule
