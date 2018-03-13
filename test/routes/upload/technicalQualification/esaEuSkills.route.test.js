'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')

const TechnicalQualification = require('../../../../src/models/taskList/technicalQualification.model')

const GeneralTestHelper = require('../../generalTestHelper.test')
const UploadTestHelper = require('../uploadHelper')

let fakeAnnotationId = 'ANNOTATION_ID'

const routePath = '/technical-qualification/upload-esa-eu-skills'
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

lab.experiment('Company Declare Upload ESA EU skills tests:', () => {
  new GeneralTestHelper(lab, paths.routePath, paths.nextRoutePath).test({
    excludeCookiePostTests: true})

  const {uploadPath, removePath} = paths

  lab.experiment(`GET ${routePath}`, () => {
    const options = {
      descriptionId: 'esa-eu-skills-description',
      pageHeading: 'Energy & Utility Skills / ESA: upload evidence',
      submitButton: 'Continue'
    }

    // Perform general get tests
    helper.getSuccess(options, [
      // Additional tests
      {
        title: 'displays expected static content',
        test: (doc) => GeneralTestHelper.checkElementsExist(doc, [
          'esa-eu-skills-description-span-1',
          'esa-eu-skills-description-paragraph-1',
          'esa-eu-skills-description-span-2',
          'esa-eu-skills-description-paragraph-2'])
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
    helper.postSuccess({payload: {'technical-qualification': 'esa-eu-skills'}})
  })
})
