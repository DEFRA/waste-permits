'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')

const GeneralTestHelper = require('./generalTestHelper.test')
const UploadTestHelper = require('./uploadHelper')

let fakeAnnotationId = 'ANNOTATION_ID'

const routePath = '/technical-competence/upload-wamitab-qualification'
const paths = {
  routePath,
  uploadPath: `${routePath}/upload`,
  removePath: `${routePath}/remove/${fakeAnnotationId}`,
  nextRoutePath: '/technical-competence/technical-managers'
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

lab.experiment('Company Declare Upload Wamitab tests:', () => {
  const { routePath, nextRoutePath } = paths
  new GeneralTestHelper({ lab, routePath, nextRoutePath }).test({
    excludeCookiePostTests: true
  })

  const { uploadPath, removePath } = paths

  lab.experiment(`GET ${routePath}`, () => {
    const options = {
      descriptionId: 'wamitab-qualification-description',
      pageHeading: 'WAMITAB or EPOC: check what you need to upload',
      submitButton: 'Continue'
    }

    // Perform general get tests
    helper.getSuccess(options, [
      // Additional tests
      {
        title: 'displays expected static content',
        test: (doc) => GeneralTestHelper.checkElementsExist(doc, [
          'wamitab-qualification-operator-competence-link',
          'wamitab-qualification-operator-competence-link',
          'wamitab-qualification-operator-competence-link-abbr',
          'wamitab-qualification-operator-competence-abbr'])
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
    helper.postSuccess({ payload: { 'technical-qualification': 'WAMITAB-QUALIFICATION' } })
  })
})
