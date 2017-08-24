'use strict'

const config = require('../../src/config/config')

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

const sinon = require('sinon')
const nock = require('nock')

const DynamicsDALService = require('../../src/services/dynamicsDAL.service')

let dynamicsDAL

lab.beforeEach((done) => {
  dynamicsDAL = new DynamicsDALService('__CRM_TOKEN__')

  // Mock the CRM token endpoints
  nock(`https://${config.dynamicsWebApiHost}`)
    .get(`${config.dynamicsWebApiPath}__DYNAMICS_LIST_QUERY__`)
    .reply(200, [])

  nock(`https://${config.dynamicsWebApiHost}`)
    .post(`${config.dynamicsWebApiPath}__DYNAMICS_INSERT_QUERY__`)
    .reply(204)

  nock(`https://${config.dynamicsWebApiHost}`)
    .patch(`${config.dynamicsWebApiPath}__DYNAMICS_UPDATE_QUERY__`)
    .reply(204)

  done()
})

lab.afterEach((done) => {
  DynamicsDALService.prototype.runQuery.restore()
  nock.cleanAll()
  done()
})

lab.experiment('Dynamics Service tests:', () => {
  lab.test('Create method should create a record in Dynamics', (done) => {
    const spy = sinon.spy(DynamicsDALService.prototype, 'runQuery')
    dynamicsDAL.createItem({}, '__DYNAMICS_INSERT_QUERY__').then((response) => {
      Code.expect(spy.callCount).to.equal(1)
      done()
    })
  })

  lab.test('Update method should update a record in Dynamics', (done) => {
    const spy = sinon.spy(DynamicsDALService.prototype, 'runQuery')
    dynamicsDAL.updateItem({}, '__DYNAMICS_UPDATE_QUERY__').then((response) => {
      Code.expect(spy.callCount).to.equal(1)
      done()
    })
  })

  lab.test('List method should retrieve a list records in Dynamics', (done) => {
    const spy = sinon.spy(DynamicsDALService.prototype, '_query')
    dynamicsDAL.listItems('__DYNAMICS_LIST_QUERY__').then((response) => {
      console.log(response)
      Code.expect(spy.callCount).to.equal(1)
      done()
    })
  })
})
