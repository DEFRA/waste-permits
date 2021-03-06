'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const BaseCheck = require('../../../src/models/checkList/base.check')
const MiningWasteCheck = require('../../../src/models/checkList/miningWaste.check')

const MINING_WASTE_PLAN_LINE = 0
const MINING_WASTE_WEIGHT_LINE = 1

const prefix = 'section-mining-waste'

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()
  sandbox.stub(BaseCheck.prototype, 'getApplication').value(async () => mocks.application)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('Mining Waste Check tests:', () => {
  lab.test('ruleSetId works correctly', async () => {
    Code.expect(MiningWasteCheck.task.ruleSetId).to.equal('defra_miningdatarequired')
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
      mocks.application.miningWastePlan = 999 // Unrecognised value
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
      const { miningWasteWeight } = mocks.application
      Code.expect(answer).to.equal(`${miningWasteWeight} tonnes`)
      Code.expect(answerId).to.equal(`${linePrefix}-answer`)

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/mining-waste/weight')
      Code.expect(linkType).to.equal('weight')
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })
  })
})
