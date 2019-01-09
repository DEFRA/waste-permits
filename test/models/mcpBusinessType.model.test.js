'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')

const ApplicationAnswer = require('../../src/persistence/entities/applicationAnswer.entity')
const ApplicationQuestionOption = require('../../src/persistence/entities/applicationQuestionOption.entity')
const McpBusinessType = require('../../src/models/mcpBusinessType.model')

const context = { authToken: 'AUTH_TOKEN' }

const fakeApplicationQuestionOptions = [
  { shortName: 'other-3', optionName: 'Other alphabetically middle' },
  { shortName: 'e-37', optionName: 'E 37' },
  { shortName: 'c-10', optionName: 'C 10' },
  { shortName: 'a-1', optionName: 'A 1' },
  { shortName: 'other-1', optionName: 'Other alphabetically posterior' },
  { shortName: 'd-35', optionName: 'D 35' },
  { shortName: 'q-86', optionName: 'Q 86' },
  { shortName: 'other-2', optionName: 'Other alphabetically first' }
]

const correctList = {
  mainTypes: [
    { code: 'd-35', description: 'D 35' },
    { code: 'c-10', description: 'C 10' },
    { code: 'e-37', description: 'E 37' },
    { code: 'q-86', description: 'Q 86' },
    { code: 'a-1', description: 'A 1' }
  ],
  otherTypes: [
    { code: 'other-2', description: 'Other alphabetically first' },
    { code: 'other-3', description: 'Other alphabetically middle' },
    { code: 'other-1', description: 'Other alphabetically posterior' }
  ]
}

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
      Code.expect(mcpBusinessType.code).to.equal(mocks.applicationAnswers[0].answerCode)
      Code.expect(mcpBusinessType.description).to.equal(mocks.applicationAnswers[0].answerDescription)
    })
  })

  lab.experiment('save', () => {
    lab.test('with nothing', async () => {
      await McpBusinessType.save(context)
      Code.expect(saveSpy.callCount).to.equal(1)
    })

    lab.test('with value', async () => {
      await McpBusinessType.save(context, 'CODE')
      Code.expect(saveSpy.callCount).to.equal(1)
    })
  })

  lab.experiment('get types lists', () => {
    lab.beforeEach(() => {
      sandbox.stub(ApplicationQuestionOption, 'listOptionsForQuestion').callsFake(async () => fakeApplicationQuestionOptions.map((item) => new ApplicationQuestionOption(item)))
    })
    lab.test('getMcpBusinessTypesLists returns correct types', async () => {
      const mcpBusinessTypesLists = await McpBusinessType.getMcpBusinessTypesLists()
      Code.expect(mcpBusinessTypesLists).to.equal(correctList)
    })
  })

})
