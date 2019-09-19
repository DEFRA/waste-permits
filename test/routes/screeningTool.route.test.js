'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')

const ScreeningTool = require('../../src/models/taskList/screeningTool.task')

const GeneralTestHelper = require('./generalTestHelper.test')
const UploadTestHelper = require('./uploadHelper')

let fakeAnnotationId = 'ANNOTATION_ID'

const routePath = '/mcp/air-dispersion-modelling/upload/screening-only'
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

  sandbox.stub(ScreeningTool, 'updateCompleteness').value(() => Promise.resolve({}))

  helper.setStubs(sandbox)
})

lab.afterEach(() => {
  // Restore stubbed methods
  sandbox.restore()
})

lab.experiment('Screening tool upload tests:', () => {
  const { routePath, nextRoutePath } = paths
  new GeneralTestHelper({ lab, routePath, nextRoutePath }).test({
    excludeCookiePostTests: true
  })

  const { uploadPath, removePath } = paths

  lab.experiment(`GET ${routePath}`, () => {
    const options = {
      pageHeading: 'Upload the completed screening tool',
      submitButton: 'Continue',
      fileTypes: ['XLS', 'XLSX', 'ODS', 'PDF']
    }

    // Perform general get tests
    helper.getSuccess(options)
    helper.getFailure()
  })

  lab.experiment(`GET ${removePath}`, () => {
    // Perform general remove tests
    helper.removeSuccess()
  })

  lab.experiment.only(`POST ${uploadPath}`, () => {
    // Perform general upload tests
    helper.uploadSuccess('application/vnd.ms-excel', 'test.xls')
    helper.uploadInvalid({ fileTypes: ['XLS', 'XLSX', 'ODS', 'PDF'] }, 'application/vnd.ms-excel', 'test.xls')
    helper.uploadFailure('application/vnd.ms-excel', 'test.xls')
  })

  lab.experiment(`POST ${routePath}`, () => {
    // Perform general post tests
    helper.postSuccess({ payload: { 'air-dispersion-modelling': 'air-dispersion-modelling' } })
  })
})
