'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const server = require('../../server')

const routePath = '/'
const firstPageRoutePath = '/start/start-or-open-saved'

const getRequest = {
  method: 'GET',
  url: routePath,
  headers: {},
  payload: {}
}

lab.beforeEach(() => {
  // Stub methods
})

lab.afterEach(() => {
  // Restore stubbed methods
})

lab.experiment('Default page tests:', () => {
  lab.test(`Get ${routePath} re-directs to the first page in the application flow`, async () => {
    const res = await server.inject(getRequest)
    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers['location']).to.equal(firstPageRoutePath)
  })
})
