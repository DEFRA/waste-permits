'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const server = require('../../server')

const routePath = '/'
const firstPageRoutePath = '/start/start-or-open-saved'

const permitTypeQuery = '?permit-type='
const bespokeQuery = `${permitTypeQuery}bespoke`
const standardRulesQuery = `${permitTypeQuery}standard-rules`
const invalidValueQuery = `${permitTypeQuery}invalid-value`
const invalidParameterQuery = '?invalid-parameter=invalid-value'

let getRequest

lab.beforeEach(() => {
  getRequest = {
    method: 'GET',
    url: routePath,
    headers: {},
    payload: {}
  }
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

  lab.test(`Get ${routePath} correctly passes on bespoke parameter`, async () => {
    getRequest.url = `${getRequest.url}${bespokeQuery}`
    const res = await server.inject(getRequest)
    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers['location']).to.equal(`${firstPageRoutePath}${bespokeQuery}`)
  })

  lab.test(`Get ${routePath} correctly passes on standard rules parameter`, async () => {
    getRequest.url = `${getRequest.url}${standardRulesQuery}`
    const res = await server.inject(getRequest)
    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers['location']).to.equal(`${firstPageRoutePath}${standardRulesQuery}`)
  })

  lab.test(`Get ${routePath} does not pass on invalid parameter value`, async () => {
    getRequest.url = `${getRequest.url}${invalidValueQuery}`
    const res = await server.inject(getRequest)
    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers['location']).to.equal(firstPageRoutePath)
  })

  lab.test(`Get ${routePath} does not pass on invalid parameter`, async () => {
    getRequest.url = `${getRequest.url}${invalidParameterQuery}`
    const res = await server.inject(getRequest)
    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers['location']).to.equal(firstPageRoutePath)
  })
})
