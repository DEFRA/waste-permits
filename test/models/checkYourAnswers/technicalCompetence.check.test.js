'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const BaseCheck = require('../../../src/models/checkYourAnswers/base.check')
const TechnicalCompetenceCheck = require('../../../src/models/checkYourAnswers/technicalCompetence.check')

const Qualifications = {
  WAMITAB_QUALIFICATION: {
    technicalQualification: 910400000,
    description: 'WAMITAB or EPOC qualification'
  },
  REGISTERED_ON_A_COURSE: {
    technicalQualification: 910400001,
    description: `We're getting WAMITAB or EPOC qualifications`
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
  {filename: 'EVIDENCE_FILENAME_1'},
  {filename: 'EVIDENCE_FILENAME_2'},
  {filename: 'EVIDENCE_FILENAME_3'}
]

const prefix = 'section-technical-competence'

let sandbox

lab.beforeEach(() => {
  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous base methods
  sandbox.stub(BaseCheck.prototype, 'getTechnicalCompetenceEvidence').value(() => fakeTechnicalCompetenceEvidence)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('TechnicalCompetence Check tests:', () => {
  lab.test('rulesetId works correctly', async () => {
    Code.expect(TechnicalCompetenceCheck.rulesetId).to.equal('defra_techcompetenceevreq')
  })

  for (let qualification in Qualifications) {
    lab.experiment('buildlines', () => {
      const {technicalQualification, description} = Qualifications[qualification]
      let check
      let lines

      lab.beforeEach(async () => {
        sandbox.stub(BaseCheck.prototype, 'getApplication').value(() => ({technicalQualification}))
        check = new TechnicalCompetenceCheck()
        lines = await check.buildLines()
      })

      lab.test(`(${description} line) works correctly`, async () => {
        const {heading, headingId, answers, links} = lines.pop()
        Code.expect(heading).to.equal(heading)
        Code.expect(headingId).to.equal(`${prefix}-heading`)

        answers.forEach(({answer, answerId}, answerIndex) => {
          Code.expect(answerId).to.equal(`${prefix}-answer-${answerIndex + 1}`)
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
              const {filename} = fakeTechnicalCompetenceEvidence[answerIndex - 2]
              Code.expect(answer).to.equal(filename)
              break
            }
          }
        })

        const {link, linkId, linkType} = links.pop()
        Code.expect(link).to.equal('/technical-qualification')
        Code.expect(linkType).to.equal('technical management qualification')
        Code.expect(linkId).to.equal(`${prefix}-link`)
      })
    })
  }
})
