'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const RecoveryService = require('../../src/services/recovery.service')
const Application = require('../../src/persistence/entities/application.entity')
const Location = require('../../src/persistence/entities/location.entity')
const LocationDetail = require('../../src/persistence/entities/locationDetail.entity')
const SiteNameAndLocation = require('../../src/models/taskList/siteNameAndLocation.task')
const { COOKIE_RESULT } = require('../../src/constants')

const routePath = '/site/grid-reference'
const nextRoutePath = '/site/address/postcode'

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Location.prototype, 'save').value(() => undefined)
  sandbox.stub(LocationDetail.prototype, 'save').value(() => undefined)
  sandbox.stub(Location, 'getByApplicationId').value(() => mocks.location)
  sandbox.stub(LocationDetail, 'getByLocationId').value(() => mocks.locationDetail)
  sandbox.stub(SiteNameAndLocation, 'updateCompleteness').value(() => {})
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

const checkPageElements = async (getRequest, expectedValue) => {
  const doc = await GeneralTestHelper.getDoc(getRequest)

  let element = doc.getElementById('page-heading').firstChild
  Code.expect(element.nodeValue).to.equal(`What is the grid reference for the site's main emissions point?`)

  // Test for the existence of expected static content
  GeneralTestHelper.checkElementsExist(doc, [
    'back-link',
    'defra-csrf-token',
    'site-grid-reference-label',
    'site-grid-reference-hint',
    'site-grid-reference-summary',
    'site-grid-reference-finder-link',
    'grid-reference-help-list'
  ])

  element = doc.getElementById('site-grid-reference')
  Code.expect(element.getAttribute('value')).to.equal(expectedValue)

  element = doc.getElementById('submit-button').firstChild
  Code.expect(element.nodeValue).to.equal('Continue')
}

lab.experiment('Site Grid Reference page tests:', () => {
  let getRequest

  new GeneralTestHelper({ lab, routePath }).test()

  lab.experiment('GET:', () => {
    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {}
      }
    })

    lab.test(`GET ${routePath} returns the Site grid reference page correctly when the grid reference has not been entered yet`, async () => {
      LocationDetail.getByLocationId = () => {
        return undefined
      }

      // Empty location details response
      Location.getByApplicationId = () => {
        return {}
      }

      await checkPageElements(getRequest, '')
    })

    lab.test(`GET ${routePath} returns the Site Grid Reference page correctly when there is an existing grid reference`, async () => {
      await checkPageElements(getRequest, mocks.locationDetail.gridReference)
    })
  })

  lab.experiment('POST:', () => {
    let postRequest

    const checkValidationError = async (expectedErrorMessage) => {
      const doc = await GeneralTestHelper.getDoc(postRequest)

      let element

      // Panel summary error item
      element = doc.getElementById('error-summary-list-item-0').firstChild
      Code.expect(element.nodeValue).to.equal(expectedErrorMessage)

      // Location grid reference field error
      Code.expect(doc.getElementById('site-grid-reference').getAttribute('class')).contains('form-control-error')
      element = doc.getElementById('site-grid-reference-error').firstChild.firstChild
      Code.expect(element.nodeValue).to.equal(expectedErrorMessage)
    }

    lab.experiment('Success:', () => {
      lab.beforeEach(() => {
        postRequest = {
          method: 'POST',
          url: routePath,
          headers: {},
          payload: {}
        }
      })

      lab.test(`POST ${routePath} shows an error message when the location grid reference is blank`, async () => {
        postRequest.payload['site-grid-reference'] = ''
        await checkValidationError('Enter a grid reference')
      })

      lab.test(`POST ${routePath} shows an error message when the location grid reference is whitespace`, async () => {
        postRequest.payload['site-grid-reference'] = '            '
        await checkValidationError('Enter a grid reference')
      })

      lab.test(`POST ${routePath} shows an error message when the location grid reference is in the wrong format`, async () => {
        const expectedErrorMessage = 'Make sure that the grid reference has 2 letters and 10 digits'

        // Wrong format
        postRequest.payload['site-grid-reference'] = 'AB123456789X'
        await checkValidationError(expectedErrorMessage)
        postRequest.payload['site-grid-reference'] = 'ab123456789X'
        await checkValidationError(expectedErrorMessage)
        postRequest.payload['site-grid-reference'] = 'ABX123456789'
        await checkValidationError(expectedErrorMessage)

        // Not enough characters
        postRequest.payload['site-grid-reference'] = 'AB123456789'
        await checkValidationError(expectedErrorMessage)

        // Too many characters
        postRequest.payload['site-grid-reference'] = 'AB12345678900'
        await checkValidationError(expectedErrorMessage)
      })
    })

    lab.experiment('Failure:', () => {
      lab.test(`POST ${routePath} accepts a grid reference that contains whitespace`, async () => {
        postRequest.payload['site-grid-reference'] = '      A       B   123  4 5 6 789         0      '

        // Empty location details response
        LocationDetail.getByLocationId = () => {
          return undefined
        }

        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.test(`POST ${routePath} success (new grid reference) redirects to the Site Postcode route`, async () => {
        postRequest.payload['site-grid-reference'] = mocks.locationDetail.gridReference

        // Empty location details response
        LocationDetail.getByLocationId = () => {
          return undefined
        }

        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.test(`POST ${routePath}  success (existing grid reference) redirects to the Site Postcode route`, async () => {
        postRequest.payload['site-grid-reference'] = mocks.locationDetail.gridReference

        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })
    })
  })
})
