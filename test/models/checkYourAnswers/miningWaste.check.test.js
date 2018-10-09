'use strict'

const Merge = require('deepmerge')
const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const BaseCheck = require('../../../src/models/checkYourAnswers/base.check')
const MiningWasteCheck = require('../../../src/models/checkYourAnswers/miningWaste.check')

const MINING_WASTE_PLAN_LINE = 0
const MINING_WASTE_WEIGHT_LINE = 1

const prefix = 'section-mining-waste'

let fakeApplication
let sandbox

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID',
    miningWastePlan: 910400000,
    miningWasteWeight: 'one,hundred-thousand'
  }

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()
  sandbox.stub(BaseCheck.prototype, 'getApplication').value(() => fakeApplication)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('Mining Waste Check tests:', () => {
  lab.test('ruleSetId works correctly', async () => {
    Code.expect(MiningWasteCheck.ruleSetId).to.equal('defra_miningdatarequired')
  })

  lab.experiment('buildlines', () => {

    let check
    let lines

    lab.beforeEach(async () => {
      check = new MiningWasteCheck()
      lines = await check.buildLines()
    })

    lab.test('(mining waste plan line) works correctly', async () => {
      const { heading, headingId, answers, links } = lines[MINING_WASTE_PLAN_LINE]
      const linePrefix = `${prefix}-plan`

      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const { answer, answerId } = answers.pop()
      Code.expect(answer).to.equal('Water-based drilling mud mining waste management plan (WMP1)')
      Code.expect(answerId).to.equal(`${linePrefix}-answer`)

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/mining-waste/plan')
      Code.expect(linkType).to.equal('type of mining waste plan')
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })

    lab.test('(unknown mining waste plan type) correctly displays unknown', async () => {
      fakeApplication.miningWastePlan = 999 // Unrecognised value
      lines = await check.buildLines()

      const { answers } = lines[MINING_WASTE_PLAN_LINE]
      const linePrefix = `${prefix}-plan`

      const { answer, answerId } = answers.pop()
      Code.expect(answer).to.equal('Unknown')
      Code.expect(answerId).to.equal(`${linePrefix}-answer`)
    })

    lab.test('(mining waste weight line) works correctly', async () => {
      const { heading, headingId, answers, links } = lines[MINING_WASTE_WEIGHT_LINE]
      const linePrefix = `${prefix}-weight`

      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const { answer, answerId } = answers.pop()
      const { miningWasteWeight } = fakeApplication
      Code.expect(answer).to.equal(`${miningWasteWeight} tonnes`)
      Code.expect(answerId).to.equal(`${linePrefix}-answer`)

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/mining-waste/weight')
      Code.expect(linkType).to.equal('weight')
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })
  })
})
