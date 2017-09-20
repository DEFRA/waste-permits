'use strict'

const config = require('../../src/config/config')

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const StandardRule = require('../../src/models/standardRule.model')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')

let dynamicsSearchStub

lab.beforeEach((done) => {
  // Stub methods
  dynamicsSearchStub = DynamicsDalService.prototype.search
  DynamicsDalService.prototype.search = (query) => {
    // Dynamics StandardRule objects
    return {
      '@odata.context': `https://${config.dynamicsWebApiHost}${config.dynamicsWebApiPath}/$metadata#defra_standardrules?$select=defra_rulesnamegovuk,defra_limits,defra_code&$filter=defra_validfrom%20le%202017-09-18T23:00:00.000Z%20and%20defra_validto%20ge%202017-09-18T23:00:00.000Z%20and%20defra_canapplyfor%20eq%20true%20and%20defra_canapplyonline%20eq%20true%20and%20defra_code%20eq%20%27SR2015%20No%2018%27%20and%20statuscode%20eq%201`,
      value: [
        { '@odata.etag': 'W/"1234567"',
          defra_limits: 'Less than 25,000 tonnes a year of waste metal and less than 5,000 tonnes a year of waste motor vehicles',
          defra_code: 'SR2015 No 18',
          defra_rulesnamegovuk: 'Metal recycling, vehicle storage, depollution and dismantling facility',
          defra_standardruleid: '7a8e4354-4f24-e711-80fd-5065f38a1b01' },
        { '@odata.etag': 'W/"1234568"',
          defra_limits: 'Less than 75,000 tonnes per year',
          defra_code: 'SR2015 No 10',
          defra_rulesnamegovuk: 'Household, commercial and industrial waste transfer station with treatment and asbestos storage',
          defra_standardruleid: '7a8e4354-4f24-e711-80fd-5065f38a1b02' },
        { '@odata.etag': 'W/"1234569"',
          defra_limits: 'Less than 75,000 tonnes per year',
          defra_code: 'SR2015 No 4',
          defra_rulesnamegovuk: 'Household, commercial and industrial waste transfer station',
          defra_standardruleid: '7a8e4354-4f24-e711-80fd-5065f38a1b03' }
      ]
    }
  }

  done()
})

lab.afterEach((done) => {
  // Restore stubbed methods
  DynamicsDalService.prototype.search = dynamicsSearchStub

  done()
})

lab.experiment('StandardRule Model tests:', () => {
  lab.test('list() method returns a list of StandardRule objects', (done) => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    StandardRule.list().then((standardRuleList) => {
      Code.expect(Array.isArray(standardRuleList.results)).to.be.true()
      Code.expect(standardRuleList.results.length).to.equal(3)
      Code.expect(standardRuleList.count).to.equal(3)
      Code.expect(spy.callCount).to.equal(1)

      done()
    })
  })
})
