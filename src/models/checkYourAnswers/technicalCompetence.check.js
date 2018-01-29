const Constants = require('../../constants')
const BaseCheck = require('./base.check')

const {TECHNICAL_QUALIFICATION: ruleSetId} = Constants.Dynamics.RulesetIds
const {TECHNICAL_QUALIFICATION} = Constants.Routes
const {WAMITAB_QUALIFICATION, REGISTERED_ON_A_COURSE, DEEMED_COMPETENCE, ESA_EU_SKILLS} = Constants.Dynamics.TechnicalQualification

module.exports = class TechnicalCheck extends BaseCheck {
  static get rulesetId () {
    return ruleSetId
  }

  get prefix () {
    return `${super.prefix}-technical-competence`
  }

  async buildLines () {
    return Promise.all([
      this.getQualificationLine()
    ])
  }

  static _getDetails (technicalQualification) {
    switch (technicalQualification) {
      case WAMITAB_QUALIFICATION.TYPE:
        return WAMITAB_QUALIFICATION
      case REGISTERED_ON_A_COURSE.TYPE:
        return REGISTERED_ON_A_COURSE
      case DEEMED_COMPETENCE.TYPE:
        return DEEMED_COMPETENCE
      case ESA_EU_SKILLS.TYPE:
        return ESA_EU_SKILLS
    }
  }

  async getQualificationLine () {
    const {technicalQualification = ''} = await this.getApplication()
    const {NAME: technicalQualificationName = ''} = TechnicalCheck._getDetails(technicalQualification) || {}
    const evidence = await this.getTechnicalCompetenceEvidence()
    return this.buildLine({
      heading: 'Technical competence evidence',
      answers: evidence.length ? [technicalQualificationName, 'Evidence files uploaded:'].concat(evidence.map((file) => file.filename)) : [],
      links: [
        {path: TECHNICAL_QUALIFICATION.path, type: 'technical management qualification'}
      ]
    })
  }
}
