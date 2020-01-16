'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const BaseCheck = require('../../../src/models/checkList/base.check')
const PreApplication = require('../../../src/models/checkList/preApplication.check')

const prefix = 'section-preapp'
const { path } = require('../../../src/routes').PRE_APPLICATION_REFERENCE
const PRE_APPLICATION_REFERENCE = 'EPR/AB1234CD/A001'

let sandbox
let mocks
let check
let lines

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()
  sandbox.stub(BaseCheck.prototype, 'getPreApplication').value(async () => mocks.preApplication)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('preApplication.check tests:', () => {
  lab.experiment('buildlines', () => {
    lab.test('Returns correct response', async () => {
      mocks.preApplication.preApplicationReference = PRE_APPLICATION_REFERENCE
      check = new PreApplication()
      lines = await check.buildLines()
      const { heading, headingId, answers, links } = lines[0]

      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${prefix}-heading`)

      Code.expect(answers.length).to.equal(1)
      const { answer, answerId } = answers.pop()
      Code.expect(answer).to.equal(PRE_APPLICATION_REFERENCE)
      Code.expect(answerId).to.equal(`${prefix}-answer`)

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal(path)
      Code.expect(linkType).to.equal('pre-application reference')
      Code.expect(linkId).to.equal(`${prefix}-link`)
    })
  })
})
