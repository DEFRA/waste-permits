'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const TechnicalQualification = require('../../../../src/models/taskList/technicalQualification.model')
const StandardRule = require('../../../../src/models/standardRule.model')

const GeneralTestHelper = require('../../generalTestHelper.test')
const UploadTestHelper = require('../uploadHelper')

const WamitabRiskLevel = {
  LOW: 910400001,
  MEDIUM: 910400002
}

let fakeAnnotationId = 'ANNOTATION_ID'

const routePath = '/technical-qualification/upload-course-registration'
const paths = {
  routePath,
  uploadPath: `${routePath}/upload`,
  removePath: `${routePath}/remove/${fakeAnnotationId}`,
  nextRoutePath: '/task-list'
}

const helper = new UploadTestHelper(lab, paths)

let sandbox

lab.beforeEach(() => {
  // Stub methods
  sandbox = sinon.createSandbox()
  sandbox.stub(TechnicalQualification, 'updateCompleteness').value(() => Promise.resolve({}))
  sandbox.stub(StandardRule, 'getByApplicationLineId').value(() => Promise.resolve({}))
  helper.setStubs(sandbox)
})

lab.afterEach(() => {
  // Restore stubbed methods
  sandbox.restore()
})

lab.experiment('Company Declare Upload Course registration tests:', () => {
  new GeneralTestHelper(lab, paths.routePath, paths.nextRoutePath).test(false, true)

  const {uploadPath, removePath} = paths

  lab.experiment(`GET ${routePath}`, () => {
    const options = {
      descriptionId: 'course-registration-description',
      pageHeading: 'Getting a qualification: upload evidence',
      submitButton: 'Continue'
    }

    // Perform general get tests
    helper.getSuccess(options, [
      // Additional tests
      {
        title: 'displays WAMITAB medium or high risk information',
        stubs: () => (StandardRule.getByApplicationLineId = () => ({wamitabRiskLevel: WamitabRiskLevel.MEDIUM})),
        test: (doc) => Code.expect(doc.getElementById('wamitab-risk-is-medium-or-high')).to.exist()
      },
      {
        title: 'displays WAMITAB low risk information',
        stubs: () => (StandardRule.getByApplicationLineId = () => ({wamitabRiskLevel: WamitabRiskLevel.LOW})),
        test: (doc) => Code.expect(doc.getElementById('wamitab-risk-is-low')).to.exist()
      },
      {
        title: 'displays correct course registration details',
        test: (doc) => {
          Code.expect(GeneralTestHelper.textContent(doc.getElementById('course-registration-description')))
            .to.equal('Upload the WAMITAB or EPOC course registration email or letter. You must complete the qualification within 4 weeks of starting operating. Check the WAMITAB risk tables (opens new tab) to find the qualifications needed for this permit.')
        }
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
    helper.postSuccess({payload: {'technical-qualification': 'course-registration'}})
  })
})
