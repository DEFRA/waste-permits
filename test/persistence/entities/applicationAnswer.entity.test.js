'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const ApplicationAnswer = require('../../../src/persistence/entities/applicationAnswer.entity')
const BaseEntity = require('../../../src/persistence/entities/base.entity')
const DynamicsDalService = require('../../../src/services/dynamicsDal.service')

let sandbox
let applicationId
let questionCode
let context
let expectedXml
let fakeApplicationAnswer

lab.beforeEach(() => {
  applicationId = 'APPLICATION_ID'
  questionCode = 'QUESTION_CODE'
  context = { authToken: 'AUTH_TOKEN', applicationId }
  expectedXml = `<fetch top="1000" no-lock="true"><entity name="defra_applicationanswer"><attribute name="defra_answer_option" /><attribute name="defra_applicationlineid" /><attribute name="defra_application" /><attribute name="defra_answertext" /><attribute name="defra_applicationanswerid" /><filter type="and"><condition attribute="defra_application" operator="eq" value="${applicationId}" /><condition attribute="statecode" operator="eq" value="0" /></filter><link-entity name="defra_applicationquestion" from="defra_applicationquestionid" to="defra_question" link-type="inner" alias="question"><attribute name="defra_shortname" /><filter type="and"><condition attribute="statecode" operator="eq" value="0" /><condition attribute="defra_shortname" operator="in"><value>${questionCode}</value></condition></filter></link-entity><link-entity name="defra_applicationquestionoption" from="defra_applicationquestionoptionid" to="defra_answer_option" link-type="outer" alias="answeroption"><attribute name="defra_option" /><attribute name="defra_shortname" /><filter><condition attribute="statecode" operator="eq" value="0" /></filter></link-entity></entity></fetch>`

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(DynamicsDalService.prototype, 'callAction').value(() => {})
  sandbox.stub(BaseEntity, 'listUsingFetchXml').value(async () => [new ApplicationAnswer(fakeApplicationAnswer)])
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Application Answer Entity tests:', () => {
  lab.test('buildQuery() method should return correct xml query', async () => {
    const queryText = ApplicationAnswer.buildQuery(context, [questionCode])
    Code.expect(queryText).to.equal(expectedXml)
  })

  lab.test('getByQuestionCode() method should return the applicationAnswer correctly', async () => {
    fakeApplicationAnswer = { questionCode, answerCode: 'ANSWER_CODE', answerText: 'ANSWER_TEXT' }
    let applicationAnswer = await ApplicationAnswer.getByQuestionCode(context, questionCode)
    Code.expect(applicationAnswer.answerCode).to.equal(fakeApplicationAnswer.answerCode)
    Code.expect(applicationAnswer.answerText).to.equal(fakeApplicationAnswer.answerText)
    Code.expect(applicationAnswer.questionCode).to.equal(fakeApplicationAnswer.questionCode)
  })

  lab.test('listByMultipleQuestionCodes() method should return the applicationAnswer correctly', async () => {
    fakeApplicationAnswer = { questionCode, answerCode: 'ANSWER_CODE', answerText: 'ANSWER_TEXT' }
    const applicationAnswers = await ApplicationAnswer.listByMultipleQuestionCodes(context, [questionCode])
    let applicationAnswer = applicationAnswers.pop()
    Code.expect(applicationAnswer.answerCode).to.equal(fakeApplicationAnswer.answerCode)
    Code.expect(applicationAnswer.answerText).to.equal(fakeApplicationAnswer.answerText)
    Code.expect(applicationAnswer.questionCode).to.equal(fakeApplicationAnswer.questionCode)
  })

  lab.test('save() method should save the applicationAnswer correctly', async () => {
    const callActionSpy = sinon.spy(DynamicsDalService.prototype, 'callAction')
    const applicationAnswer = new ApplicationAnswer({ questionCode, answerCode: 'ANSWER_CODE', answerText: 'ANSWER_TEXT' })
    await applicationAnswer.save(context)
    let action = `defra_applications(${applicationId})/Microsoft.Dynamics.CRM.defra_set_application_answer`
    Code.expect(callActionSpy.calledWith(action, {
      QuestionCode: questionCode,
      AnswerCode: applicationAnswer.answerCode,
      AnswerText: applicationAnswer.answerText
    })).to.be.true()
  })
})
