'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/persistence/entities/application.entity')
const StandardRule = require('../../src/persistence/entities/standardRule.entity')
const StandardRuleType = require('../../src/persistence/entities/standardRuleType.entity')
const CookieService = require('../../src/services/cookie.service')
const LoggingService = require('../../src/services/logging.service')
const RecoveryService = require('../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../src/constants')

const permitCategoryRoute = '/permit/category'
const permitHolderRoute = '/permit-holder'

const defaultLink = 'https://www.gov.uk/government/collections/environmental-permit-application-forms-for-a-standard-permit-installations-mining-waste-or-waste-operation'

const permitHolderTypes = {
  limitedCompany: {
    id: 'limited-company',
    type: 'Limited company',
    canApplyOnline: true
  },
  other: {
    id: 'other-organisation',
    type: 'Other organisation, for example a club or association',
    canApplyOnline: false
  }
}

const offlineCategories = {
  flood: {
    id: 'offline-category-flood',
    name: 'Flood',
    category: 'Flood risk activities',
    link: 'https://www.gov.uk/guidance/flood-risk-activities-environmental-permits#standard-rules-permits'
  },
  radioactive: {
    id: 'offline-category-radioactive',
    name: 'Radioactive',
    category: 'Radioactive substances for non-nuclear sites',
    link: 'https://www.gov.uk/government/collections/radioactive-substances-regulation-for-non-nuclear-sites'
  },
  water: {
    id: 'offline-category-water',
    name: 'Water',
    category: 'Water discharges',
    link: 'https://www.gov.uk/government/collections/environmental-permit-application-forms-standard-permit-water-discharge'
  }
}

const offlineStandardRule = {
  id: 'offline-permit',
  permitName: 'Offline Permit',
  code: 'offline permit code',
  canApplyOnline: false
}

const routePath = '/start/apply-offline'
const errorPath = '/errors/technical-problem'
const startPath = '/errors/order/start-at-beginning'

let mocks
let sandbox

lab.beforeEach(() => {
  mocks = new Mocks()

  // Because this should be an offline standard rule
  mocks.standardRule.canApplyOnline = false

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub cookies
  GeneralTestHelper.stubGetCookies(sandbox, CookieService, {
    standardRuleTypeId: () => mocks.standardRuleType.id,
    standardRuleId: () => mocks.standardRule.id
  })

  // Stub methods
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(StandardRule, 'getById').value(() => mocks.standardRule)
  sandbox.stub(StandardRuleType, 'getCategories').value(() => [])
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Apply Offline: Download and fill in these forms to apply for that permit page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test({ excludeCookiePostTests: true })

  const checkCommonElements = async (doc) => {
    Code.expect(doc.getElementById('how-to-apply')).to.exist()
    Code.expect(doc.getElementById('submit-button')).to.not.exist()
  }

  lab.experiment(`GET ${routePath}`, () => {
    let getRequest

    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {}
      }
    })

    lab.experiment('success', () => {
      lab.experiment(`when the permit holder is "${permitHolderTypes.limitedCompany.type}" and the category is`, () => {
        Object.keys(offlineCategories)
          .forEach((type) => {
            const standardRuleType = offlineCategories[type]

            lab.test(`"${standardRuleType.category}"`, async () => {
              delete mocks.recovery.standardRuleId
              Object.assign(mocks.standardRuleType, standardRuleType)

              const doc = await GeneralTestHelper.getDoc(getRequest)
              checkCommonElements(doc)
              Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal(`Apply for ${standardRuleType.category.toLowerCase()} permits`)
              Code.expect(doc.getElementById('change-selection-link').getAttribute('href')).to.equal(permitCategoryRoute)

              Code.expect(doc.getElementById(`${type}-link`).getAttribute('href')).to.equal(standardRuleType.link)

              GeneralTestHelper.checkElementsExist(doc, [
                `${type}-prefix`,
                `${type}-link-text`
              ])
            })
          })
      })

      lab.test('when the permit holder other is selected', async () => {
        Object.assign(mocks.permitHolderType, permitHolderTypes.other)

        const doc = await GeneralTestHelper.getDoc(getRequest)
        checkCommonElements(doc)

        Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Apply for a permit for an other organisation, for example a club or association')
        Code.expect(doc.getElementById('change-selection-link').getAttribute('href')).to.equal(permitHolderRoute)
        Code.expect(doc.getElementById('standard-rules-link').getAttribute('href')).to.equal(defaultLink)

        GeneralTestHelper.checkElementsExist(doc, [
          'standard-rules-prefix',
          'standard-rules-link-text'
        ])
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to get the application ID', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        RecoveryService.createApplicationContext = () => {
          throw new Error('recovery failed')
        }

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })

      lab.test('redirects to start screen when cookie does not contain an offline category id and the permit holder can apply online', async () => {
        Object.assign(mocks.standardRule, offlineStandardRule)
        mocks.standardRule.canApplyOnline = true
        const spy = sandbox.spy(LoggingService, 'logError')

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(startPath)
      })
    })
  })
})
