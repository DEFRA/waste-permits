'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

const sinon = require('sinon')
const nock = require('nock')

const config = require('../../src/config/config')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')

let dynamicsDal

lab.beforeEach((done) => {
  dynamicsDal = new DynamicsDalService('__CRM_TOKEN__')

  // Mock the CRM token endpoints
  nock(`https://${config.dynamicsWebApiHost}`)
    .get(`${config.dynamicsWebApiPath}__DYNAMICS_LIST_QUERY__`)
    .reply(200, {
      '@odata.context': `https://${config.dynamicsWebApiHost}${config.dynamicsWebApiPath}/$metadata#contacts(contactid,firstname,lastname,telephone1,emailaddress1)`,
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
      '@odata.context': `https://${config.dynamicsWebApiHost}${config.dynamicsWebApiPath}/$metadata#contacts(contactid,firstname,lastname,telephone1,emailaddress1)/$entity`,
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
    .patch(`${config.dynamicsWebApiPath}__DYNAMICS_UPDATE_QUERY__`)
    .reply(204, '', {
      'odata-entityid': `https://${config.dynamicsWebApiHost}${config.dynamicsWebApiPath}/contacts(7a8e4354-4f24-e711-80fd-5065f38a1b01)`
    })

  done()
})

lab.afterEach((done) => {
  nock.cleanAll()
  done()
})

lab.experiment('Dynamics Service tests:', () => {
  lab.test('create() can create a new record in Dynamics', (done) => {
    const spy = sinon.spy(DynamicsDalService.prototype, '_call')
    dynamicsDal.create('__DYNAMICS_INSERT_QUERY__', {}).then((response) => {
      Code.expect(spy.callCount).to.equal(1)
      Code.expect(response).to.equal('7a8e4354-4f24-e711-80fd-5065f38a1b01')
      DynamicsDalService.prototype._call.restore()
      done()
    })
  })

  lab.test('update() can update a record in Dynamics', (done) => {
    const spy = sinon.spy(DynamicsDalService.prototype, '_call')
    dynamicsDal.update('__DYNAMICS_UPDATE_QUERY__', {}).then((response) => {
      Code.expect(spy.callCount).to.equal(1)
      DynamicsDalService.prototype._call.restore()
      done()
    })
  })

  lab.test('search() can retrieve a list of records from Dynamics', (done) => {
    const spy = sinon.spy(DynamicsDalService.prototype, '_call')
    dynamicsDal.search('__DYNAMICS_LIST_QUERY__').then((response) => {
      Code.expect(spy.callCount).to.equal(1)
      DynamicsDalService.prototype._call.restore()
      done()
    })
  })

  lab.test('search() can retrieve a single record from Dynamics', (done) => {
    const spy = sinon.spy(DynamicsDalService.prototype, '_call')
    dynamicsDal.search('__DYNAMICS_ID_QUERY__').then((response) => {
      Code.expect(spy.callCount).to.equal(1)

      DynamicsDalService.prototype._call.restore()
      done()
    })
  })
})
