'use strict'

const config = require('../../src/config/config')

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

const sinon = require('sinon')
const nock = require('nock')

const DynamicsService = require('../../src/services/dynamics.service')

let dynamicsService

lab.beforeEach((done) => {
  dynamicsService = new DynamicsService('__CRM_TOKEN__')

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
  DynamicsService.prototype.runQuery.restore()
  nock.cleanAll()
  done()
})

lab.experiment('Dynamics Service tests:', () => {
  lab.test('Create method should create a record in Dynamics', (done) => {
    const spy = sinon.spy(DynamicsService.prototype, 'runQuery')
    dynamicsService.createItem({}, '__DYNAMICS_INSERT_QUERY__').then((response) => {
      Code.expect(spy.callCount).to.equal(1)
      done()
    })
  })

  lab.test('Update method should update a record in Dynamics', (done) => {
    const spy = sinon.spy(DynamicsService.prototype, 'runQuery')
    dynamicsService.updateItem({}, '__DYNAMICS_UPDATE_QUERY__').then((response) => {
      Code.expect(spy.callCount).to.equal(1)
      done()
    })
  })

  lab.test('List method should retrieve a list records in Dynamics', (done) => {
    const spy = sinon.spy(DynamicsService.prototype, 'runQuery')
    dynamicsService.listItems('__DYNAMICS_LIST_QUERY__').then((response) => {
      console.log(response)
      Code.expect(spy.callCount).to.equal(1)
      done()
    })
  })
})
