'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const Application = require('../../src/persistence/entities/application.entity')
const SiteNameAndLocation = require('../../src/models/taskList/siteNameAndLocation.task')
const RecoveryService = require('../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../src/constants')

const routePath = '/site/site-name'
const nextRoutePath = '/site/grid-reference'

let sandbox
let getRequest
let postRequest
let mocks

const siteName = 'THE_SITE_NAME'

lab.beforeEach(() => {
  mocks = new Mocks()

  getRequest = {
    method: 'GET',
    url: routePath,
    headers: {}
  }

  postRequest = {
    method: 'POST',
    url: routePath,
    headers: {},
    payload: {}
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(SiteNameAndLocation, 'getSiteName').value(() => siteName)
  sandbox.stub(SiteNameAndLocation, 'saveSiteName').value(() => {})
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

const checkPageElements = async (request, expectedValue) => {
  const doc = await GeneralTestHelper.getDoc(request)

  let element = doc.getElementById('page-heading').firstChild
  Code.expect(element.nodeValue).to.equal(`What is the site name?`)

  // Test for the existence of expected static content
  GeneralTestHelper.checkElementsExist(doc, [
    'back-link',
    'defra-csrf-token',
    'site-namesubheading',
    'site-name-label',
    'site-name-hint'
  ])

  element = doc.getElementById('site-name')
  Code.expect(element.getAttribute('value')).to.equal(expectedValue)

  element = doc.getElementById('submit-button').firstChild
  Code.expect(element.nodeValue).to.equal('Continue')
}

const checkValidationErrors = async (expectedErrors) => {
  const doc = await GeneralTestHelper.getDoc(postRequest)

  let element

  for (let i = 0; i < expectedErrors.length; i++) {
    // Panel summary error item
    element = doc.getElementById(`error-summary-list-item-${i}`).firstChild
    Code.expect(element.nodeValue).to.equal(expectedErrors[i])

    // Field error
    Code.expect(doc.getElementById('site-name').getAttribute('class')).contains('form-control-error')
    element = doc.getElementById('site-name-error').childNodes[i].firstChild
    Code.expect(element.nodeValue).to.equal(expectedErrors[i])
  }
}

lab.experiment('Site Name page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test()

  lab.experiment('GET:', () => {
    lab.test(`GET ${routePath} returns the site page correctly when it is a new application`, async () => {
      // Empty site name response
      SiteNameAndLocation.getSiteName = () => {
        return undefined
      }
      checkPageElements(getRequest, '')
    })

    lab.test(`GET ${routePath} returns the site page correctly when there is an existing Site name`, async () => {
      checkPageElements(getRequest, siteName)
    })
  })

  lab.experiment('POST:', () => {
    lab.experiment('Success:', () => {
      lab.test(`POST ${routePath} (new Site) redirects to the next route ${nextRoutePath}`, async () => {
        postRequest.payload['site-name'] = 'My Site'

        // Empty site name response
        SiteNameAndLocation.getSiteName = () => {
          return undefined
        }

        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.test(`POST ${routePath} (existing Site) redirects to the next route ${nextRoutePath}`, async () => {
        postRequest.payload['site-name'] = 'My Site'
        const res = await server.inject(postRequest)

        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })
    })

    lab.experiment('Failure:', () => {
      lab.test(`POST ${routePath} shows an error message when the site name is blank`, async () => {
        postRequest.payload['site-name'] = ''
        await checkValidationErrors(['Enter the site name'])
      })

      lab.test(`POST ${routePath} shows an error message when the site name contains invalid characters`, async () => {
        postRequest.payload['site-name'] = '___INVALID_SITE_NAME___'
        await checkValidationErrors(['The site name cannot contain any of these characters: ^ | _ ~ ¬ `'])
      })

      lab.test(`POST ${routePath} shows an error message when the site name is too long`, async () => {
        postRequest.payload['site-name'] = '01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789X'
        await checkValidationErrors(['Enter a shorter site name with no more than 170 characters'])
      })

      lab.test(`POST ${routePath} shows multiple error messages on the sanme field`, async () => {
        postRequest.payload['site-name'] = '_01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789X'
        const expectedErrors = [
          'Enter a shorter site name with no more than 170 characters',
          'The site name cannot contain any of these characters: ^ | _ ~ ¬ `'
        ]
        await checkValidationErrors(expectedErrors)
      })
    })
  })
})
