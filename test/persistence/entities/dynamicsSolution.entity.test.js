'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const DynamicsSolution = require('../../../src/persistence/entities/dynamicsSolution.entity')
const DynamicsDalService = require('../../../src/services/dynamicsDal.service')

const context = { authToken: 'AUTH_TOKEN' }

let dynamicsSearchStub

lab.beforeEach(() => {
  dynamicsSearchStub = DynamicsDalService.prototype.search
  DynamicsDalService.prototype.search = () => {
    // Dynamics DynamicsSolution objects
    return {
      '@odata.context': 'THE_ODATA_ENDPOINT_AND_QUERY',
      value: [{
        '@odata.etag': 'W/"560861"',
        friendlyname: 'Core',
        version: '1.6.3.0',
        solutionid: '3fee3c24-fb57-4233-8cd1-64e96a45428b'
      },
      {
        '@odata.etag': 'W/"677624"',
        friendlyname: 'Waste Permits',
        version: '1.1.10.0',
        solutionid: 'bb0974b4-5857-45a6-9bb5-7cc989735541'
      },
      {
        '@odata.etag': 'W/"694026"',
        friendlyname: 'Licensing and Permitting',
        version: '1.1.11.0',
        solutionid: 'a999be4d-8789-407c-ac7e-b928232887a9'
      }
      ]
    }
  }
})

lab.afterEach(() => {
  // Restore stubbed methods
  DynamicsDalService.prototype.search = dynamicsSearchStub
})

lab.experiment('DynamicsSolution Entity tests:', () => {
  lab.test('get() method returns the correct DynamicsSolution objects', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    const dynamicsVersionInfo = await DynamicsSolution.get(context)
    Code.expect(spy.callCount).to.equal(1)

    Code.expect(dynamicsVersionInfo.length).to.equal(3)

    Code.expect(dynamicsVersionInfo[0].componentName).to.equal('Core')
    Code.expect(dynamicsVersionInfo[0].version).to.equal('1.6.3.0')
    Code.expect(dynamicsVersionInfo[1].componentName).to.equal('Waste Permits')
    Code.expect(dynamicsVersionInfo[1].version).to.equal('1.1.10.0')
    Code.expect(dynamicsVersionInfo[2].componentName).to.equal('Licensing and Permitting')
    Code.expect(dynamicsVersionInfo[2].version).to.equal('1.1.11.0')
  })
})
