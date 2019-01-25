'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

const UploadController = require('../../src/controllers/upload.controller')

lab.experiment('Upload Controller tests:', () => {
  lab.test('Should throw error when subject property is missing', () => {
    const route = {
      path: 'testPath'
    }

    const controller = new UploadController({ route })

    try {
      throw new Error(`Unexpected valid subject found in test "${controller.subject}"`)
    } catch (error) {
      Code.expect(error.message).to.equal('Invalid upload subject: "** subject is missing **"')
    }
  })

  lab.test('Should throw error when subject is not found in upload constants', () => {
    const route = {
      path: 'testPath',
      subject: 'INVALID_SUBJECT'
    }

    const controller = new UploadController({ route })

    try {
      throw new Error(`Unexpected valid subject found in test "${controller.subject}"`)
    } catch (error) {
      Code.expect(error.message).to.equal(`Invalid upload subject: "${route.subject}"`)
    }
  })

  lab.test('Should not throw when subject is found in upload constants', () => {
    const route = {
      path: 'testPath',
      subject: 'SITE_PLAN'
    }

    const controller = new UploadController({ route })
    const uploadSubject = controller.subject
    Code.expect(uploadSubject).to.equal('site plan')
  })
})
