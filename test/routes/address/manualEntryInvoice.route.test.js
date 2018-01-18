'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser

const server = require('../../../server')
const CookieService = require('../../../src/services/cookie.service')
// const Address = require('../../../src/models/address.model')
// const SiteNameAndLocation = require('../../../src/models/taskList/siteNameAndLocation.model')

let validateCookieStub
// let siteNameAndLocationGetAddressStub
// let siteNameAndLocationSaveAddressStub

const pageHeading = `Enter the site address`
const routePath = '/site/address/address-manual'
const getRequest = {
  method: 'GET',
  url: routePath,
  headers: {}
}
let postRequest

let fakeAddress = {
  postcode: 'BS1 5AH'
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
  CookieService.validateCookie = () => true

  // siteNameAndLocationGetAddressStub = SiteNameAndLocation.getAddress
  // SiteNameAndLocation.getAddress = () => {
  //   return new Address({
  //     id: 'ADDRESS_ID',
  //     postcode: fakeAddress.postcode
  //   })
  // }

  // siteNameAndLocationSaveAddressStub = SiteNameAndLocation.prototype.saveAddress
  // SiteNameAndLocation.saveAddress = (request, address, authToken, applicationId, applicationLineId) => {}
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
  // SiteNameAndLocation.getAddress = siteNameAndLocationGetAddressStub
  // SiteNameAndLocation.prototype.saveAddress = siteNameAndLocationSaveAddressStub
})

const checkPageElements = async (request, expectedValue) => {
  const res = await server.inject(request)
  Code.expect(res.statusCode).to.equal(200)

  const parser = new DOMParser()
  const doc = parser.parseFromString(res.payload, 'text/html')

  let element = doc.getElementById('page-heading').firstChild
  Code.expect(element.nodeValue).to.equal(pageHeading)

  const elementIds = [
    'back-link',
    'defra-csrf-token',
    'building-name-or-number',
    'building-name-or-number-hint',
    'address-line-1',
    'address-line-2',
    'postcode'
    // 'postcode-label',
    // 'postcode-hint',
    // 'manual-hint',
    // 'manual-address-link',
    // 'no-postcode-link-text'
  ]
  for (let id of elementIds) {
    element = doc.getElementById(id)
    Code.expect(doc.getElementById(id)).to.exist()
  }

  // element = doc.getElementById('invoice-subheading')
  // Code.expect(element).to.not.exist()

  // element = doc.getElementById('postcode')
  // Code.expect(element.getAttribute('value')).to.equal(expectedValue)

  // element = doc.getElementById('no-postcode-link-text').firstChild
  // Code.expect(element.nodeValue).to.equal(`The site doesn't have a postcode`)

  element = doc.getElementById('submit-button').firstChild
  Code.expect(element.nodeValue).to.equal('Continue')
}

// const checkValidationError = async (expectedErrorMessage) => {
//   const res = await server.inject(postRequest)
//   Code.expect(res.statusCode).to.equal(200)

//   const parser = new DOMParser()
//   const doc = parser.parseFromString(res.payload, 'text/html')

//   let element

//   // Panel summary error item
//   element = doc.getElementById('error-summary-list-item-0').firstChild
//   Code.expect(element.nodeValue).to.equal(expectedErrorMessage)

//   // Location grid reference field error
//   element = doc.getElementById('postcode-error').firstChild
//   Code.expect(element.nodeValue).to.equal(expectedErrorMessage)
// }

lab.experiment('Manual address entry page tests:', () => {
  lab.experiment('General tests:', () => {
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

  lab.experiment('GET:', () => {
    lab.test('GET ' + routePath + ' returns the manual entry address screen correctly when there is no saved address', async () => {
      // SiteNameAndLocation.getAddress = (request, authToken, applicationId, applicationLineId) => {
      //   return undefined
      // }
      checkPageElements(getRequest, '')
    })

    // lab.test('GET ' + routePath + ' returns the Site Postcode page correctly when there is an existing saved address', async () => {
    //   await checkPageElements(getRequest, fakeAddress.postcode)
    // })
  })

  // lab.experiment('POST:', () => {
  //   lab.test('POST ' + routePath + ' shows an error message when the postcode is blank', async () => {
  //     postRequest.payload['postcode'] = ''
  //     await checkValidationError('Enter a postcode')
  //   })

  //   lab.test('POST ' + routePath + ' shows an error message when the postcode is whitespace', async () => {
  //     postRequest.payload['postcode'] = '     \t       '
  //     await checkValidationError('Enter a postcode')
  //   })

  //   lab.test('POST ' + routePath + ' success (new Address) redirects to the Address Select route', async () => {
  //     const request = {
  //       method: 'POST',
  //       url: routePath,
  //       headers: {},
  //       payload: {
  //         'postcode': fakeAddress.postcode
  //       }
  //     }

  //     const res = await server.inject(request)
  //     Code.expect(res.statusCode).to.equal(302)
  //     Code.expect(res.headers['location']).to.equal('/site/address/select-address')
  //   })

  //   lab.test('POST ' + routePath + 'success (existing Address) redirects to the Address Select route', async () => {
  //     const request = {
  //       method: 'POST',
  //       url: routePath,
  //       headers: {},
  //       payload: {
  //         'postcode': fakeAddress.postcode
  //       }
  //     }

  //     const res = await server.inject(request)
  //     Code.expect(res.statusCode).to.equal(302)
  //     Code.expect(res.headers['location']).to.equal('/site/address/select-address')
  //   })
  // })
})
