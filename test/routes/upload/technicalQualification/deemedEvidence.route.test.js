'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')

const Application = require('../../../../src/models/application.model')
const TechnicalQualification = require('../../../../src/models/taskList/technicalQualification.model')

const GeneralTestHelper = require('../../generalTestHelper.test')
const UploadTestHelper = require('../uploadHelper')

let fakeAnnotationId = 'ANNOTATION_ID'

const routePath = '/technical-qualification/upload-deemed-evidence'
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

  helper.setStubs(sandbox)
})

lab.afterEach(() => {
  // Restore stubbed methods
  sandbox.restore()
})

lab.experiment('Company Declare Upload Deemed evidence tests:', () => {
  new GeneralTestHelper(lab, paths.routePath, paths.nextRoutePath).test(false, true, false)

  const {uploadPath, removePath} = paths

  lab.experiment(`GET ${routePath}`, () => {
    const options = {
      descriptionId: 'deemed-evidence-description',
      pageHeading: 'Deemed competence or an assessment: upload evidence',
      submitButton: 'Continue'
    }

    // Perform general get tests
    helper.getSuccess(options, [
      // Additional tests
      {
        title: 'displays expected static content',
        test: (doc) => GeneralTestHelper.checkElementsExist(doc, [
          'deemed-evidence-description-list-heading',
          'deemed-evidence-description-list',
          'deemed-evidence-description-list-item-1',
          'deemed-evidence-description-list-item-2',
          'deemed-evidence-description-list-item-3',
          'deemed-evidence-description-important-info',
          'deemed-evidence-description-important-info-abbr',
          'deemed-evidence-description-last-paragraph'])
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
    helper.postSuccess({payload: {'technical-qualification': 'deemed-evidence'}})
  })
})
