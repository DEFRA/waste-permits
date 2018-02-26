'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const TechnicalQualification = require('../../../../src/models/taskList/technicalQualification.model')

const GeneralTestHelper = require('../../generalTestHelper.test')
const UploadTestHelper = require('../uploadHelper')

let fakeAnnotationId = 'ANNOTATION_ID'

const routePath = '/technical-qualification/upload-wamitab-qualification'
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

lab.experiment('Company Declare Upload Wamitab tests:', () => {
  new GeneralTestHelper(lab, paths.routePath, paths.nextRoutePath).test(false, true)

  const {uploadPath, removePath} = paths

  lab.experiment(`GET ${routePath}`, () => {
    const options = {
      descriptionId: 'wamitab-qualification-description',
      pageHeading: 'WAMITAB or EPOC: upload evidence',
      submitButton: 'Continue'
    }

    // Perform general get tests
    helper.getSuccess(options, [
      // Additional tests
      {
        title: 'displays expected static content',
        test: (doc) => {
          Code.expect(doc.getElementById('wamitab-qualification-description-paragraph-1')).to.exist()
          Code.expect(doc.getElementById('wamitab-qualification-description-paragraph-2')).to.exist()
          Code.expect(doc.getElementById('wamitab-qualification-description-paragraph-3')).to.exist()
          Code.expect(doc.getElementById('wamitab-qualification-operator-competence-link')).to.exist()
          Code.expect(doc.getElementById('wamitab-qualification-operator-competence-link').getAttribute('href')).to.equal('https://wamitab.org.uk/competence/operator-competence/')
          Code.expect(doc.getElementById('wamitab-qualification-operator-competence-link-abbr')).to.exist()
          Code.expect(doc.getElementById('wamitab-qualification-operator-competence-abbr')).to.exist()
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
    helper.postSuccess({payload: {'technical-qualification': 'WAMITAB-QUALIFICATION'}})
  })
})
