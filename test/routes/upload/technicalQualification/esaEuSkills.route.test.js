'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
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
  new GeneralTestHelper(lab, paths.routePath, paths.nextRoutePath).test(false, true)

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
        title: 'displays correct course registration details',
        test: (doc) => {
          Code.expect(GeneralTestHelper.textContent(doc.getElementById('esa-eu-skills-description')))
            .to.equal('Upload a copy of the Competence Management System certificate. Check the certificate hasn\'t expired. They are valid for 3 years. If you’re getting a certificate, upload evidence of a contract with an accredited certification body. After 4 weeks you must have evidence of an agreed schedule for audit and certification and after 6 months evidence of a completed gap analysis audit. You must have a certified system within 12 months of starting operations at the site.')
        }
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
