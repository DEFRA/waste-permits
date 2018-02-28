'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const Application = require('../../src/models/application.model')
const SiteNameAndLocation = require('../../src/models/taskList/siteNameAndLocation.model')
const {COOKIE_RESULT} = require('../../src/constants')

let validateCookieStub
let applicationGetByIdStub
let applicationIsSubmittedStub
let getSiteNameStub
let saveSiteNameStub

const routePath = '/site/site-name'
const nextRoutePath = '/site/grid-reference'

const getRequest = {
  method: 'GET',
  url: routePath,
  headers: {}
}
let postRequest

const siteName = 'THE_SITE_NAME'

const fakeApplication = {
  id: 'APPLICATION_ID',
  applicationName: 'APPLICATION_NAME'
}

lab.beforeEach(() => {
  postRequest = {
    method: 'POST',
    url: routePath,
    headers: {},
    payload: {}
  }

  // Stub methods
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = () => COOKIE_RESULT.VALID_COOKIE

  applicationGetByIdStub = Application.getById
  Application.getById = () => new Application(fakeApplication)

  applicationIsSubmittedStub = Application.prototype.isSubmitted
  Application.prototype.isSubmitted = () => false

  getSiteNameStub = SiteNameAndLocation.getSiteName
  SiteNameAndLocation.getSiteName = () => siteName

  saveSiteNameStub = SiteNameAndLocation.saveSiteName
  SiteNameAndLocation.saveSiteName = () => {}
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
  Application.getById = applicationGetByIdStub
  Application.prototype.isSubmitted = applicationIsSubmittedStub
  SiteNameAndLocation.getSiteName = getSiteNameStub
  SiteNameAndLocation.saveSiteName = saveSiteNameStub
})

const checkPageElements = async (request, expectedValue) => {
  const res = await server.inject(request)
  Code.expect(res.statusCode).to.equal(200)

  const parser = new DOMParser()
  const doc = parser.parseFromString(res.payload, 'text/html')

  let element = doc.getElementById('page-heading').firstChild
  Code.expect(element.nodeValue).to.equal(`What's the site name?`)

  const elementIds = [
    'back-link',
    'defra-csrf-token',
    'site-namesubheading',
    'site-name-label',
    'site-name-hint'
  ]
  for (let id of elementIds) {
    element = doc.getElementById(id)
    Code.expect(doc.getElementById(id)).to.exist()
  }

  element = doc.getElementById('site-name')
  Code.expect(element.getAttribute('value')).to.equal(expectedValue)

  element = doc.getElementById('submit-button').firstChild
  Code.expect(element.nodeValue).to.equal('Continue')
}

const checkValidationErrors = async (expectedErrors) => {
  const res = await server.inject(postRequest)
  Code.expect(res.statusCode).to.equal(200)

  const parser = new DOMParser()
  const doc = parser.parseFromString(res.payload, 'text/html')

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
  new GeneralTestHelper(lab, routePath).test(false, false, false)

  lab.experiment('GET:', () => {
    lab.test(`GET ${routePath} returns the site page correctly when it is a new application`, async () => {
      // Empty site name response
      SiteNameAndLocation.getSiteName = (request, authToken, applicationId, applicationLineId) => {
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
      lab.test(`POST ${routePath} (new Site) redirects to the Site Grid Reference route`, async () => {
        postRequest.payload['site-name'] = 'My Site'

      // Empty site name response
        SiteNameAndLocation.getSiteName = (request, authToken, applicationId, applicationLineId) => {
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
