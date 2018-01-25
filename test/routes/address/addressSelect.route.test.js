// 'use strict'

// const Lab = require('lab')
// const lab = exports.lab = Lab.script()
// const Code = require('code')
// const DOMParser = require('xmldom').DOMParser

// const server = require('../../../server')
// const CookieService = require('../../../src/services/cookie.service')

// let validateCookieStub

// const pageHeading = `What's the site address?`
// const routePath = '/site/address/select-address'
// const getRequest = {
//   method: 'GET',
//   url: routePath,
//   headers: {}
// }
// let postRequest

// lab.beforeEach(() => {
//   postRequest = {
//     method: 'POST',
//     url: routePath,
//     headers: {},
//     payload: {}
//   }

//   // Stub methods
//   validateCookieStub = CookieService.validateCookie
//   CookieService.validateCookie = () => true
// })

// lab.afterEach(() => {
//   // Restore stubbed methods
//   CookieService.validateCookie = validateCookieStub
// })

// const checkPageElements = async (getRequest, expectedValue) => {
//   const res = await server.inject(getRequest)
//   Code.expect(res.statusCode).to.equal(200)

//   const parser = new DOMParser()
//   const doc = parser.parseFromString(res.payload, 'text/html')

//   let element = doc.getElementById('page-heading').firstChild
//   Code.expect(element.nodeValue).to.equal(pageHeading)

//   element = doc.getElementById('postcode-label').firstChild
//   Code.expect(element).to.exist()

//   element = doc.getElementById('postcode-value')
//   Code.expect(element).to.exist()

//   element = doc.getElementById('change-postcode-link')
//   Code.expect(element.getAttribute('value')).to.equal(expectedValue)

//   element = doc.getElementById('manual-address').firstChild
//   Code.expect(element).to.exist()

//   element = doc.getElementById('select-address-label').firstChild
//   Code.expect(element).to.exist()

//   element = doc.getElementById('select-address').firstChild
//   Code.expect(element).to.exist()

//   element = doc.getElementById('manual-hint').firstChild
//   Code.expect(element).to.exist()

//   element = doc.getElementById('manual-address-link').firstChild
//   Code.expect(element).to.exist()

//   element = doc.getElementById('submit-button').firstChild
//   Code.expect(element.nodeValue).to.equal('Continue')
// }

// // TODO test validation
// // const checkValidationError = async (expectedErrorMessage) => {
// //   const res = await server.inject(postRequest)
// //   Code.expect(res.statusCode).to.equal(200)

// //   const parser = new DOMParser()
// //   const doc = parser.parseFromString(res.payload, 'text/html')

// //   let element

// //   // Panel summary error item
// //   element = doc.getElementById('error-summary-list-item-0').firstChild
// //   Code.expect(element.nodeValue).to.equal(expectedErrorMessage)

// //   // Location grid reference field error
// //   element = doc.getElementById('site-address-error').firstChild
// //   Code.expect(element.nodeValue).to.equal(expectedErrorMessage)
// // }

// lab.experiment('Address select page tests:', () => {
//   lab.test('The page should have a back link', async () => {
//     const res = await server.inject(getRequest)
//     Code.expect(res.statusCode).to.equal(200)

//     const parser = new DOMParser()
//     const doc = parser.parseFromString(res.payload, 'text/html')

//     const element = doc.getElementById('back-link')
//     Code.expect(element).to.exist()
//   })

//   lab.test('GET ' + routePath + ' redirects to error screen when the user token is invalid', async () => {
//     CookieService.validateCookie = () => {
//       return undefined
//     }

//     const res = await server.inject(getRequest)
//     Code.expect(res.statusCode).to.equal(302)
//     Code.expect(res.headers['location']).to.equal('/error')
//   })

//   lab.test('POST ' + routePath + ' redirects to error screen when the user token is invalid', async () => {
//     CookieService.validateCookie = () => {
//       return undefined
//     }

//     const res = await server.inject(postRequest)
//     Code.expect(res.statusCode).to.equal(302)
//     Code.expect(res.headers['location']).to.equal('/error')
//   })

//   lab.test('GET ' + routePath + ' returns the Address Select page  page correctly when an address has not been selected yet', async () => {
//     await checkPageElements(getRequest, '')
//   })
// })
