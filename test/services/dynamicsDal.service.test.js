'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

const sinon = require('sinon')
const nock = require('nock')

const config = require('../../src/config/config')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')
const LoggingService = require('../../src/services/logging.service')

let dynamicsDal
let sandbox
let dynamicsCallSpy
let loggingSpy

lab.beforeEach(() => {
  dynamicsDal = new DynamicsDalService('__CRM_TOKEN__')

  // Mock the CRM token endpoints
  nock(`https://${config.dynamicsWebApiHost}`)
    .get(`${config.dynamicsWebApiPath}__DYNAMICS_LIST_QUERY__`)
    .reply(200, {
      '@odata.context': 'THE_ODATA_ENDPOINT_AND_QUERY',
      value: [
        { '@odata.etag': 'W/"1155486"',
          contactid: '7a8e4354-4f24-e711-80fd-5065f38a1b01',
          firstname: 'Marlon',
          lastname: 'Herzog',
          telephone1: '055 8767 0835',
          emailaddress1: 'Amparo.Abbott49@example.com' },
        { '@odata.etag': 'W/"1155506"',
          contactid: '8e8e4354-4f24-e711-80fd-5065f38a1b01',
          firstname: 'Kelvin',
          lastname: 'Rice',
          telephone1: '055 8301 2280',
          emailaddress1: 'Mike9@example.com' },
        { '@odata.etag': 'W/"1273787"',
          contactid: '9d8e4354-4f24-e711-80fd-5065f38a1b01',
          firstname: 'Maximo',
          lastname: 'Wisoky',
          telephone1: '01424 733336',
          emailaddress1: 'Danielle.Howell@example.com'
        }
      ]
    })

  nock(`https://${config.dynamicsWebApiHost}`)
    .get(`${config.dynamicsWebApiPath}__DYNAMICS_ID_QUERY__`)
    .reply(200, {
      '@odata.context': 'THE_ODATA_ENDPOINT_AND_QUERY',
      '@odata.etag': 'W/"1700525"',
      contactid: '9b658b69-8386-e711-810a-5065f38a1b01',
      firstname: 'Marlon',
      lastname: 'Herzog',
      telephone1: '055 8767 0835',
      emailaddress1: 'Amparo.Abbott49@example.com'
    })

  nock(`https://${config.dynamicsWebApiHost}`)
    .post(`${config.dynamicsWebApiPath}__DYNAMICS_INSERT_QUERY__`)
    .reply(204, '', {
      'odata-entityid': `https://${config.dynamicsWebApiHost}${config.dynamicsWebApiPath}contacts(7a8e4354-4f24-e711-80fd-5065f38a1b01)`
    })

  nock(`https://${config.dynamicsWebApiHost}`)
    .delete(`${config.dynamicsWebApiPath}__DYNAMICS_DELETE_QUERY__`)
    .reply(204, '', {
      'odata-entityid': `https://${config.dynamicsWebApiHost}${config.dynamicsWebApiPath}contacts(7a8e4354-4f24-e711-80fd-5065f38a1b01)`
    })

  nock(`https://${config.dynamicsWebApiHost}`)
    .patch(`${config.dynamicsWebApiPath}__DYNAMICS_UPDATE_QUERY__`)
    .reply(204, '', {
      'odata-entityid': `https://${config.dynamicsWebApiHost}${config.dynamicsWebApiPath}/contacts(7a8e4354-4f24-e711-80fd-5065f38a1b01)`
    })

  nock(`https://${config.dynamicsWebApiHost}`)
    .get(`${config.dynamicsWebApiPath}__DYNAMICS_UNKNOWN_BAD_QUERY__`)
    .reply(500, {})

  nock(`https://${config.dynamicsWebApiHost}`)
    .get(`${config.dynamicsWebApiPath}__DYNAMICS_KNOWN_BAD_QUERY__`)
    .reply(500, {
      error: {
        message: 'KNOWN_BAD_QUERY',
        innererror: {
          type: 'DYNAMICS_ERROR_TYPE',
          message: 'KNOWN_BAD_QUERY',
          stacktrace: 'DYNAMICS_STACKTRACE'
        }
      }
    })

  nock(`https://${config.dynamicsWebApiHost}`)
    .get(`${config.dynamicsWebApiPath}__DYNAMICS_TIMEOUT_QUERY__`)
    .socketDelay(7000)
    .reply(200, {})

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()
  dynamicsCallSpy = sandbox.spy(DynamicsDalService.prototype, '_call')
  loggingSpy = sandbox.spy(LoggingService, 'logError')
  sandbox.stub(console, 'error').value(() => {})
})

lab.afterEach(() => {
  nock.cleanAll()
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Dynamics Service tests:', () => {
  lab.test('create() can create a new record in Dynamics', async () => {
    const response = await dynamicsDal.create('__DYNAMICS_INSERT_QUERY__', {})
    Code.expect(dynamicsCallSpy.callCount).to.equal(1)
    Code.expect(response).to.equal('7a8e4354-4f24-e711-80fd-5065f38a1b01')
  })

  lab.test('update() can update a record in Dynamics', async () => {
    await dynamicsDal.update('__DYNAMICS_UPDATE_QUERY__', {})
    Code.expect(dynamicsCallSpy.callCount).to.equal(1)
  })

  lab.test('delete() can delete a record in Dynamics', async () => {
    await dynamicsDal.delete('__DYNAMICS_DELETE_QUERY__')
    Code.expect(dynamicsCallSpy.callCount).to.equal(1)
  })

  lab.test('search() can retrieve a list of records from Dynamics', async () => {
    await dynamicsDal.search('__DYNAMICS_LIST_QUERY__')
    Code.expect(dynamicsCallSpy.callCount).to.equal(1)
  })

  lab.test('search() can retrieve a single record from Dynamics', async () => {
    await dynamicsDal.search('__DYNAMICS_ID_QUERY__')
    Code.expect(dynamicsCallSpy.callCount).to.equal(1)
  })

  lab.test('service handles unknown result from Dynamics', async () => {
    await dynamicsDal.search('__DYNAMICS_KNOWN_BAD_QUERY__')
      .catch((err) => {
        Code.expect(dynamicsCallSpy.callCount).to.equal(1)
        Code.expect(err).to.endWith('Code: 500, Message: KNOWN_BAD_QUERY')
        Code.expect(loggingSpy.callCount).to.equal(1)
      })
  })

  lab.test('service handles known bad result from Dynamics', async () => {
    await dynamicsDal.search('__DYNAMICS_UNKNOWN_BAD_QUERY__')
      .catch((err) => {
        Code.expect(dynamicsCallSpy.callCount).to.equal(1)
        Code.expect(err).to.endWith('Code: 500, Message: null')
      })
  })

  lab.test('search() times out based on app configuration', async () => {
    await dynamicsDal.search('__DYNAMICS_TIMEOUT_QUERY__')
      .catch((err) => {
        Code.expect(dynamicsCallSpy.callCount).to.equal(1)
        Code.expect(err.message).to.equal('socket hang up')
      })
  })
})
