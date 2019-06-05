'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const BaseCheck = require('../../../src/models/checkList/base.check')
const FirePreventionPlanCheck = require('../../../src/models/checkList/firePreventionPlan.check')

const fakeFirePreventionPlans = [
  { filename: 'FILENAME_1' },
  { filename: 'FILENAME_2' },
  { filename: 'FILENAME_3' }
]

const prefix = 'section-fire-prevention-plan'

let sandbox

lab.beforeEach(() => {
  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous base methods
  sandbox.stub(BaseCheck.prototype, 'getFirePreventionPlan').value(() => fakeFirePreventionPlans)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('FirePreventionPlan Check tests:', () => {
  lab.test('ruleSetId works correctly', async () => {
    Code.expect(FirePreventionPlanCheck.task.ruleSetId).to.equal('defra_fireplanrequired')
  })

  lab.experiment('buildlines', () => {
    let check
    let lines

    lab.beforeEach(async () => {
      sandbox.stub(BaseCheck.prototype, 'getApplication').value(() => ({}))
      check = new FirePreventionPlanCheck()
      lines = await check.buildLines()
    })

    lab.test(`(firePrevention plan line) works correctly`, async () => {
      const { heading, headingId, answers, links } = lines.pop()
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${prefix}-heading`)

      answers.forEach(({ answer, answerId }, answerIndex) => {
        Code.expect(answerId).to.equal(`${prefix}-answer-${answerIndex + 1}`)
        const { filename } = fakeFirePreventionPlans[answerIndex]
        Code.expect(answer).to.equal(filename)
      })

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/fire-prevention-plan')
      Code.expect(linkType).to.equal('fire prevention plan')
      Code.expect(linkId).to.equal(`${prefix}-link`)
    })
  })
})
