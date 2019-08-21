'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')

const OdourManagementPlan = require('../../src/models/taskList/odourManagementPlan.task')

const GeneralTestHelper = require('./generalTestHelper.test')
const UploadTestHelper = require('./uploadHelper')

let fakeAnnotationId = 'ANNOTATION_ID'

const routePath = '/odour-management-plan/upload'
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

  sandbox.stub(OdourManagementPlan, 'updateCompleteness').value(() => Promise.resolve({}))

  helper.setStubs(sandbox)
})

lab.afterEach(() => {
  // Restore stubbed methods
  sandbox.restore()
})

lab.experiment('Odour management plan upload tests:', () => {
  const { routePath, nextRoutePath } = paths
  new GeneralTestHelper({ lab, routePath, nextRoutePath }).test({
    excludeCookiePostTests: true
  })

  const { uploadPath, removePath } = paths

  lab.experiment(`GET ${routePath}`, () => {
    const options = {
      pageHeading: 'Upload the odour management plan',
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
    helper.postSuccess({ payload: { 'odour-management-plan': 'odour-management-plan' } })
  })
})
