'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')

const TechnicalQualification = require('../../../../src/models/taskList/technicalQualification.model')

const GeneralTestHelper = require('../../generalTestHelper.test')
const UploadTestHelper = require('../uploadHelper')

let fakeAnnotationId = 'ANNOTATION_ID'

const routePath = '/technical-competence/technical-managers'
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

lab.experiment('Upload details for all technically competent managers tests:', () => {
  new GeneralTestHelper(lab, paths.routePath, paths.nextRoutePath).test({
    excludeCookiePostTests: true})

  const {uploadPath, removePath} = paths

  lab.experiment(`GET ${routePath}`, () => {
    const options = {
      descriptionId: 'technical-managers-description',
      pageHeading: 'Upload details for all technically competent managers',
      submitButton: 'Continue',
      fileTypes: ['PDF', 'JPG']
    }

    // Perform general get tests
    helper.getSuccess(options, [
      // Additional tests
      {
        title: 'displays expected static content',
        test: (doc) => GeneralTestHelper.checkElementsExist(doc, [
          'item-heading-1',
          'item-heading-2',
          'item-heading-3',
          'item-description-2',
          'item-description-3',
          'tcm-form-link',
          'tcm-form-link-text'
        ])
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
    helper.uploadInvalid({fileTypes: ['PDF', 'JPG']})
    helper.uploadFailure()
  })

  lab.experiment(`POST ${routePath}`, () => {
    // Perform general post tests
    helper.postSuccess({payload: {'technical-qualification': 'technical-managers'}})
  })
})
