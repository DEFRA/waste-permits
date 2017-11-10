'use strict'

const config = require('../../src/config/config')

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const nock = require('nock')

const AddressLookupService = require('../../src/services/addressLookup.service')

lab.beforeEach(() => {})

lab.afterEach(() => {})

lab.experiment('Address Lookup Service tests:', () => {
  lab.test('getAddressesFromPostcode() should return the correct addresses', async () => {
    // TODO
  })
})
