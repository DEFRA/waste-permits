'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const DOMParser = require('xmldom').DOMParser

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const Annotation = require('../../src/models/annotation.model')
const TechnicalQualification = require('../../src/models/taskList/technicalQualification.model')
const LoggingService = require('../../src/services/logging.service')

let validateCookieStub
let annotationSaveStub
let annotationDeleteStub
let getByIdStub
let listByApplicationIdStub
let logErrorStub
let fakeAnnotation
let fakeAnnotationId = 'ANNOTATION_ID'

const routePath = '/technical-qualification/upload-deemed-evidence'
const uploadPath = `${routePath}/upload`
const removePath = `${routePath}/remove/${fakeAnnotationId}`
const nextRoutePath = '/task-list'

lab.beforeEach(() => {
  fakeAnnotation = {
    id: fakeAnnotationId,
    subject: 'ANNOTATION_NAME',
    filename: 'ANNOTATION_FILENAME'
  }

  // Stub methods
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = () => true

  logErrorStub = LoggingService.logError
  LoggingService.logError = () => {}

  listByApplicationIdStub = Annotation.listByApplicationId
  Annotation.listByApplicationId = () => Promise.resolve([])
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
  LoggingService.logError = logErrorStub
  Annotation.listByApplicationId = listByApplicationIdStub
})

lab.experiment('Company Declare Upload Deemed evidence tests:', () => {
  lab.experiment(`GET ${routePath}`, () => {
    let doc
    let getRequest

    const getDoc = async () => {
      const res = await server.inject(getRequest)
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      doc = parser.parseFromString(res.payload, 'text/html')
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Upload evidence of their qualification')
      Code.expect(doc.getElementById('file-types').firstChild.nodeValue).to.equal('PDF or JPG')
      Code.expect(doc.getElementById('max-size').firstChild.nodeValue).to.equal('30MB')
      Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')
      return doc
    }

    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {}
      }
    })

    lab.test('should have a back link', async () => {
      const doc = await getDoc()
      const element = doc.getElementById('back-link')
      Code.expect(element).to.exist()
    })

    lab.experiment('success', () => {
      lab.test('when there are no annotations', async () => {
        doc = await getDoc()
        Code.expect(doc.getElementById('has-annotations')).to.not.exist()
        Code.expect(doc.getElementById('has-no-annotations')).to.exist()
        Code.expect(doc.getElementById('deemed-evidence-description')).to.exist()
        Code.expect(doc.getElementById('submit-button').getAttribute('disabled')).to.equal('disabled')
      })

      lab.test('when there are annotations', async () => {
        Annotation.listByApplicationId = () => Promise.resolve([new Annotation(fakeAnnotation)])
        doc = await getDoc()
        Code.expect(doc.getElementById('has-annotations')).to.exist()
        Code.expect(doc.getElementById('has-no-annotations')).to.not.exist()
        Code.expect(doc.getElementById('deemed-evidence-description')).to.not.exist()
        Code.expect(doc.getElementById('submit-button').getAttribute('disabled')).to.equal('')
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when the user token is invalid', async () => {
        CookieService.validateCookie = () => undefined

        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/error')
      })

      lab.test('redirects to error screen when failing to get the annotation ID', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        Annotation.listByApplicationId = () => Promise.reject(new Error('read failed'))

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/error')
      })
    })
  })

  lab.experiment(`GET ${removePath}`, () => {
    let removeRequest
    lab.beforeEach(() => {
      removeRequest = {
        method: 'GET',
        url: removePath,
        headers: {}
      }

      // Stub methods
      getByIdStub = Annotation.getById
      Annotation.getById = () => Promise.resolve(new Annotation(fakeAnnotation))

      annotationDeleteStub = Annotation.prototype.delete
      Annotation.prototype.delete = () => Promise.resolve({})
    })

    lab.afterEach(() => {
      // Restore stubbed methods
      Annotation.prototype.delete = annotationDeleteStub
      Annotation.getById = getByIdStub
    })

    lab.test('when annotation is removed', async () => {
      const res = await server.inject(removeRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(routePath)
    })
  })

  lab.experiment(`POST ${uploadPath}`, () => {
    const postRequest = ({filename = 'CIMG3456.JPG', fileSize = 2897308, contentType = 'image/jpeg'}) => ({
      method: 'POST',
      url: uploadPath,
      headers: {
        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryS4AeNzAzUP7OArMi'
      },
      payload: [
        '------WebKitFormBoundaryS4AeNzAzUP7OArMi',
        'Content-Disposition: form-data; name="filename"',
        '',
        filename,
        '------WebKitFormBoundaryS4AeNzAzUP7OArMi',
        'Content-Disposition: form-data; name="filesize"',
        '',
        fileSize,
        '------WebKitFormBoundaryS4AeNzAzUP7OArMi',
        `Content-Disposition: form-data; name="file"; filename="${filename}"`,
        `Content-Type: ${contentType}`,
        '',
        '',
        '------WebKitFormBoundaryS4AeNzAzUP7OArMi--'
      ].join('\r\n')
    })

    lab.beforeEach(() => {
      // Stub methods
      annotationSaveStub = Annotation.prototype.save
      Annotation.prototype.save = () => Promise.resolve({})
    })

    lab.afterEach(() => {
      // Restore stubbed methods
      Annotation.prototype.save = annotationSaveStub
    })

    lab.experiment('success', () => {
      lab.test('when annotation is saved', async () => {
        const req = postRequest({})
        const res = await server.inject(req)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(routePath)
      })
    })

    lab.experiment('invalid', () => {
      lab.test('when invalid content type', async () => {
        const expectedErrorMessage = 'You can only upload PDF or JPG files'
        const req = postRequest({contentType: 'application/octet-stream'})
        const res = await server.inject(req)
        Code.expect(res.statusCode).to.equal(200)

        const parser = new DOMParser()
        const doc = parser.parseFromString(res.payload, 'text/html')

        // Panel summary error item
        Code.expect(doc.getElementById('error-summary-list-item-0').firstChild.nodeValue).to.equal(expectedErrorMessage)

        // Company number field error
        Code.expect(doc.getElementById('file-error').firstChild.nodeValue).to.equal(expectedErrorMessage)
      })

      lab.test('when duplicate file', async () => {
        Annotation.listByApplicationId = () => Promise.resolve([new Annotation(fakeAnnotation)])
        const expectedErrorMessage = 'You cannot upload files with the same name as a file you have previously uploaded.'
        const req = postRequest({filename: fakeAnnotation.filename})
        const res = await server.inject(req)
        Code.expect(res.statusCode).to.equal(200)

        const parser = new DOMParser()
        const doc = parser.parseFromString(res.payload, 'text/html')

        // Panel summary error item
        Code.expect(doc.getElementById('error-summary-list-item-0').firstChild.nodeValue).to.equal(expectedErrorMessage)

        // Company number field error
        Code.expect(doc.getElementById('file-error').firstChild.nodeValue).to.equal(expectedErrorMessage)
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when the user token is invalid', async () => {
        CookieService.validateCookie = () => undefined
        const req = postRequest({})

        const res = await server.inject(req)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/error')
      })

      lab.test('redirects to error screen when save fails', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        Annotation.prototype.save = () => Promise.reject(new Error('save failed'))
        const req = postRequest({})

        const res = await server.inject(req)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/error')
      })
    })
  })

  lab.experiment(`POST ${routePath}`, () => {
    let postRequest
    let updateCompletenessStub

    lab.beforeEach(() => {
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: {
          'technical-qualification': 'deemed-evidence'
        }
      }

      // Stub methods
      updateCompletenessStub = TechnicalQualification.updateCompleteness
      TechnicalQualification.updateCompleteness = () => {}
    })

    lab.afterEach(() => {
      // Restore stubbed methods
      TechnicalQualification.updateCompleteness = updateCompletenessStub
    })

    lab.experiment('success', () => {
      lab.test(`when posted`, async () => {
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })
    })
  })
})
