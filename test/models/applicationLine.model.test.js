'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const ApplicationLine = require('../../src/models/applicationLine.model')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')

let applicationLine
let dynamicsCreateStub
let dynamicsSearchStub

let applicationLineId = '44444-55555-66666-77777-88888-999999'

lab.beforeEach(() => {
  // testApplication = new ApplicationLine()
  applicationLine = new ApplicationLine({
    applicationId: '11111-22222-33333-44444-55555-666666',
    standardRuleId: '22222-33333-44444-55555-66666-777777',
    parametersId: '33333-44444-55555-66666-77777-888888'
  })

  // Stub methods

  dynamicsSearchStub = DynamicsDalService.prototype.search
  DynamicsDalService.prototype.search = (query) => {
    // Dynamics Contact objects
    return {
      '@odata.context': 'THE_ODATA_ENDPOINT_AND_QUERY',
      value: [
        // TODO
        // { '@odata.etag': 'W/"1155486"',
        //   contactid: '7a8e4354-4f24-e711-80fd-5065f38a1b01',
        //   firstname: 'Marlon',
        //   lastname: 'Herzog',
        //   telephone1: '055 8767 0835',
        //   emailaddress1: 'Amparo.Abbott49@example.com' },
        // { '@odata.etag': 'W/"1155506"',
        //   contactid: '8e8e4354-4f24-e711-80fd-5065f38a1b01',
        //   firstname: 'Kelvin',
        //   lastname: 'Rice',
        //   telephone1: '055 8301 2280',
        //   emailaddress1: 'Mike9@example.com' },
        // { '@odata.etag': 'W/"1273787"',
        //   contactid: '9d8e4354-4f24-e711-80fd-5065f38a1b01',
        //   firstname: 'Maximo',
        //   lastname: 'Wisoky',
        //   telephone1: '01424 733336',
        //   emailaddress1: 'Danielle.Howell@example.com'
        // }
      ]
    }
  }

  dynamicsCreateStub = DynamicsDalService.prototype.create
  DynamicsDalService.prototype.create = (dataObject, query) => {
    return applicationLineId
  }
})

lab.afterEach(() => {
  // Restore stubbed methods
  DynamicsDalService.prototype.create = dynamicsCreateStub
  DynamicsDalService.prototype.search = dynamicsSearchStub
})

lab.experiment('ApplicationLine Model tests:', () => {
  lab.test('getById() method correctly retrieves an ApplicationLine object', async () => {

    // const spy = sinon.spy(DynamicsDalService.prototype, 'create')
    // await applicationLine.save()
    // Code.expect(spy.callCount).to.equal(1)
    // Code.expect(applicationLine.id).to.equal(applicationLineId)
  })

  lab.test('save() method saves a new ApplicationLine object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'create')
    await applicationLine.save()
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(applicationLine.id).to.equal(applicationLineId)
  })
})
