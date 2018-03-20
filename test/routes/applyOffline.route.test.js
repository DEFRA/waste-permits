'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const DOMParser = require('xmldom').DOMParser
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/models/application.model')
const Payment = require('../../src/models/payment.model')
const StandardRule = require('../../src/models/standardRule.model')
const StandardRuleType = require('../../src/models/standardRuleType.model')
const CookieService = require('../../src/services/cookie.service')
const LoggingService = require('../../src/services/logging.service')
const {COOKIE_RESULT} = require('../../src/constants')

const permitSelectRoute = '/permit/select'
const permitCategoryRoute = '/permit/category'
const permitHolderRoute = '/permit-holder/type'

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

const onlineCategory = {
  id: 'mining',
  name: 'Mining',
  category: 'Mining',
  canApplyOnline: true
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

let fakeApplication
let fakePermitHolderType
let fakeStandardRule
let fakeStandardRuleId
let fakeStandardRuleType
let sandbox

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID'
  }

  fakePermitHolderType = {
    type: 'PERMIT_HOLDER_TYPE',
    canApplyOnline: false
  }

  fakeStandardRule = {
    id: 'STANDARD_RULE_ID',
    canApplyOnline: false
  }

  fakeStandardRuleType = {
    id: 'offline-category'
  }
  fakeStandardRuleId = 'offline-permit'

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Save for use in stub
  const cookieGet = CookieService.get

  // Stub methods
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(StandardRule, 'getById').value(() => new Application(fakeStandardRule))
  sandbox.stub(StandardRuleType, 'getCategories').value(() => [])
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(CookieService, 'get').value((request, cookieKey) => {
    switch (cookieKey) {
      case 'permitHolderType':
        return fakePermitHolderType
      case 'standardRuleTypeId':
        return fakeStandardRuleType.id
      case 'standardRuleId':
        return fakeStandardRuleId
      default:
        return cookieGet(request, cookieKey)
    }
  })
  sandbox.stub(LoggingService, 'logError').value(() => {})
  sandbox.stub(Payment, 'getByApplicationLineIdAndType').value(() => {})
  sandbox.stub(Payment.prototype, 'isPaid').value(() => false)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Apply Offline: Download and fill in these forms to apply for that permit page tests:', () => {
  new GeneralTestHelper(lab, routePath).test({excludeCookiePostTests: true})

  const getDoc = async (request) => {
    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    return parser.parseFromString(res.payload, 'text/html')
  }

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
        lab.beforeEach(() => {
          fakePermitHolderType = permitHolderTypes.limitedCompany
        })

        Object.keys(offlineCategories)
          .forEach((type) => {
            const standardRuleType = offlineCategories[type]

            lab.test(`"${standardRuleType.category}"`, async () => {
              fakeStandardRuleType = standardRuleType

              const doc = await getDoc(getRequest)
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

        lab.test(`"${onlineCategory.category}" for permit "${offlineStandardRule.permitName}"`, async () => {
          fakeStandardRule = offlineStandardRule

          const doc = await getDoc(getRequest)
          checkCommonElements(doc)
          Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal(`Apply for ${offlineStandardRule.permitName.toLowerCase()} - ${offlineStandardRule.code}`)
          Code.expect(doc.getElementById('change-selection-link').getAttribute('href')).to.equal(permitSelectRoute)

          Code.expect(doc.getElementById('standard-rules-link').getAttribute('href')).to.equal(defaultLink)

          GeneralTestHelper.checkElementsExist(doc, [
            'standard-rules-prefix',
            'standard-rules-link-text'
          ])
        })
      })

      lab.test('when the category other is selected', async () => {
        fakePermitHolderType = permitHolderTypes.other

        const doc = await getDoc(getRequest)
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
        const spy = sinon.spy(LoggingService, 'logError')
        Application.getById = () => {
          throw new Error('read failed')
        }

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })

      lab.test('redirects to start screen when cookie does not contain an offline category id and the permit holder can apply online', async () => {
        fakeStandardRuleType = offlineStandardRule
        fakeStandardRule.canApplyOnline = true
        fakePermitHolderType.canApplyOnline = true
        const spy = sinon.spy(LoggingService, 'logError')

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(startPath)
      })
    })
  })
})
