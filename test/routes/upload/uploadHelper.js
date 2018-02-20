'use strict'

const Code = require('code')
const sinon = require('sinon')
const DOMParser = require('xmldom').DOMParser

const fs = require('fs')
const Annotation = require('../../../src/models/annotation.model')
const Application = require('../../../src/models/application.model')
const CookieService = require('../../../src/services/cookie.service')
const LoggingService = require('../../../src/services/logging.service')
const {COOKIE_RESULT} = require('../../../src/constants')

const server = require('../../../server')

const getDoc = async ({pageHeading, submitButton}) => {
  const res = await server.inject(getRequest)
  Code.expect(res.statusCode).to.equal(200)

  const parser = new DOMParser()
  const doc = parser.parseFromString(res.payload, 'text/html')
  Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal(pageHeading)
  Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal(submitButton)
  return doc
}

const checkExpectedErrors = (res, expectedErrorMessage) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(res.payload, 'text/html')

  // Panel summary error item
  Code.expect(doc.getElementById('error-summary-list-item-0').firstChild.nodeValue).to.equal(expectedErrorMessage)

  // Company number field error
  Code.expect(doc.getElementById('file-error').firstChild.firstChild.nodeValue).to.equal(expectedErrorMessage)
}

const mockStream = () => ({
  on: (event, fn) => {
    if (['finish', 'end'].includes(event)) {
      fn()
    }
  }
})

let fakeAnnotation
let getRequest
let fakeAnnotationId = 'ANNOTATION_ID'

module.exports = class UploadTestHelper {
  constructor (lab, {routePath, uploadPath, removePath, nextRoutePath}) {
    this.lab = lab
    this.routePath = routePath
    this.uploadPath = uploadPath
    this.removePath = removePath
    this.nextRoutePath = nextRoutePath
  }

  setStubs (sandbox) {
    sandbox.stub(fs, 'mkdirSync').value(() => {})
    sandbox.stub(fs, 'existsSync').value(() => false)
    sandbox.stub(fs, 'createWriteStream').value(() => mockStream())
    sandbox.stub(fs, 'createReadStream').value(() => mockStream())
    sandbox.stub(Annotation, 'listByApplicationIdAndSubject').value(() => Promise.resolve([]))
    sandbox.stub(Annotation, 'getById').value(() => Promise.resolve(new Annotation(fakeAnnotation)))
    sandbox.stub(Annotation.prototype, 'delete').value(() => Promise.resolve({}))
    sandbox.stub(Annotation.prototype, 'save').value(() => Promise.resolve({}))
    sandbox.stub(Application, 'getById').value(() => Promise.resolve({name: 'APPLICATION_REFERENCE'}))
    sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
    sandbox.stub(LoggingService, 'logError').value(() => {})
  }

  getSuccess (options) {
    const {lab, routePath} = this
    lab.experiment('success', () => {
      lab.beforeEach(() => {
        fakeAnnotation = {
          id: fakeAnnotationId,
          subject: 'ANNOTATION_NAME',
          filename: 'ANNOTATION_FILENAME'
        }
        getRequest = {
          method: 'GET',
          url: routePath,
          headers: {}
        }
      })

      lab.test('should have a back link', async () => {
        const doc = await getDoc(options)
        const element = doc.getElementById('back-link')
        Code.expect(element).to.exist()
      })

      lab.test('when there are no annotations', async () => {
        const doc = await getDoc(options)
        Code.expect(doc.getElementById('file-types').firstChild.nodeValue).to.equal('PDF or JPG')
        Code.expect(doc.getElementById('max-size').firstChild.nodeValue).to.equal('30MB')
        Code.expect(doc.getElementById('has-annotations')).to.not.exist()
        Code.expect(doc.getElementById('has-no-annotations')).to.exist()
        Code.expect(doc.getElementById(options.descriptionId)).to.exist()
      })

      lab.test('when there are annotations', async () => {
        Annotation.listByApplicationIdAndSubject = () => Promise.resolve([new Annotation(fakeAnnotation)])
        const doc = await getDoc(options)
        Code.expect(doc.getElementById('file-types')).to.not.exist()
        Code.expect(doc.getElementById('max-size')).to.not.exist()
        Code.expect(doc.getElementById('has-annotations')).to.exist()
        Code.expect(doc.getElementById('has-no-annotations')).to.not.exist()
        Code.expect(doc.getElementById(options.descriptionId)).to.not.exist()
      })
    })
  }

  getFailure () {
    const {lab} = this
    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to get the annotation ID', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        Annotation.listByApplicationIdAndSubject = () => Promise.reject(new Error('read failed'))

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/error')
      })
    })
  }

  _removeRequest () {
    const {removePath} = this
    return {
      method: 'GET',
      url: removePath,
      headers: {}
    }
  }

  removeSuccess () {
    const {lab, routePath, removePath} = this
    lab.experiment('success', () => {
      lab.test('when annotation is removed', async () => {
        const req = this._removeRequest(removePath)
        const res = await server.inject(req)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(routePath)
      })
    })
  }

  _uploadRequest ({filename = 'CIMG3456.JPG', fileSize = 2897308, contentType = 'image/jpeg', isUpload = 'on'}) {
    const {uploadPath} = this
    return {
      method: 'POST',
      url: uploadPath,
      headers: {
        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryS4AeNzAzUP7OArMi'
      },
      payload: [
        '------WebKitFormBoundaryS4AeNzAzUP7OArMi',
        'Content-Disposition: form-data; name="is-upload-file"',
        '',
        isUpload,
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
    }
  }

  uploadSuccess () {
    const {lab, routePath} = this
    lab.experiment('success', () => {
      lab.test('when annotation is saved', async () => {
        const req = this._uploadRequest({})
        const res = await server.inject(req)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(routePath)
      })
    })
  }

  uploadInvalid () {
    const {lab} = this
    lab.experiment('invalid', () => {
      lab.test('when invalid content type', async () => {
        const req = this._uploadRequest({contentType: 'application/octet-stream'})
        const res = await server.inject(req)
        Code.expect(res.statusCode).to.equal(200)
        checkExpectedErrors(res, 'You can only upload PDF or JPG files')
      })

      lab.test('when duplicate file', async () => {
        Annotation.listByApplicationIdAndSubject = () => Promise.resolve([new Annotation(fakeAnnotation)])
        const req = this._uploadRequest({filename: fakeAnnotation.filename})
        const res = await server.inject(req)
        Code.expect(res.statusCode).to.equal(200)
        checkExpectedErrors(res, 'That file has the same name as one you’ve already uploaded. Choose another file or rename the file before uploading it again.')
      })
    })
  }

  uploadFailure () {
    const {lab} = this
    lab.experiment('failure', () => {
      lab.test('redirects to error screen when save fails', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        Annotation.prototype.save = () => Promise.reject(new Error('save failed'))
        const req = this._uploadRequest({})
        const res = await server.inject(req)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/error')
      })
    })
  }

  _postRequest ({payload}) {
    const {uploadPath} = this
    let data = []
    Object.keys(payload).forEach((prop) => {
      data = data.concat([
        '------WebKitFormBoundaryS4AeNzAzUP7OArMi',
        `Content-Disposition: form-data; name="${prop}"`,
        '',
        payload[prop]
      ])
    })
    data = data.concat([
      '',
      '------WebKitFormBoundaryS4AeNzAzUP7OArMi--'
    ])
    return {
      method: 'POST',
      url: uploadPath,
      headers: {
        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryS4AeNzAzUP7OArMi'
      },
      payload: data.join('\r\n')
    }
  }

  postSuccess (options) {
    const {lab, nextRoutePath} = this
    lab.experiment('success', () => {
      lab.test(`when continue button pressed and there are files uploaded`, async () => {
        Annotation.listByApplicationIdAndSubject = () => Promise.resolve([new Annotation(fakeAnnotation)])
        const req = this._postRequest(options)
        const res = await server.inject(req)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })
    })
  }
}
