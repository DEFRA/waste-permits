'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const BaseCheck = require('../../../src/models/checkList/base.check')
const McpBusinessActivityCheck = require('../../../src/models/checkList/mcpBusinessActivity.check')

const prefix = 'section-mcp-business-activity'

let sandbox
let mocks
let check
let lines

lab.beforeEach(() => {
  mocks = new Mocks()
  mocks.dataStore.data.consult = {
    none: true
  }

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()
  sandbox.stub(BaseCheck.prototype, 'getMcpBusinessType').value(async () => mocks.mcpBusinessType)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('MCP Business or Activity Type Check tests:', () => {
  lab.experiment('buildlines', () => {
    lab.test('(MCP Business or Activity Type line) works correctly for 35.11', async () => {
      mocks.mcpBusinessType.code = '35.11'

      check = new McpBusinessActivityCheck()
      lines = await check.buildLines()
      const { heading, headingId, answers, links } = lines[0]

      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${prefix}-heading`)

      Code.expect(answers.length).to.equal(1)
      const { answer, answerId } = answers.pop()
      Code.expect(answer).to.equal('35.11')
      Code.expect(answerId).to.equal(`${prefix}-answer`)

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/mcp/business-activity')
      Code.expect(linkType).to.equal('business or activity type')
      Code.expect(linkId).to.equal(`${prefix}-link`)
    })
  })
})
