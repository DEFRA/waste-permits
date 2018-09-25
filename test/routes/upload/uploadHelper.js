'use strict'

const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('../generalTestHelper.test')

const fs = require('fs')
const Annotation = require('../../../src/models/annotation.model')
const Application = require('../../../src/models/application.model')
const CookieService = require('../../../src/services/cookie.service')
const LoggingService = require('../../../src/services/logging.service')
const UploadService = require('../../../src/services/upload.service')
const ClamWrapper = require('../../../src/utilities/clamWrapper')
const { COOKIE_RESULT } = require('../../../src/constants')

const defaultFileTypes = 'PDF,DOC,DOCX,XLS,XLSX,JPG,ODT,ODS'

const server = require('../../../server')

const getDoc = async ({ pageHeading, submitButton }) => {
  const doc = await GeneralTestHelper.getDoc(getRequest)
  Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal(pageHeading)
  Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal(submitButton)
  return doc
}

const checkExpectedErrors = (doc, expectedErrorMessage) => {
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

const fakeApplication = {
  id: 'APPLICATION/ID', // Include a slash to prove creation and deletion of directories will work ok
  applicationNumber: 'APPLICATION_NUMBER'
}

module.exports = class UploadTestHelper {
  constructor (lab, { routePath, uploadPath, removePath, nextRoutePath }) {
    this.lab = lab
    this.routePath = routePath
    this.uploadPath = uploadPath
    this.removePath = removePath
    this.nextRoutePath = nextRoutePath
    this.errorPath = '/errors/technical-problem'
  }

  setStubs (sandbox) {
    sandbox.stub(fs, 'mkdirSync').value(() => {})
    sandbox.stub(fs, 'existsSync').value(() => false)
    sandbox.stub(fs, 'createWriteStream').value(() => mockStream())
    sandbox.stub(fs, 'createReadStream').value(() => mockStream())
    sandbox.stub(Annotation, 'listByApplicationIdAndSubject').value(() => Promise.resolve([]))
    sandbox.stub(Annotation, 'getById').value(() => Promise.resolve(new Annotation(fakeAnnotation)))
    sandbox.stub(Annotation, 'getByApplicationIdSubjectAndFilename').value(() => Promise.resolve(new Annotation(fakeAnnotation)))
    sandbox.stub(Annotation.prototype, 'delete').value(() => Promise.resolve({}))
    sandbox.stub(Annotation.prototype, 'save').value(() => Promise.resolve({}))
    sandbox.stub(Application, 'getById').value(() => Promise.resolve({ applicationNumber: 'APPLICATION_REFERENCE' }))
    sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
    sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
    sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
    sandbox.stub(ClamWrapper, 'isInfected').value(() => Promise.resolve({ isInfected: false }))
    sandbox.stub(LoggingService, 'logError').value(() => {})
  }

  getSuccess (options = {}, additionalTests = []) {
    const { lab, routePath } = this
    options = Object.assign({}, { fileTypes: defaultFileTypes.split(',') }, options)
    const lastFileType = options.fileTypes.pop()
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
        Code.expect(doc.getElementById('file-types').firstChild.nodeValue).to.equal(`${options.fileTypes.join(', ')} or ${lastFileType}`)
        Code.expect(doc.getElementById('max-size').firstChild.nodeValue).to.equal('30MB')
        Code.expect(doc.getElementById('has-annotations')).to.not.exist()
        if (options.descriptionId) {
          Code.expect(doc.getElementById('has-no-annotations')).to.exist()
          Code.expect(doc.getElementById(options.descriptionId)).to.exist()
        }
      })

      lab.test('when there are annotations', async () => {
        Annotation.listByApplicationIdAndSubject = () => Promise.resolve([new Annotation(fakeAnnotation)])
        const doc = await getDoc(options)
        Code.expect(doc.getElementById('file-types').firstChild.nodeValue).to.equal(`${options.fileTypes.join(', ')} or ${lastFileType}`)
        Code.expect(doc.getElementById('max-size').firstChild.nodeValue).to.equal('30MB')
        Code.expect(doc.getElementById('has-annotations')).to.exist()
        Code.expect(doc.getElementById('has-no-annotations')).to.not.exist()
        Code.expect(doc.getElementById(options.descriptionId)).to.not.exist()
      })

      additionalTests.forEach(({ title, stubs, test }) => lab.test(title, async () => {
        if (stubs) {
          stubs()
        }
        const doc = await getDoc(options)
        test(doc)
      }))
    })
  }

  getFailure () {
    const { lab } = this
    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to get the annotation ID', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        Annotation.listByApplicationIdAndSubject = () => Promise.reject(new Error('read failed'))

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(this.errorPath)
        spy.restore()
      })
    })
  }

  _removeRequest () {
    const { removePath } = this
    return {
      method: 'GET',
      url: removePath,
      headers: {}
    }
  }

  removeSuccess () {
    const { lab, routePath, removePath } = this
    lab.experiment('success', () => {
      lab.test('when annotation is removed', async () => {
        const req = this._removeRequest(removePath)
        const res = await server.inject(req)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(routePath)
      })
    })
  }

  _uploadRequest ({ filename = 'CIMG3456.JPG', fileSize = 2897308, contentType = 'image/jpeg', isUpload = 'on' }) {
    const { uploadPath } = this
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

  uploadSuccess (contentType = 'image/jpeg') {
    const { lab, routePath } = this
    lab.experiment('success', () => {
      lab.test('when annotation is saved', async () => {
        const req = this._uploadRequest({ contentType })
        const res = await server.inject(req)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(routePath)
      })

      lab.experiment('when building an upload dir name', () => {
        lab.test('when application name has a forward slash in it, replace with underscore', async () => {
          Code.expect(UploadService._buildUploadDir('application/name/dir')).to.equal('application_name_dir')
        })
        lab.test('when application name has a backward slash in it, replace with underscore', async () => {
          Code.expect(UploadService._buildUploadDir('application\\name/dir')).to.equal('application_name_dir')
        })
        lab.test('when application name has no slash in it, should be the same', async () => {
          Code.expect(UploadService._buildUploadDir('application_name')).to.equal('application_name')
        })
      })
    })
  }

  uploadInvalid (options = {}, contentType = 'image/jpeg') {
    const { lab } = this
    options = Object.assign({}, { fileTypes: defaultFileTypes.split(',') }, options)
    const lastFileType = options.fileTypes.pop()
    lab.experiment('invalid', () => {
      lab.test('when invalid content type', async () => {
        const req = this._uploadRequest({ contentType: 'application/octet-stream' })
        const doc = await GeneralTestHelper.getDoc(req)
        checkExpectedErrors(doc, `You can only upload ${options.fileTypes.join(', ')} or ${lastFileType} files`)
      })

      lab.test('when duplicate file', async () => {
        Annotation.listByApplicationIdAndSubject = () => Promise.resolve([new Annotation(fakeAnnotation)])
        const req = this._uploadRequest({ filename: fakeAnnotation.filename, contentType })
        const doc = await GeneralTestHelper.getDoc(req)
        checkExpectedErrors(doc, 'That file has the same name as one you have already uploaded. Choose another file or rename the file before uploading it again.')
      })

      lab.test('when the filename is too long', async () => {
        Annotation.listByApplicationIdAndSubject = () => Promise.resolve([new Annotation(fakeAnnotation)])
        const req = this._uploadRequest({ filename: `${'a'.repeat(252)}.jpg`, contentType })
        const doc = await GeneralTestHelper.getDoc(req)
        checkExpectedErrors(doc, `That file’s name is greater than 255 characters - please rename the file with a shorter name before uploading it again.`)
      })

      lab.test('when the file has a virus', async () => {
        ClamWrapper.isInfected = () => Promise.resolve({ isInfected: true })
        const req = this._uploadRequest({ filename: `virus.pdf`, contentType })
        const doc = await GeneralTestHelper.getDoc(req)
        checkExpectedErrors(doc, `Our scanner detected a virus in that file. It has not been uploaded. Please use your own virus scanner to check and clean the file. You should either upload a clean copy of the file or contact us if you think that the file does not have a virus.`)
      })
    })
  }

  uploadFailure (contentType = 'image/jpeg') {
    const { lab, errorPath } = this
    lab.experiment('failure', () => {
      lab.test('redirects to error screen when save fails', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        Annotation.prototype.save = () => Promise.reject(new Error('save failed'))
        const req = this._uploadRequest({ contentType })
        const res = await server.inject(req)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
        spy.restore()
      })
    })
  }

  _postRequest ({ payload }) {
    const { uploadPath } = this
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
    const { lab, nextRoutePath } = this
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
