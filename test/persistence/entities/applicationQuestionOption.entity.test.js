'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const ApplicationQuestionOption = require('../../../src/persistence/entities/applicationQuestionOption.entity')
const BaseEntity = require('../../../src/persistence/entities/base.entity')

let sandbox
let questionCode
let context
let expectedXml
let fakeApplicationQuestionOption

lab.beforeEach(() => {
  fakeApplicationQuestionOption = { optionName: 'Fake option', shortName: 'FAKE' }
  questionCode = 'QUESTION_CODE'
  context = { authToken: 'AUTH_TOKEN' }
  expectedXml = `<fetch><entity name="defra_applicationquestionoption"><attribute name="defra_option"/><attribute name="defra_shortname"/><filter><condition attribute="statecode" operator="eq" value="0"/></filter><link-entity name="defra_applicationquestion" from="defra_applicationquestionid" to="defra_applicationquestion"><filter><condition attribute="defra_shortname" operator="eq" value="${questionCode}"/></filter></link-entity></entity></fetch>`

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(BaseEntity, 'listUsingFetchXml').value(async () => [new ApplicationQuestionOption(fakeApplicationQuestionOption)])
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Application Question Option Entity tests:', () => {
  lab.test('buildQuery() method should return correct xml query', async () => {
    const queryText = ApplicationQuestionOption.buildQuery(questionCode)
    Code.expect(queryText).to.equal(expectedXml)
  })

  lab.test('save() method should fail as this entity is readOnly', async () => {
    let error
    try {
      const applicationQuestionOption = new ApplicationQuestionOption(fakeApplicationQuestionOption)
      await applicationQuestionOption.save()
    } catch (err) {
      error = err
    }
    Code.expect(error.message).to.equal('Unable to save defra_applicationquestionoptions: Read only!')
  })

  lab.test('listOptionsForQuestion() method should return the applicationQuestionOption correctly', async () => {
    const applicationQuestionOptions = await ApplicationQuestionOption.listOptionsForQuestion(context, questionCode)
    const applicationQuestionOption = applicationQuestionOptions.pop()
    Code.expect(applicationQuestionOption.optionName).to.equal(fakeApplicationQuestionOption.optionName)
    Code.expect(applicationQuestionOption.shortName).to.equal(fakeApplicationQuestionOption.shortName)
  })
})
