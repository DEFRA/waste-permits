'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const Site = require('../../src/models/site.model')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')

let dynamicsCreateStub
let dynamicsSearchStub
let dynamicsUpdateStub

let testSite
const fakeSiteData = {
  name: 'THE_SITE_NAME',
  applicationId: '05486b21-a4ae-e711-8117-5065f38ac931'
}

lab.beforeEach((done) => {
  testSite = new Site(fakeSiteData)
  dynamicsSearchStub = DynamicsDalService.prototype.search
  DynamicsDalService.prototype.search = (query) => {
    // Dynamics Site object
    return {
      '@odata.context': 'THE_ODATA_ENDPOINT_AND_QUERY',
      value: [{
        '@odata.etag': 'W/"1234567"',
        defra_name: fakeSiteData.name,
        defra_locationid: fakeSiteData.applicationId
      }]
    }
  }

  dynamicsCreateStub = DynamicsDalService.prototype.create
  DynamicsDalService.prototype.create = (dataObject, query) => {
    return '7a8e4354-4f24-e711-80fd-5065f38a1b01'
  }

  dynamicsUpdateStub = DynamicsDalService.prototype.update
  DynamicsDalService.prototype.update = (dataObject, query) => {
    return dataObject.id
  }

  done()
})

lab.afterEach((done) => {
  // Restore stubbed methods
  DynamicsDalService.prototype.create = dynamicsCreateStub
  DynamicsDalService.prototype.search = dynamicsSearchStub
  DynamicsDalService.prototype.update = dynamicsUpdateStub

  done()
})

lab.experiment('Site Model tests:', () => {
  lab.test('Constructor creates a Site object correctly', (done) => {
    const emptySite = new Site({})
    Code.expect(emptySite.name).to.be.undefined()

    Code.expect(testSite.name).to.equal(fakeSiteData.name)
    Code.expect(testSite.applicationId).to.equal(fakeSiteData.applicationId)

    done()
  })

  lab.test('getByApplicationId() method returns a single Site object', (done) => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    Site.getByApplicationId().then((site) => {
      Code.expect(spy.callCount).to.equal(1)

      Code.expect(site.name).to.equal(fakeSiteData.name)

      done()
    })
  })

  lab.test('save() method saves a new Site object', (done) => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'create')
    testSite.save().then(() => {
      Code.expect(spy.callCount).to.equal(1)
      Code.expect(testSite.id).to.equal('7a8e4354-4f24-e711-80fd-5065f38a1b01')

      done()
    })
  })

  lab.test('save() method updates an existing Contact object', (done) => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'update')
    testSite.id = '123'
    testSite.save().then(() => {
      Code.expect(spy.callCount).to.equal(1)
      Code.expect(testSite.id).to.equal('123')

      done()
    })
  })
})
