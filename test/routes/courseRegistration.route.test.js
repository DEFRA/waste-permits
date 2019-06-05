'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')

const StandardRule = require('../../src/persistence/entities/standardRule.entity')

const GeneralTestHelper = require('./generalTestHelper.test')
const UploadTestHelper = require('./uploadHelper')

const WamitabRiskLevel = {
  LOW: 910400001,
  MEDIUM: 910400002
}

let fakeAnnotationId = 'ANNOTATION_ID'

const routePath = '/technical-competence/upload-course-registration'
const paths = {
  routePath,
  uploadPath: `${routePath}/upload`,
  removePath: `${routePath}/remove/${fakeAnnotationId}`,
  nextRoutePath: '/technical-competence/technical-managers'
}

const helper = new UploadTestHelper(lab, paths)

let sandbox
let mocks

lab.beforeEach(() => {
  // Stub methods
  sandbox = sinon.createSandbox()

  sandbox.stub(StandardRule, 'getByApplicationLineId').value(() => Promise.resolve({}))

  mocks = helper.setStubs(sandbox)
})

lab.afterEach(() => {
  // Restore stubbed methods
  sandbox.restore()
})

lab.experiment('Company Declare Upload Course registration tests:', () => {
  const { routePath, nextRoutePath } = paths
  new GeneralTestHelper({ lab, routePath, nextRoutePath }).test({
    excludeCookiePostTests: true
  })

  const { uploadPath, removePath } = paths

  lab.experiment(`GET ${routePath}`, () => {
    const options = {
      descriptionId: 'course-registration-description',
      pageHeading: 'Getting a qualification: upload your evidence',
      submitButton: 'Continue'
    }

    // Perform general get tests
    helper.getSuccess(options, [
      // Additional tests
      {
        title: 'displays WAMITAB medium or high risk information',
        stubs: () => (mocks.standardRule.wamitabRiskLevel = WamitabRiskLevel.MEDIUM),
        test: (doc) => GeneralTestHelper.checkElementsExist(doc, [
          'wamitab-risk-is-medium-or-high',
          'wamitab-risk-is-medium-or-high-abbr'])
      },
      {
        title: 'displays WAMITAB low risk information',
        stubs: () => (mocks.standardRule.wamitabRiskLevel = WamitabRiskLevel.LOW),
        test: (doc) => GeneralTestHelper.checkElementsExist(doc, [
          'wamitab-risk-is-low'])
      },
      {
        title: 'displays expected static content',
        test: (doc) => GeneralTestHelper.checkElementsExist(doc, [
          'course-registration-description-heading',
          'course-registration-description-heading-abbr-1',
          'course-registration-description-heading-abbr-2',
          'operator-competence-paragraph',
          'operator-competence-link',
          'operator-competence-link-abbr'])
      }
    ])
    helper.getFailure()
  })

  lab.experiment(`GET ${removePath}`, () => {
    // Perform general remove tests
    helper.removeSuccess()
  })

  lab.experiment(`POST ${uploadPath}`, () => {
    // Perform general upload tests
    helper.uploadSuccess()
    helper.uploadInvalid()
    helper.uploadFailure()
  })

  lab.experiment(`POST ${routePath}`, () => {
    // Perform general post tests
    helper.postSuccess({ payload: { 'technical-qualification': 'course-registration' } })
  })
})
