'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')

const GeneralTestHelper = require('../generalTestHelper.test')
const UploadTestHelper = require('../uploadHelper')

const fakeAnnotationId = 'ANNOTATION_ID'

const routePath = '/clinical-waste-documents/justification/upload'
const paths = {
  routePath,
  uploadPath: `${routePath}/upload`,
  removePath: `${routePath}/remove/${fakeAnnotationId}`,
  nextRoutePath: '/task-list' // TODO: Change this to next screen
}

const helper = new UploadTestHelper(lab, paths)

let sandbox

lab.beforeEach(() => {
  // Stub methods
  sandbox = sinon.createSandbox()

  helper.setStubs(sandbox)
})

lab.afterEach(() => {
  // Restore stubbed methods
  sandbox.restore()
})

lab.experiment('Store or Treat upload tests:', () => {
  const { routePath, nextRoutePath } = paths
  new GeneralTestHelper({ lab, routePath, nextRoutePath }).test({
    excludeCookiePostTests: true
  })

  const { uploadPath, removePath } = paths

  lab.experiment(`GET ${routePath}`, () => {
    const options = {
      descriptionId: 'store-treat-description',
      pageHeading: 'Will you store or treat a waste type not included in Section 2.1?',
      submitButton: 'Continue',
      fileTypes: ['PDF', 'DOC', 'DOCX', 'ODT']
    }

    // Perform general get tests
    helper.getSuccess(options, [
      // Additional tests
      {
        title: 'displays expected static content',
        test: (doc) => GeneralTestHelper.checkElementsExist(doc, [
          'clinical-waste-additional-guidance-link'])
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
    helper.uploadSuccess('application/msword', 'test.docx')
    helper.uploadInvalid({ fileTypes: ['PDF', 'DOC', 'DOCX', 'ODT'] }, 'application/msword', 'test.docx')
    helper.uploadSuccess('application/msword', 'test.docx')
  })

  lab.experiment(`POST ${routePath}`, () => {
    // Perform general post tests
    helper.postSuccess({ payload: { 'clinical-waste-justification': 'clinical-waste-justification' } })
  })
})
