'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const BaseCheck = require('../../../src/models/checkList/base.check')
const ManagementSystemCheck = require('../../../src/models/checkList/managementSystem.check')

const fakeManagementSystem = {
  answerCode: 'eco-management',
  answerText: 'Eco-Management and Audit Scheme (EMAS)'
}

const fakeManagementSystemSummaries = [
  { filename: 'FILENAME_1' },
  { filename: 'FILENAME_2' },
  { filename: 'FILENAME_3' }
]

const prefix = 'section-management-system'

let sandbox

lab.beforeEach(() => {
  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous base methods
  sandbox.stub(BaseCheck.prototype, 'getManagementSystem').value(() => fakeManagementSystem)
  sandbox.stub(BaseCheck.prototype, 'getUploadedFileDetails').value(() => fakeManagementSystemSummaries)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('Management system Check tests:', () => {
  lab.experiment('buildlines', () => {
    let check
    let lines

    lab.beforeEach(async () => {
      sandbox.stub(BaseCheck.prototype, 'getApplication').value(() => ({}))
      check = new ManagementSystemCheck()
      lines = await check.buildLines()
    })

    lab.test('(management system summary line) works correctly', async () => {
      const { heading, headingId, answers, links } = lines.pop()
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${prefix}-heading`)

      answers.forEach(({ answer, answerId }, answerIndex) => {
        Code.expect(answerId).to.equal(`${prefix}-answer-${answerIndex + 1}`)
        switch (answerIndex) {
          case 0:
            Code.expect(answer).to.equal(fakeManagementSystem.answerText)
            break
          case 1:
            Code.expect(answer).to.equal('Summary:')
            break
          default: {
            const { filename } = fakeManagementSystemSummaries[answerIndex - 2]
            Code.expect(answer).to.equal(filename)
          }
        }
      })

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/management-system/select')
      Code.expect(linkType).to.equal('management system summary')
      Code.expect(linkId).to.equal(`${prefix}-link`)
    })

    lab.test('Provides the correct task', async () => {
      Code.expect(ManagementSystemCheck.task.id).to.equal('management-system')
    })
  })
})
