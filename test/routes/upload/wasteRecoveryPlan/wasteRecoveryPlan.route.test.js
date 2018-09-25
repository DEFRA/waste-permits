'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')

const WasteRecoveryPlan = require('../../../../src/models/taskList/wasteRecoveryPlan.task')

const GeneralTestHelper = require('../../generalTestHelper.test')
const UploadTestHelper = require('../uploadHelper')

let fakeAnnotationId = 'ANNOTATION_ID'

const routePath = '/waste-recovery-plan'
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

  sandbox.stub(WasteRecoveryPlan, 'updateCompleteness').value(() => Promise.resolve({}))

  helper.setStubs(sandbox)
})

lab.afterEach(() => {
  // Restore stubbed methods
  sandbox.restore()
})

lab.experiment('Waste recovery plan upload tests:', () => {
  const { routePath, nextRoutePath } = paths
  new GeneralTestHelper({ lab, routePath, nextRoutePath }).test({
    excludeCookiePostTests: true
  })

  const { uploadPath, removePath } = paths

  lab.experiment(`GET ${routePath}`, () => {
    const options = {
      pageHeading: 'Upload the waste recovery plan',
      submitButton: 'Continue',
      fileTypes: ['PDF', 'DOC', 'DOCX', 'ODT']
    }

    // Perform general get tests
    helper.getSuccess(options)
    helper.getFailure()
  })

  lab.experiment(`GET ${removePath}`, () => {
    // Perform general remove tests
    helper.removeSuccess()
  })

  lab.experiment(`POST ${uploadPath}`, () => {
    // Perform general upload tests
    helper.uploadSuccess('application/msword')
    helper.uploadInvalid({ fileTypes: ['PDF', 'DOC', 'DOCX', 'ODT'] }, 'application/msword')
    helper.uploadFailure('application/msword')
  })

  lab.experiment(`POST ${routePath}`, () => {
    // Perform general post tests
    helper.postSuccess({ payload: { 'waste-recovery-plan': 'waste-recovery-plan' } })
  })
})
