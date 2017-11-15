'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const CompanyLookupService = require('../../src/services/companyLookup.service')
// const Location = require('../../src/models/location.model')


let validateCookieStub
let companyLookupGetCompanyNameStub

const routePath = '/permit-holder/company/check-name'
const getRequest = {
  method: 'GET',
  url: routePath,
  headers: {}
}
let postRequest

const fakeCompanyDetails = {
  companyNumber: '012345678',
  companyName: 'THE COMPANY NAME',
  tradingName: 'THE TRADING NAME'
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
  CookieService.validateCookie = (request) => {
    return true
  }

  companyLookupGetCompanyNameStub = CompanyLookupService.getCompanyName
  CompanyLookupService.getCompanyName = (companyNumber) => {
    return fakeCompanyDetails.companyName
  }
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
  CompanyLookupService.getCompanyName = companyLookupGetCompanyNameStub
})

const checkPageElements = async (request, companyFound) => {
  const res = await server.inject(request)
  Code.expect(res.statusCode).to.equal(200)

  const parser = new DOMParser()
  const doc = parser.parseFromString(res.payload, 'text/html')

  let element

  if (companyFound) {
    element = doc.getElementById('page-heading').firstChild
    Code.expect(element.nodeValue).to.equal(`Is this the right company?`)

    const elementIds = [
      'back-link',
      'defra-csrf-token',
      'company-number-label',
      'enter-different-number-company-exists-link',
      'company-name',
      'trading-name-visually-hidden',
      'use-business-trading-name',
      'use-business-trading-name-label',
      'give-business-trading-name',
      'business-trading-name-label',
      'business-trading-name'
    ]
    for (let id of elementIds) {
      element = doc.getElementById(id)
      Code.expect(doc.getElementById(id)).to.exist()
    }

    element = doc.getElementById('company-name').firstChild
    Code.expect(element.nodeValue).to.equal(fakeCompanyDetails.companyName)

    // TODO test trading name value?
    // element = doc.getElementById('business-trading-name')
    // Code.expect(element.getAttribute('value')).to.equal(expectedValue)

    element = doc.getElementById('submit-button').firstChild
    Code.expect(element.nodeValue).to.equal('Continue')
  } else {
    element = doc.getElementById('page-heading-company-not-found').firstChild
    Code.expect(element.nodeValue).to.equal(`We couldn't find that company`)

    const elementIds = [
      'search-term-text',
      'enter-different-number-link',
    ]

    for (let id of elementIds) {
      element = doc.getElementById(id).firstChild
      Code.expect(element).to.exist()
    }
  }
}

const checkValidationError = async (expectedErrorMessage) => {
  const res = await server.inject(postRequest)
  Code.expect(res.statusCode).to.equal(200)

  const parser = new DOMParser()
  const doc = parser.parseFromString(res.payload, 'text/html')

  let element

  // Panel summary error item
  element = doc.getElementById('error-summary-list-item-0').firstChild
  Code.expect(element.nodeValue).to.equal(expectedErrorMessage)

  // Location site name field error
  element = doc.getElementById('site-name-error').firstChild
  Code.expect(element.nodeValue).to.equal(expectedErrorMessage)
}

lab.experiment('Check Company Details page tests:', () => {

  lab.experiment('General page tests:', () => {
    lab.test('GET ' + routePath + ' redirects to error screen when the user token is invalid', async () => {
      CookieService.validateCookie = () => {
        return undefined
      }

      const res = await server.inject(getRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/error')
    })

    lab.test('POST ' + routePath + ' redirects to error screen when the user token is invalid', async () => {
      CookieService.validateCookie = () => {
        return undefined
      }

      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/error')
    })
  })

  lab.experiment(`GET ${routePath} Company Details found at Companies House`, () => {

    // TODO
    // lab.test('Check page elements - existing company details', async () => {
    //   // Empty site name response
    //   // SiteNameAndLocation.getSiteName = (request, authToken, applicationId, applicationLineId) => {
    //   //   return undefined
    //   // }
    //   checkPageElements(getRequest, true)
    // })

    lab.test('Check page elements - new company details', async () => {
      checkPageElements(getRequest, true)
    })
  })

  // TODO uncomment this once we are getting the company ID from Dynamics
  // lab.experiment(`GET ${routePath} Company Details not found at Companies House`, () => {
  //   lab.test('Check page elements', async () => {
  //     // Stub the company name not found response
  //     CompanyLookupService.getCompanyName = (companyNumber) => {
  //       return undefined
  //     }
  //     checkPageElements(getRequest, false)
  //   })
  // })

  lab.experiment(`POST ${routePath}`, () => {
    // TODO

    // lab.test('POST /site/site-name success (new Site) redirects to the Site Grid Reference route', async () => {
    //   postRequest.payload['site-name'] = 'My Site'

    //   // Empty site name response
    //   SiteNameAndLocation.getSiteName = (request, authToken, applicationId, applicationLineId) => {
    //     return undefined
    //   }

    //   const res = await server.inject(postRequest)
    //   Code.expect(res.statusCode).to.equal(302)
    //   Code.expect(res.headers['location']).to.equal('/site/grid-reference')
    // })

    // lab.test('POST ' + routePath + ' success (existing Site) redirects to the Site Grid Reference route', async () => {
    //   postRequest.payload['site-name'] = 'My Site'
    //   const res = await server.inject(postRequest)
    //   Code.expect(res.statusCode).to.equal(302)
    //   Code.expect(res.headers['location']).to.equal('/site/grid-reference')
    // })

    // lab.test('POST ' + routePath + 'shows an error message when the site name is blank', async () => {
    //   postRequest.payload['site-name'] = ''
    //   await checkValidationError('Enter the site name')
    // })

    // lab.test('POST ' + routePath + ' shows an error message when the site name contains invalid characters', async () => {
    //   postRequest.payload['site-name'] = '___INVALID_SITE_NAME___'
    //   await checkValidationError('The site name cannot contain any of these characters: ^ | _ ~ ¬ `')
    // })

    // lab.test('POST ' + routePath + ' shows an error message when the site name is too long', async () => {
    //   postRequest.payload['site-name'] = '01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789X'
    //   await checkValidationError('Enter a shorter site name with no more than 170 characters')
    // })
  })

})
