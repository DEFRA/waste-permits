'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const BaseCheck = require('../../../src/models/checkList/base.check')
const TechnicalCompetenceCheck = require('../../../src/models/checkList/technicalCompetence.check')

const Qualifications = {
  WAMITAB_QUALIFICATION: {
    technicalQualification: 910400000,
    description: 'WAMITAB or EPOC qualification'
  },
  REGISTERED_ON_A_COURSE: {
    technicalQualification: 910400001,
    description: `We are getting WAMITAB or EPOC qualifications`
  },
  DEEMED_COMPETENCE: {
    technicalQualification: 910400002,
    description: 'Deemed competence or an Environment Agency assessment'
  },
  ESA_EU_SKILLS: {
    technicalQualification: 910400003,
    description: 'Energy & Utility Skills / ESA system'
  }
}

const fakeTechnicalCompetenceEvidence = [
  { filename: 'EVIDENCE_FILENAME_1' },
  { filename: 'EVIDENCE_FILENAME_2' },
  { filename: 'EVIDENCE_FILENAME_3' }
]

const fakeTechnicalManagersEvidence = [
  { filename: 'EVIDENCE_FILENAME_1' },
  { filename: 'EVIDENCE_FILENAME_2' },
  { filename: 'EVIDENCE_FILENAME_3' }
]

const evidencePrefix = 'section-technical-competence-evidence'
const managersPrefix = 'section-technical-competence-managers'

let sandbox

lab.beforeEach(() => {
  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous base methods
  sandbox.stub(BaseCheck.prototype, 'getTechnicalCompetenceEvidence').value(() => fakeTechnicalCompetenceEvidence)
  sandbox.stub(BaseCheck.prototype, 'getTechnicalManagers').value(() => fakeTechnicalManagersEvidence)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('TechnicalCompetence Check tests:', () => {
  lab.test('ruleSetId works correctly', async () => {
    Code.expect(TechnicalCompetenceCheck.task.ruleSetId).to.equal('defra_techcompetenceevreq')
  })

  for (let qualification in Qualifications) {
    lab.experiment('buildlines', () => {
      const { technicalQualification, description } = Qualifications[qualification]
      let check
      let lines

      lab.beforeEach(async () => {
        sandbox.stub(BaseCheck.prototype, 'getApplication').value(() => ({ technicalQualification }))
        check = new TechnicalCompetenceCheck()
        lines = await check.buildLines()
      })

      lab.test(`(${description} line) works correctly`, async () => {
        const { heading, headingId, answers, links } = lines.shift()
        Code.expect(heading).to.equal('Technical competence evidence')
        Code.expect(headingId).to.equal(`${evidencePrefix}-heading`)

        answers.forEach(({ answer, answerId }, answerIndex) => {
          Code.expect(answerId).to.equal(`${evidencePrefix}-answer-${answerIndex + 1}`)
          switch (answerIndex) {
            case 0: {
              Code.expect(answer).to.equal(description)
              break
            }
            case 1: {
              Code.expect(answer).to.equal('Evidence files uploaded:')
              break
            }
            default: {
              const { filename } = fakeTechnicalCompetenceEvidence[answerIndex - 2]
              Code.expect(answer).to.equal(filename)
              break
            }
          }
        })

        const { link, linkId, linkType } = links.shift()
        Code.expect(link).to.equal('/technical-competence')
        Code.expect(linkType).to.equal('technical management qualification')
        Code.expect(linkId).to.equal(`${evidencePrefix}-link`)
      })

      lab.test(`(technical managers evidence line) works correctly`, async () => {
        if (Qualifications[qualification] === Qualifications.ESA_EU_SKILLS) {
          Code.expect(lines.length).to.equal(1)
          return
        }
        Code.expect(lines.length).to.equal(2)
        const { heading, headingId, answers, links } = lines.pop()
        Code.expect(heading).to.equal('Technically competent manager')
        Code.expect(headingId).to.equal(`${managersPrefix}-heading`)

        answers.forEach(({ answer, answerId }, answerIndex) => {
          Code.expect(answerId).to.equal(`${managersPrefix}-answer-${answerIndex + 1}`)
          const { filename } = fakeTechnicalManagersEvidence[answerIndex]
          Code.expect(answer).to.equal(filename)
        })

        const { link, linkId, linkType } = links.pop()
        Code.expect(link).to.equal('/technical-competence/technical-managers')
        Code.expect(linkType).to.equal('technical manager details')
        Code.expect(linkId).to.equal(`${managersPrefix}-link`)
      })
    })
  }
})
