// Not part of MVP

// 'use strict'

// const Lab = require('lab')
// const lab = exports.lab = Lab.script()
// const Code = require('code')
// const DOMParser = require('xmldom').DOMParser
// const GeneralTestHelper = require('./generalTestHelper.test')

// const server = require('../../server')
// const Application = require('../../src/models/application.model')
// const CookieService = require('../../src/services/cookie.service')
// const {COOKIE_RESULT} = require('../../src/constants')

// let validateCookieStub
// let applicationGetByIdStub
// let applicationIsSubmittedStub

// const routePath = '/permit/category'
// const nextRoutePath = '/permit/select'

// const getRequest = {
//   method: 'GET',
//   url: routePath,
//   headers: {},
//   payload: {}
// }

// lab.beforeEach(() => {
//   // Stub methods
//   validateCookieStub = CookieService.validateCookie
//   CookieService.validateCookie = () => COOKIE_RESULT.VALID_COOKIE

//   applicationGetByIdStub = Application.getById
//   Application.getById = () => new Application(fakeApplication)

//   applicationIsSubmittedStub = Application.prototype.isSubmitted
//   Application.prototype.isSubmitted = () => false
// })

// lab.afterEach(() => {
//   // Restore stubbed methods
//   CookieService.validateCookie = validateCookieStub
//   Application.getById = applicationGetByIdStub
//   Application.prototype.isSubmitted = applicationIsSubmittedStub
// })

// lab.experiment('What do you want the permit for? (permit category) page tests:', () => {
//   new GeneralTestHelper(lab, routePath).test()

//   lab.test('The page should NOT have a back link', async () => {
//     const res = await server.inject(getRequest)
//     Code.expect(res.statusCode).to.equal(200)

//     const parser = new DOMParser()
//     const doc = parser.parseFromString(res.payload, 'text/html')

//     const element = doc.getElementById('back-link')
//     Code.expect(element).to.not.exist()
//   })

//   lab.test(`GET ${routePath} success`, async () => {
//     const res = await server.inject(getRequest)
//     Code.expect(res.statusCode).to.equal(200)
//   })

//   lab.test('POST /permit/category success redirects to the permit select route', async () => {
//     const res = await server.inject(getRequest)
//     Code.expect(res.statusCode).to.equal(302)
//     Code.expect(res.headers['location']).to.equal(nextRoutePath)
//   })
// })
