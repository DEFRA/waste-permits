// Not part of MVP

// 'use strict'

// const Lab = require('lab')
// const lab = exports.lab = Lab.script()
// const Code = require('code')
// const DOMParser = require('xmldom').DOMParser
// const GeneralTestHelper = require('./generalTestHelper.test')

// const server = require('../../server')
// const CookieService = require('../../src/services/cookie.service')
// const {COOKIE_RESULT} = require('../../src/constants')

// let validateCookieStub

// const routePath = '/permit/category'

// lab.beforeEach(() => {
//   // Stub methods
//   validateCookieStub = CookieService.validateCookie
//   CookieService.validateCookie = () => COOKIE_RESULT.VALID_COOKIE
// })

// lab.afterEach(() => {
//   // Restore stubbed methods
//   CookieService.validateCookie = validateCookieStub
// })

// lab.experiment('What do you want the permit for? page tests:', () => {
  // new GeneralTestHelper(lab, routePath).test()

//   lab.test('The page should NOT have a back link', async () => {
//     const request = {
//       method: 'GET',
//       url: routePath,
//       headers: {},
//       payload: {}
//     }

//     const res = await server.inject(request)
//     Code.expect(res.statusCode).to.equal(200)

//     const parser = new DOMParser()
//     const doc = parser.parseFromString(res.payload, 'text/html')

//     const element = doc.getElementById('back-link')
//     Code.expect(element).to.not.exist()
//   })

//   lab.test('GET /permit/category success ', async () => {
//     const request = {
//       method: 'GET',
//       url: routePath,
//       headers: {},
//       payload: {}
//     }

//     const res = await server.inject(request)
//     Code.expect(res.statusCode).to.equal(200)
//   })

//   lab.test('POST /permit/category success redirects to the permit select route', async () => {
//     const request = {
//       method: 'POST',
//       url: routePath,
//       headers: {},
//       payload: {}
//     }

//     const res = await server.inject(request)
//     Code.expect(res.statusCode).to.equal(302)
//     Code.expect(res.headers['location']).to.equal('/permit/select')
//   })

//   lab.test('GET /permit/category redirects to timeout screen when the user token is invalid', async () => {
//     const request = {
//       method: 'GET',
//       url: routePath,
//       headers: {},
//       payload: {}
//     }

//     CookieService.validateCookie = () => {
//       return undefined
//     }

//     const res = await server.inject(request)
//     Code.expect(res.statusCode).to.equal(302)
//     Code.expect(res.headers['location']).to.equal('/errors/timeout')
//   })
// })
