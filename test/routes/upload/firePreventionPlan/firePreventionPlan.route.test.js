'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')

const Application = require('../../../../src/models/application.model')
const FirePreventionPlan = require('../../../../src/models/taskList/firePreventionPlan.model')

const GeneralTestHelper = require('../../generalTestHelper.test')
const UploadTestHelper = require('../uploadHelper')

let fakeAnnotationId = 'ANNOTATION_ID'

const routePath = '/fire-prevention-plan'
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

  sandbox.stub(FirePreventionPlan, 'updateCompleteness').value(() => Promise.resolve({}))

  helper.setStubs(sandbox)
})

lab.afterEach(() => {
  // Restore stubbed methods
  sandbox.restore()
})

lab.experiment('FirePrevention Upload FirePrevention plan tests:', () => {
  new GeneralTestHelper(lab, routePath).test(false, true, false)

  const {uploadPath, removePath} = paths

  lab.experiment(`GET ${routePath}`, () => {
    const options = {
      descriptionId: 'fire-prevention-plan-description',
      pageHeading: 'Upload the fire prevention plan',
      submitButton: 'Continue'
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
    helper.uploadSuccess()
    helper.uploadInvalid()
    helper.uploadFailure()
  })

  lab.experiment(`POST ${routePath}`, () => {
    // Perform general post tests
    helper.postSuccess({payload: {'fire-prevention-plan': 'fire-prevention-plan'}})
  })
})
