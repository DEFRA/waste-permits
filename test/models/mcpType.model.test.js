'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')

const ApplicationAnswer = require('../../src/persistence/entities/applicationAnswer.entity')
const McpType = require('../../src/models/mcpType.model')
const { MCP_TYPES } = require('../../src/dynamics')

const mcpTypes = Object.keys(MCP_TYPES).map((mcpType) => MCP_TYPES[mcpType])

const context = { authToken: 'AUTH_TOKEN' }

let mocks
let saveSpy

lab.experiment('McpType test:', () => {
  let sandbox

  lab.beforeEach(() => {
    mocks = new Mocks()

    mocks.applicationAnswer.questionCode = 'mcp-permit-type'

    // Create a sinon sandbox to stub methods
    sandbox = sinon.createSandbox()

    // Stub methods
    sandbox.stub(ApplicationAnswer, 'getByQuestionCode').callsFake(async () => mocks.applicationAnswer)
    saveSpy = sandbox.stub(ApplicationAnswer.prototype, 'save')
    saveSpy.callsFake(async () => undefined)
  })

  lab.afterEach(() => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.experiment('get', () => {
    lab.test('when not set', async () => {
      const mcpType = await McpType.get(context)
      Code.expect(mcpType).to.not.exist()
    })

    mcpTypes.forEach(({ id }) => lab.test(`when set to ${id}`, async () => {
      mocks.applicationAnswer.answerCode = id
      const mcpType = await McpType.get(context)
      Code.expect(mcpType.id).to.equal(id)
    }))
  })

  lab.experiment('save', () => {
    mcpTypes.forEach(({ id }) => lab.test(`when set to ${id}`, async () => {
      const mcpType = new McpType({ id })
      await mcpType.save(context)
      Code.expect(saveSpy.callCount).to.equal(1)
    }))
  })
})
