'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const Application = require('../../src/persistence/entities/application.entity')
const CharityDetail = require('../../src/models/charityDetail.model')
const LoggingService = require('../../src/services/logging.service')
const { COOKIE_RESULT } = require('../../src/constants')

let fakeApplication

const routePath = '/technical-competence'
const nextRoutePath = {
  WAMITAB_QUALIFICATION: '/technical-competence/upload-wamitab-qualification',
  REGISTERED_ON_A_COURSE: '/technical-competence/upload-course-registration',
  DEEMED_COMPETENCE: '/technical-competence/upload-deemed-evidence',
  ESA_EU_SKILLS: '/technical-competence/upload-esa-eu-skills'
}
const errorPath = '/errors/technical-problem'

const Qualification = {
  WAMITAB_QUALIFICATION: {
    TYPE: 910400000
  },
  REGISTERED_ON_A_COURSE: {
    TYPE: 910400001
  },
  DEEMED_COMPETENCE: {
    TYPE: 910400002
  },
  ESA_EU_SKILLS: {
    TYPE: 910400003
  }
}

let sandbox

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID',
    applicationLineId: 'APPLICATION_LINE_ID'
  }

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()
  // Stub the asynchronous model methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(CharityDetail, 'get').value(() => new CharityDetail({}))
  sandbox.stub(Application.prototype, 'save').value(() => {})
  sandbox.stub(Application, 'getById').value(() => Promise.resolve(new Application(fakeApplication)))
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Technical Management Qualification tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test()

  lab.experiment(`GET ${routePath}`, () => {
    let doc
    let getRequest

    const checkCommonElements = async (doc) => {
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('What evidence of technical competence do you have?')
      Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')
      Code.expect(doc.getElementById('form').getAttribute('action')).to.equal(routePath)

      // Test for the existence of expected static content
      GeneralTestHelper.checkElementsExist(doc, [
        'page-description-paragagraph-1',
        'page-description-paragagraph-2',
        'page-description-paragagraph-2-abbr-1',
        'page-description-paragagraph-2-abbr-2',
        'page-description-paragagraph-2-abbr-3',
        'wamitab-label',
        'wamitab-label-abbr-1',
        'wamitab-label-abbr-2',
        'getting-qualification-label',
        'getting-qualification-label-abbr-1',
        'getting-qualification-label-abbr-2',
        'deemed-label',
        'deemed-label-abbr',
        'esa-eu-label',
        'esa-eu-label-abbr'])

      // Test dynamic html contents
      Code.expect(doc.getElementById('wamitab').getAttribute('value')).to.equal(`${Qualification.WAMITAB_QUALIFICATION.TYPE}`)
      Code.expect(doc.getElementById('getting-qualification').getAttribute('value')).to.equal(`${Qualification.REGISTERED_ON_A_COURSE.TYPE}`)
      Code.expect(doc.getElementById('deemed').getAttribute('value')).to.equal(`${Qualification.DEEMED_COMPETENCE.TYPE}`)
      Code.expect(doc.getElementById('esa-eu').getAttribute('value')).to.equal(`${Qualification.ESA_EU_SKILLS.TYPE}`)

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
      const doc = await GeneralTestHelper.getDoc(getRequest)
      const element = doc.getElementById('back-link')
      Code.expect(element).to.exist()
    })

    lab.experiment('success', () => {
      lab.test('when no qualification has been selected', async () => {
        doc = await GeneralTestHelper.getDoc(getRequest)
        checkCommonElements(doc)
        Code.expect(doc.getElementById('wamitab').getAttribute('checked')).to.not.equal('checked')
        Code.expect(doc.getElementById('getting-qualification').getAttribute('checked')).to.not.equal('checked')
        Code.expect(doc.getElementById('deemed').getAttribute('checked')).to.not.equal('checked')
        Code.expect(doc.getElementById('esa-eu').getAttribute('checked')).to.not.equal('checked')
      })

      lab.test('when wamitab has been selected', async () => {
        fakeApplication.technicalQualification = Qualification.WAMITAB_QUALIFICATION.TYPE
        doc = await GeneralTestHelper.getDoc(getRequest)
        checkCommonElements(doc)
        Code.expect(doc.getElementById('wamitab').getAttribute('checked')).to.equal('checked')
      })

      lab.test('when getting-qualification has been selected', async () => {
        fakeApplication.technicalQualification = Qualification.REGISTERED_ON_A_COURSE.TYPE
        doc = await GeneralTestHelper.getDoc(getRequest)
        checkCommonElements(doc)
        Code.expect(doc.getElementById('getting-qualification').getAttribute('checked')).to.equal('checked')
      })

      lab.test('when deemed has been selected', async () => {
        fakeApplication.technicalQualification = Qualification.DEEMED_COMPETENCE.TYPE
        doc = await GeneralTestHelper.getDoc(getRequest)
        checkCommonElements(doc)
        Code.expect(doc.getElementById('deemed').getAttribute('checked')).to.equal('checked')
      })

      lab.test('when esa-eu has been selected', async () => {
        fakeApplication.technicalQualification = Qualification.ESA_EU_SKILLS.TYPE
        doc = await GeneralTestHelper.getDoc(getRequest)
        checkCommonElements(doc)
        Code.expect(doc.getElementById('esa-eu').getAttribute('checked')).to.equal('checked')
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to get the application ID', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        Application.getById = () => {
          throw new Error('read failed')
        }

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })
  })

  lab.experiment(`POST ${routePath}`, () => {
    let postRequest

    lab.beforeEach(() => {
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: {
          'technical-qualification': Qualification.WAMITAB_QUALIFICATION.TYPE
        }
      }
    })

    lab.experiment('success', () => {
      Object.keys(Qualification).forEach((type) => lab.test(`when application is saved with a "${type}" qualification`, async () => {
        postRequest.payload['technical-qualification'] = Qualification[type].TYPE
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath[type])
      }))
    })

    lab.experiment('invalid', () => {
      const checkValidationMessage = async (fieldId, expectedErrorMessage) => {
        const doc = await GeneralTestHelper.getDoc(postRequest)
        // Panel summary error item
        Code.expect(doc.getElementById('error-summary-list-item-0').firstChild.nodeValue).to.equal(expectedErrorMessage)

        // Relevant industry scheme field error
        Code.expect(doc.getElementById(`${fieldId}-error`).firstChild.firstChild.nodeValue).to.equal(expectedErrorMessage)
      }

      lab.test('when qualification not selected', async () => {
        postRequest.payload = {}
        await checkValidationMessage('technical-qualification', 'Select a qualification')
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to get the application', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        Application.getById = () => Promise.reject(new Error('read failed'))

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })

      lab.test('redirects to error screen when save fails', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        Application.prototype.save = () => Promise.reject(new Error('save failed'))

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })

      lab.test('redirects to error screen when an unexpected qualification is selected', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        postRequest.payload['technical-qualification'] = '99999999'

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })
  })
})
