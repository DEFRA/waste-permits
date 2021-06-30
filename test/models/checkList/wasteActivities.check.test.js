'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const BaseCheck = require('../../../src/models/checkList/base.check')
const WasteActivitiesCheck = require('../../../src/models/checkList/wasteActivities.check')
const { path } = require('../../../src/routes').WASTE_ACTIVITY_CONTINUE

const fakeWasteActivities = {
  wasteActivityNames: [
    'ACTIVITY_1',
    'ACTIVITY_2',
    'ACTIVITY_3'
  ]
}

const prefix = 'section-activity'

let sandbox

lab.beforeEach(() => {
  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous base methods
  sandbox.stub(BaseCheck.prototype, 'getWasteActivities').value(() => fakeWasteActivities)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('WasteActivities Check tests:', () => {
  lab.experiment('buildlines', () => {
    let check
    let lines

    lab.beforeEach(async () => {
      check = new WasteActivitiesCheck()
      lines = await check.buildLines()
    })

    lab.test('(waste activities line) works correctly', async () => {
      const { heading, headingId, answers, links } = lines.pop()
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${prefix}-heading`)

      answers.forEach(({ answer, answerId }, answerIndex) => {
        Code.expect(answerId).to.equal(`${prefix}-answer-${answerIndex + 1}`)
        const activity = fakeWasteActivities.wasteActivityNames[answerIndex]
        Code.expect(answer).to.equal(activity)
      })

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal(path)
      Code.expect(linkType).to.equal('waste activities')
      Code.expect(linkId).to.equal(`${prefix}-link`)
    })
  })
})
