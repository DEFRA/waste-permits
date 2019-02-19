'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')

const AirQualityModellingReport = require('../../src/models/taskList/airQualityModellingReport.task')

const GeneralTestHelper = require('./generalTestHelper.test')
const UploadTestHelper = require('./uploadHelper')

let fakeAnnotationId = 'ANNOTATION_ID'

const routePath = '/mcp/air-quality-modelling/upload/modelling'
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

  sandbox.stub(AirQualityModellingReport, 'updateCompleteness').value(() => Promise.resolve({}))

  helper.setStubs(sandbox)
})

lab.afterEach(() => {
  // Restore stubbed methods
  sandbox.restore()
})

lab.experiment('Air quality modelling report upload tests:', () => {
  const { routePath, nextRoutePath } = paths
  new GeneralTestHelper({ lab, routePath, nextRoutePath }).test({
    excludeCookiePostTests: true
  })

  const { uploadPath, removePath } = paths

  lab.experiment(`GET ${routePath}`, () => {
    const options = {
      pageHeading: 'Upload the air quality modelling report and screening tool',
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

  lab.experiment(`POST ${uploadPath}`, () => {
    // Perform general upload tests
    helper.uploadSuccess('application/vnd.ms-excel')
    helper.uploadInvalid({ fileTypes: ['XLS', 'XLSX', 'ODS', 'PDF'] }, 'application/vnd.ms-excel')
    helper.uploadFailure('application/vnd.ms-excel')
  })

  lab.experiment(`POST ${routePath}`, () => {
    // Perform general post tests
    helper.postSuccess({ payload: { 'air-quality-modelling': 'air-quality-modelling' } })
  })
})