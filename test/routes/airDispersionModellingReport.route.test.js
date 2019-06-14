'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')

const AirDispersionModellingReport = require('../../src/models/taskList/airDispersionModellingReport.task')

const GeneralTestHelper = require('./generalTestHelper.test')
const UploadTestHelper = require('./uploadHelper')

let fakeAnnotationId = 'ANNOTATION_ID'

const routePath = '/mcp/air-dispersion-modelling/upload/modelling'
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

  sandbox.stub(AirDispersionModellingReport, 'updateCompleteness').value(() => Promise.resolve({}))

  helper.setStubs(sandbox)
})

lab.afterEach(() => {
  // Restore stubbed methods
  sandbox.restore()
})

lab.experiment('Air dispersion modelling report upload tests:', () => {
  const { routePath, nextRoutePath } = paths
  new GeneralTestHelper({ lab, routePath, nextRoutePath }).test({
    excludeCookiePostTests: true
  })

  const { uploadPath, removePath } = paths

  lab.experiment(`GET ${routePath}`, () => {
    const options = {
      pageHeading: 'Upload the air dispersion modelling report and screening tool',
      submitButton: 'Continue',
      fileTypes: ['AAI', 'ADI', 'AMI', 'APL', 'BPI', 'CSV', 'DEM', 'DIN', 'EMI', 'FAC', 'HRL', 'MET', 'ODS', 'PDF', 'PFL', 'ROU', 'RUF', 'SFC', 'TER', 'VAR', 'XLS', 'XLSX']
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
    helper.uploadInvalid({ fileTypes: ['AAI', 'ADI', 'AMI', 'APL', 'BPI', 'CSV', 'DEM', 'DIN', 'EMI', 'FAC', 'HRL', 'MET', 'ODS', 'PDF', 'PFL', 'ROU', 'RUF', 'SFC', 'TER', 'VAR', 'XLS', 'XLSX'] }, 'application/vnd.ms-excel')
    helper.uploadFailure('application/vnd.ms-excel')
  })

  lab.experiment(`POST ${routePath}`, () => {
    // Perform general post tests
    helper.postSuccess({ payload: { 'air-dispersion-modelling': 'air-dispersion-modelling' } })
  })
})
