'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
// const Site = require('../../src/models/site.model')

let validateCookieStub
// let siteSaveStub
// let getByApplicationIdStub

const routePath = '/site/address/postcode'
const getRequest = {
  method: 'GET',
  url: routePath,
  headers: {}
}
let postRequest

// let fakeSite = {
//   id: 'dff66fce-18b8-e711-8119-5065f38ac931',
//   name: 'THE_SITE_NAME',
//   applicationId: '403710b7-18b8-e711-810d-5065f38bb461',
//   applicationLineId: '423710b7-18b8-e711-810d-5065f38bb461',
//   save: (authToken) => {}
// }

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

//   siteSaveStub = Site.prototype.save
//   Site.prototype.save = (authToken) => {}
//
//   getByApplicationIdStub = Site.getByApplicationId
//   Site.getByApplicationId = (authToken, applicationId, applicationLineId) => {
//     return fakeSite
//   }
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub

//   Site.prototype.save = siteSaveStub
//   Site.getByApplicationId = getByApplicationIdStub
})

const checkPageElements = async (request, expectedValue) => {
  const res = await server.inject(request)
  Code.expect(res.statusCode).to.equal(200)

  const parser = new DOMParser()
  const doc = parser.parseFromString(res.payload, 'text/html')

  let element = doc.getElementById('postcode-heading').firstChild
  Code.expect(element.nodeValue).to.equal(`What's the postcode for the site?`)

  element = doc.getElementById('postcode-label').firstChild
  Code.expect(element.nodeValue).to.exist()

  element = doc.getElementById('postcode-hint').firstChild
  Code.expect(element.nodeValue).to.exist()

  element = doc.getElementById('postcode')
  Code.expect(element.getAttribute('value')).to.equal('')

  element = doc.getElementById('postcode-submit').firstChild
  Code.expect(element.nodeValue).to.equal('Continue')
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

  // Location grid reference field error
  element = doc.getElementById('postcode-error').firstChild
  Code.expect(element.nodeValue).to.equal(expectedErrorMessage)
}

lab.experiment('Site Name page tests:', () => {
  lab.test('The page should have a back link', async () => {
    const res = await server.inject(getRequest)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    const element = doc.getElementById('back-link')
    Code.expect(element).to.exist()
  })

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

  lab.test('GET ' + routePath + ' returns the site postcode correctly when it is a new application', async () => {
    checkPageElements(getRequest, '')
  })

  // TODO
  // lab.test('GET ' + routePath + ' returns the Site Postcode page correctly when there is an existing postcode', async () => {
  //   await checkPageElements(getRequest, fakeLocationDetail.gridReference)
  // })

  lab.test('POST ' + routePath + ' shows an error message when the postcode is blank', async () => {
    postRequest.payload['postcode'] = ''
    await checkValidationError('Enter a postcode')
  })

  lab.test('POST ' + routePath + ' shows an error message when the postcode is whitespace', async () => {
    postRequest.payload['postcode'] = '            '
    await checkValidationError('Enter a postcode')
  })

  lab.test('POST ' + routePath + ' shows an error message when the postcode is in the wrong format', async () => {
    const expectedErrorMessage = 'Enter a valid UK postcode'

    // Wrong format
    postRequest.payload['postcode'] = 'AB12 3CDDD'
    await checkValidationError(expectedErrorMessage)

    // Not enough characters
    postRequest.payload['postcode'] = 'AB12'
    await checkValidationError(expectedErrorMessage)

    // Too many characters
    postRequest.payload['postcode'] = 'AB12345678900'
    await checkValidationError(expectedErrorMessage)
  })

  lab.test('POST ' + routePath + ' accepts a postcode that contains whitespace', async () => {
    postRequest.payload['postcode'] = '      A          1 2 A  A      '

    const res = await server.inject(postRequest)
    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers['location']).to.equal('/site/address/select-address')
  })

//   lab.test('GET ' + routePath + ' returns the site page correctly when there is an existing Site name', async () => {
//     const request = {
//       method: 'GET',
//       url: routePath,
//       headers: {}
//     }
//
//     const res = await server.inject(request)
//     Code.expect(res.statusCode).to.equal(200)
//
//     const parser = new DOMParser()
//     const doc = parser.parseFromString(res.payload, 'text/html')
//
//     let element = doc.getElementById('site-site-name-heading').firstChild
//     Code.expect(element.nodeValue).to.equal(`What's the site name?`)
//
//     element = doc.getElementById('site-site-name-subheading').firstChild
//     Code.expect(element.nodeValue).to.exist()
//
//     element = doc.getElementById('site-name-label').firstChild
//     Code.expect(element.nodeValue).to.exist()
//
//     element = doc.getElementById('site-name-hint').firstChild
//     Code.expect(element.nodeValue).to.exist()
//
//     element = doc.getElementById('site-name')
//     Code.expect(element.getAttribute('value')).to.equal(fakeSite.name)
//
//     element = doc.getElementById('site-site-name-submit').firstChild
//     Code.expect(element.nodeValue).to.equal('Continue')
//   })
//
//   lab.test('POST ' + routePath + ' success (new Site) redirects to the Site Grid Reference route', async () => {
//     const request = {
//       method: 'POST',
//       url: routePath,
//       headers: {},
//       payload: {
//         'site-name': 'My Site'
//       }
//     }
//
//     // Empty site details response
//     Site.getByApplicationId = (authToken, applicationId, applicationLineId) => {
//       return undefined
//     }
//
//     const res = await server.inject(request)
//     Code.expect(res.statusCode).to.equal(302)
//     Code.expect(res.headers['location']).to.equal('/site/grid-reference')
//   })
//
//   lab.test('POST ' + routePath + 'success (existing Site) redirects to the Site Grid Reference route', async () => {
//     const request = {
//       method: 'POST',
//       url: routePath,
//       headers: {},
//       payload: {
//         'site-name': 'My Site'
//       }
//     }
//
//     const res = await server.inject(request)
//     Code.expect(res.statusCode).to.equal(302)
//     Code.expect(res.headers['location']).to.equal('/site/grid-reference')
//   })
})
