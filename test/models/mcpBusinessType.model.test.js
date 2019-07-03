'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')

const ApplicationAnswer = require('../../src/persistence/entities/applicationAnswer.entity')
const McpBusinessType = require('../../src/models/mcpBusinessType.model')

const context = { }

const expectedItems = [
  { code: '35.11', description: 'Production of electricity 35.11' },
  { code: '86.10', description: 'Hospital activities 86.10' }
]
let mocks
let fakeApplicationAnswer
let saveSpy

lab.experiment('McpBusinessType test:', () => {
  let sandbox

  lab.beforeEach(() => {
    mocks = new Mocks()

    // Create a sinon sandbox to stub methods
    sandbox = sinon.createSandbox()

    // Stub methods
    sandbox.stub(ApplicationAnswer, 'getByQuestionCode').callsFake(async () => fakeApplicationAnswer)
    saveSpy = sandbox.stub(ApplicationAnswer.prototype, 'save')
    saveSpy.callsFake(async () => undefined)
  })

  lab.afterEach(() => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.experiment('get', () => {
    lab.test('when not set', async () => {
      fakeApplicationAnswer = undefined
      const mcpBusinessType = await McpBusinessType.get(context)
      Code.expect(mcpBusinessType.code).to.not.exist()
      Code.expect(mcpBusinessType.description).to.not.exist()
    })

    lab.test('when set', async () => {
      fakeApplicationAnswer = mocks.applicationAnswers[0]
      const mcpBusinessType = await McpBusinessType.get(context)
      Code.expect(mcpBusinessType.code).to.equal(mocks.applicationAnswers[0].answerText)
    })
  })

  lab.experiment('save', () => {
    lab.test('with nothing', async () => {
      await McpBusinessType.save(context)
      Code.expect(saveSpy.callCount).to.equal(1)
    })

    lab.test('with value', async () => {
      await McpBusinessType.save(context, '99.99')
      Code.expect(saveSpy.callCount).to.equal(1)
    })
  })

  lab.experiment('get main types list', () => {
    lab.test('getMcpMainBusinessTypesList returns correct types', async () => {
      const mcpBusinessTypesLists = McpBusinessType.getMcpMainBusinessTypesList()
      expectedItems.forEach((item) => {
        const foundInList = mcpBusinessTypesLists.find((compareItem) => item.code === compareItem.code)
        Code.expect(foundInList).to.exist()
      })
    })
  })
})
