'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const StandardRule = require('../../src/models/standardRule.model')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')

let dynamicsSearchStub

// Dynamics StandardRule objects
const wasteParameters = {
  defra_showcostandtime: true,
  defra_confirmreadrules: true,
  defra_preapprequired: true,
  defra_contactdetailsrequired: true,
  defra_pholderdetailsrequired: true,
  defra_locationrequired: true,

  // Turn off the Upload Site Plan section
  defra_siteplanrequired: false,

  defra_techcompetenceevreq: true,
  defra_mansystemrequired: true,
  defra_fireplanrequired: true,
  defra_surfacedrainagereq: true,
  defra_cnfconfidentialityreq: true
}

lab.beforeEach((done) => {
  // Stub methods
  dynamicsSearchStub = DynamicsDalService.prototype.search

  done()
})

lab.afterEach((done) => {
  // Restore stubbed methods
  DynamicsDalService.prototype.search = dynamicsSearchStub

  done()
})

lab.experiment('StandardRule Model tests:', () => {
  lab.test('list() method returns a list of StandardRule objects', (done) => {
    DynamicsDalService.prototype.search = (query) => {
      return {
        '@odata.context': 'THE_ODATA_ENDPOINT_AND_QUERY',
        value: [{
          '@odata.etag': 'W/"1234567"',
          defra_limits: 'Less than 25,000 tonnes a year of waste metal and less than 5,000 tonnes a year of waste motor vehicles',
          defra_code: 'SR2015 No 18',
          defra_rulesnamegovuk: 'Metal recycling, vehicle storage, depollution and dismantling facility',
          defra_standardruleid: '7a8e4354-4f24-e711-80fd-5065f38a1b01'
        },
        {
          '@odata.etag': 'W/"1234568"',
          defra_limits: 'Less than 75,000 tonnes per year',
          defra_code: 'SR2015 No 10',
          defra_rulesnamegovuk: 'Household, commercial and industrial waste transfer station with treatment and asbestos storage',
          defra_standardruleid: '7a8e4354-4f24-e711-80fd-5065f38a1b02'
        },
        {
          '@odata.etag': 'W/"1234569"',
          defra_limits: 'Less than 75,000 tonnes per year',
          defra_code: 'SR2015 No 4',
          defra_rulesnamegovuk: 'Household, commercial and industrial waste transfer station',
          defra_standardruleid: '7a8e4354-4f24-e711-80fd-5065f38a1b03'
        }
        ]
      }
    }

    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    StandardRule.list().then((standardRuleList) => {
      Code.expect(Array.isArray(standardRuleList.results)).to.be.true()
      Code.expect(standardRuleList.results.length).to.equal(3)
      Code.expect(standardRuleList.count).to.equal(3)
      Code.expect(spy.callCount).to.equal(1)

      done()
    })
  })

  lab.test('getByCode() method returns a StandardRule object', (done) => {
    DynamicsDalService.prototype.search = (query) => {
      return {
        '@odata.context': 'THE_ODATA_ENDPOINT_AND_QUERY',
        value: [{
          '@odata.etag': 'W/"1234567"',
          defra_limits: 'Less than 25,000 tonnes a year of waste metal and less than 5,000 tonnes a year of waste motor vehicles',
          defra_code: 'SR2015 No 18',
          defra_rulesnamegovuk: 'Metal recycling, vehicle storage, depollution and dismantling facility',
          defra_standardruleid: '7a8e4354-4f24-e711-80fd-5065f38a1b01',
          defra_wasteparametersId: wasteParameters
        }]
      }
    }

    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    StandardRule.getByCode().then((standardRule) => {
      Code.expect(Array.isArray(standardRule.sections)).to.be.true()
      Code.expect(standardRule.sections.length).to.equal(4)

      Code.expect(Array.isArray(standardRule.sections[0].sectionItems)).to.be.true()
      Code.expect(standardRule.sections[0].sectionItems.length).to.equal(2)

      Code.expect(Array.isArray(standardRule.sections[1].sectionItems)).to.be.true()
      Code.expect(standardRule.sections[1].sectionItems.length).to.equal(1)

      Code.expect(Array.isArray(standardRule.sections[2].sectionItems)).to.be.true()
      Code.expect(standardRule.sections[2].sectionItems.length).to.equal(9)

      Code.expect(Array.isArray(standardRule.sections[3].sectionItems)).to.be.true()
      Code.expect(standardRule.sections[3].sectionItems.length).to.equal(1)

      Code.expect(spy.callCount).to.equal(1)

      done()
    })
  })

  lab.test('transformPermitCode() method formats string for an ID correctly', (done) => {
    const string = 'SR2015 No 10'
    Code.expect(StandardRule.transformPermitCode(string)).to.equal('sr2015-no-10')

    done()
  })
})
