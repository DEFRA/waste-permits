'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')

const WasteTypesList = require('../../src/models/taskList/wasteTypesList.task')

const GeneralTestHelper = require('./generalTestHelper.test')
const UploadTestHelper = require('./uploadHelper')

let fakeAnnotationId = 'ANNOTATION_ID'

const routePath = '/waste-codes'
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

  sandbox.stub(WasteTypesList, 'updateCompleteness').value(() => Promise.resolve({}))

  helper.setStubs(sandbox)
})

lab.afterEach(() => {
  // Restore stubbed methods
  sandbox.restore()
})

lab.experiment('Upload Waste Types List tests:', () => {
  const { routePath, nextRoutePath } = paths
  new GeneralTestHelper({ lab, routePath, nextRoutePath }).test({
    excludeCookiePostTests: true
  })

  const { uploadPath, removePath } = paths

  lab.experiment(`GET ${routePath}`, () => {
    const options = {
      descriptionId: 'waste-types-list-description',
      pageHeading: 'Upload the waste codes for your activities',
      submitButton: 'Continue',
      fileTypes: ['CSV']
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
    helper.uploadSuccess('text/csv', 'test.csv')
    helper.uploadInvalid({ fileTypes: ['CSV'] }, 'text/csv', 'test.csv', false)
    helper.uploadFailure('text/csv', 'test.csv')
  })

  lab.experiment(`POST ${routePath}`, () => {
    // Perform general post tests
    helper.postSuccess({ payload: { 'upload-waste-types-list': 'upload-waste-types-list' } })
  })
})
