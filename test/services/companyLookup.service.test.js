'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const nock = require('nock')

const config = require('../../src/config/config')
const CompanyLookupService = require('../../src/services/companyLookup.service')
const COMPANY_TYPES = {
  'uk-establishment': 'UK_ESTABLISHMENT'
}
const COMPANY_STATUSES = {
  active: 'ACTIVE',
  dissolved: 'DISSOLVED',
  liquidation: 'LIQUIDATION',
  receivership: 'RECEIVERSHIP',
  administration: 'ADMINISTRATION',
  'voluntary-arrangement': 'VOLUNTARY_ARRANGEMENT',
  'converted-closed': 'CONVERTED_CLOSED',
  'insolvency-proceedings': 'INSOLVENCY_PROCEEDINGS'
}
const DEFAULT_COMPANY_STATUS = 'NOT_ACTIVE'

const serviceResponse = {
  jurisdiction: 'england-wales',
  type: 'uk-establishment',
  company_name: 'VIRIDOR NEW ENGLAND (EFW) LIMITED',
  company_number: '07421224',
  registered_office_address: {
    postal_code: 'EX2 7HR',
    region: 'Devon',
    address_line_1: 'Peninsula House',
    address_line_2: 'Rydon Lane',
    locality: 'Exeter'
  },
  accounts: {
    last_accounts: {
      period_start_on: '2016-04-01',
      made_up_to: '2017-03-31',
      period_end_on: '2017-03-31',
      type: 'dormant'
    },
    overdue: false,
    accounting_reference_date: { month: '03', day: '31' },
    next_made_up_to: '2018-03-31',
    next_accounts: {
      period_start_on: '2017-04-01',
      period_end_on: '2018-03-31',
      overdue: false,
      due_on: '2018-12-31'
    },
    next_due: '2018-12-31'
  },
  sic_codes: ['35110', '38320'],
  last_full_members_list_date: '2015-11-24',
  date_of_creation: '2010-10-27',
  has_been_liquidated: false,
  undeliverable_registered_office_address: false,
  has_insolvency_history: false,
  etag: 'dcfbaef5a99e5df06468ca7600ad5cb70227c639',
  company_status: 'active',
  has_charges: false,
  confirmation_statement: {
    next_made_up_to: '2017-11-25',
    last_made_up_to: '2016-11-25',
    overdue: false,
    next_due: '2017-12-09'
  },
  links: {
    self: '/company/07421224',
    filing_history: '/company/07421224/filing-history',
    officers: '/company/07421224/officers',
    persons_with_significant_control: '/company/07421224/persons-with-significant-control'
  },
  registered_office_is_in_dispute: false,
  can_file: true
}

class ServiceResponse {
  constructor (options = {}) {
    Object.assign(this, serviceResponse, options)
  }
}

const mockResponse = (serviceResponse) =>
  nock(`${config.COMPANIES_HOUSE_SERVICE}`)
    .get('/company/07421224')
    .reply(200, serviceResponse)

const mockOfficersResponse = (serviceResponse) =>
  nock(`${config.COMPANIES_HOUSE_SERVICE}`)
    .get('/company/07421224/officers')
    .reply(200, serviceResponse)

const formattedAddress = 'Peninsula House, Rydon Lane, Exeter, Devon, EX2 7HR'

lab.beforeEach(() => {

})

lab.afterEach(() => {
  nock.cleanAll()
})

lab.experiment('Company Lookup Service tests:', () => {
  lab.experiment('getCompany() method should', () => {
    lab.test('handle a company that does not exist', async () => {
      mockResponse()
      const company = await CompanyLookupService.getCompany('07421224')
      Code.expect(company).to.be.undefined()
    })

    lab.test('return the correct company when it exists', async () => {
      const serviceResponse = new ServiceResponse({
        companyStatus: COMPANY_STATUSES.active
      })
      mockResponse(serviceResponse)
      const company = await CompanyLookupService.getCompany('07421224')
      Code.expect(company.name).to.equal(serviceResponse.company_name)
      Code.expect(company.type).to.equal(COMPANY_TYPES[serviceResponse.type])
      Code.expect(company.address).to.equal(formattedAddress)
      Code.expect(company.status).to.equal(COMPANY_STATUSES[serviceResponse.company_status])
      Code.expect(company.isActive).to.equal(true)
    })

    lab.experiment('return the correct company status', () => {
      Object.keys(COMPANY_STATUSES).forEach((status) => {
        lab.test(`for ${status}`, async () => {
          const serviceResponse = new ServiceResponse({ company_status: status })
          mockResponse(serviceResponse)
          const company = await CompanyLookupService.getCompany('07421224')
          Code.expect(company.status).to.equal(COMPANY_STATUSES[status])
        })
      })

      lab.test('for unknown status', async () => {
        const serviceResponse = new ServiceResponse({ company_status: 'unknown status' })
        mockResponse(serviceResponse)
        const company = await CompanyLookupService.getCompany('07421224')
        Code.expect(company.status).to.equal(DEFAULT_COMPANY_STATUS)
      })
    })

    lab.experiment('return the correct isActive value', () => {
      Object.keys(COMPANY_STATUSES).forEach((status) => {
        lab.test(`for ${status}`, async () => {
          const serviceResponse = new ServiceResponse({ company_status: status })
          mockResponse(serviceResponse)
          const company = await CompanyLookupService.getCompany('07421224')
          Code.expect(company.isActive).to.equal(status === 'active')
        })
      })
    })
  })

  lab.experiment('getActiveDirectors() method should', () => {
    lab.test('handle a company that does not exist', async () => {
      mockOfficersResponse()
      const directors = await CompanyLookupService.getActiveDirectors('07421224')
      Code.expect(directors.length).to.equal(0)
    })

    lab.test('return a list of active directors when the company exists', async () => {
      const serviceResponse = {
        items: [
          { officer_role: 'director', name: 'Jack' },
          { officer_role: 'secretary', name: 'Bill' },
          { officer_role: 'director', name: 'Jill' },
          { officer_role: 'secretary', name: 'Ben', resigned_on: '1996-08-29' },
          { officer_role: 'director', name: 'James', resigned_on: '2001-10-09' }
        ]
      }
      mockOfficersResponse(serviceResponse)
      const directors = await CompanyLookupService.getActiveDirectors('07421224')
      Code.expect(directors).to.equal([
        { officer_role: 'director', name: 'Jack' },
        { officer_role: 'director', name: 'Jill' }
      ])
    })
  })

  lab.experiment('_formatAddress() method should', () => {
    lab.test('handle formatting an address that does not exist', async () => {
      const formattedAddress = await CompanyLookupService._formatAddress()
      Code.expect(formattedAddress).to.be.equal('')
    })

    lab.test('correctly format a Companies House address', () => {
      const formattedAddress = CompanyLookupService._formatAddress(serviceResponse.registered_office_address)
      Code.expect(formattedAddress).to.be.equal(formattedAddress)
    })
  })

  lab.experiment('_formatCompanyStatus() method should', () => {
    lab.test('correctly format a company status', () => {
      const formattedStatus = CompanyLookupService._formatCompanyStatus('the-company-status')
      Code.expect(formattedStatus).to.be.equal('THE_COMPANY_STATUS')
    })
  })
})
