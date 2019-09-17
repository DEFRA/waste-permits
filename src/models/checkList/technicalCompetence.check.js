const Dynamics = require('../../dynamics')
const BaseCheck = require('./base.check')
const { UploadSubject } = require('../../constants')

const { TECHNICAL_QUALIFICATION } = require('../../tasks').tasks
const { TECHNICAL_QUALIFICATION: { path: qualificationPath } } = require('../../routes')
const { TECHNICAL_MANAGERS: { path: managersPath } } = require('../../routes')
const { WAMITAB_QUALIFICATION, REGISTERED_ON_A_COURSE, DEEMED_COMPETENCE, ESA_EU_SKILLS } = Dynamics.TechnicalQualification

module.exports = class TechnicalCheck extends BaseCheck {
  static get task () {
    return TECHNICAL_QUALIFICATION
  }

  get prefix () {
    return `${super.prefix}-technical-competence`
  }

  async buildLines () {
    const lines = [this.getQualificationLine()]

    const { technicalQualification = '' } = await this.getApplication()
    if (technicalQualification !== ESA_EU_SKILLS.TYPE) {
      lines.push(this.getTechnicalManagersLine())
    }
    return Promise.all(lines)
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
    const { technicalQualification = '' } = await this.getApplication()
    const { NAME: technicalQualificationName = '' } = TechnicalCheck._getDetails(technicalQualification) || {}
    const evidence = await this.getUploadedFileDetails(UploadSubject.TECHNICAL_QUALIFICATION, 'technicalCompetenceEvidence')
    return this.buildLine({
      heading: 'Technical competence evidence',
      prefix: 'evidence',
      answers: evidence.length ? [technicalQualificationName, 'Evidence files uploaded:'].concat(evidence.map((file) => file.filename)) : [],
      links: [
        { path: qualificationPath, type: 'technical management qualification' }
      ]
    })
  }

  async getTechnicalManagersLine () {
    const evidence = await this.getUploadedFileDetails(UploadSubject.TECHNICAL_MANAGERS, 'technicalManagers')
    return this.buildLine({
      heading: 'Technically competent manager',
      prefix: 'managers',
      answers: evidence.map((file) => file.filename),
      links: [
        { path: managersPath, type: 'technical manager details' }
      ]
    })
  }
}
