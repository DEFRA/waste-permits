'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const server = require('../../server')

const ActiveDirectoryAuthService = require('../../src/services/activeDirectoryAuth.service')

lab.beforeEach(() => {
  // Stub methods
})

lab.afterEach(() => {
  // Restore stubbed methods
})

lab.experiment('Default page tests:', () => {
  lab.test('Get / re-directs to the first page in the application flow', async () => {
    const request = {
      method: 'GET',
      url: '/',
      headers: {}
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers['location']).to.equal('/start/start-or-open-saved')
  })
})
