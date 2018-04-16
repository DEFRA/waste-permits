'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/models/application.model')
const Payment = require('../../src/models/payment.model')
const StandardRuleType = require('../../src/models/standardRuleType.model')
const CookieService = require('../../src/services/cookie.service')
const LoggingService = require('../../src/services/logging.service')
const {COOKIE_RESULT} = require('../../src/constants')

const routePath = '/permit/category'
const nextRoutePath = '/permit/select'
const offlineRoutePath = '/start/apply-offline'
const errorPath = '/errors/technical-problem'

const offlineCategories = [
  {
    id: 'offline-category-flood',
    name: 'Flood',
    category: 'Flood risk activities'
  },
  {
    id: 'offline-category-radioactive',
    name: 'Radioactive',
    category: 'Radioactive substances for non-nuclear sites'
  },
  {
    id: 'offline-category-water',
    name: 'Water',
    category: 'Water discharges'
  }
]

let fakeApplication
let fakeStandardRuleType
let sandbox

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID'
  }

  fakeStandardRuleType = {
    id: 'STANDARD_RULE_TYPE_ID',
    category: 'CATEGORY',
    hint: 'CATEGORY_HINT',
    categoryName: 'CATEGORY_NAME'
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(Payment, 'getBacsPayment').value(() => {})
  sandbox.stub(Payment.prototype, 'isPaid').value(() => false)
  sandbox.stub(StandardRuleType, 'getCategories').value(() => [])
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(server, 'log').value(() => {})
  sandbox.stub(console, 'error').value(() => {})
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('What do you want the permit for? (permit category) page tests:', () => {
  new GeneralTestHelper(lab, routePath).test()

  const checkCommonElements = async (doc) => {
    Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('What do you want the permit for?')
    Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')

    GeneralTestHelper.checkElementsExist(doc, [
      'summary',
      'hint-paragraph-1',
      'hint-paragraph-2',
      'hint-link',
      'hint-email',
      'hint-telephone',
      'hint-outside-uk-telephone',
      'hint-minicom',
      'hint-mail-link'
    ])
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
      let categories

      lab.beforeEach(() => {
        categories = [
          {id: 'category-0', categoryName: 'electrical', category: 'Electrical insulating oil storage', hint: ''},
          {id: 'category-1', categoryName: 'metal', category: 'Metal recycling, scrap metal and WEEE', hint: 'not cars or vehicles'},
          {id: 'category-2', categoryName: 'mining', category: 'Mining, oil and gas', hint: ''},
          {id: 'category-3', categoryName: 'transfer', category: 'Waste transfer station or amenity site', hint: 'with or without treatment'}
        ]

        StandardRuleType.getCategories = () => categories
      })

      lab.test('should include categories ', async () => {
        const doc = await GeneralTestHelper.getDoc(getRequest)
        checkCommonElements(doc)

        categories.forEach(({id, categoryName, category, hint}) => {
          const prefix = `chosen-category-${categoryName}`
          Code.expect(doc.getElementById(`${prefix}-input`).getAttribute('value')).to.equal(id)
          Code.expect(doc.getElementById(`${prefix}-label`)).to.exist()
          Code.expect(doc.getElementById(`${prefix}-category`).firstChild.nodeValue.trim()).to.equal(category)
          if (hint) {
            Code.expect(doc.getElementById(`${prefix}-hint`).firstChild.nodeValue.trim()).to.equal(hint)
          } else {
            Code.expect(doc.getElementById(`${prefix}-hint`)).to.not.exist()
          }
        })
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to get the application ID', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        Application.getById = () => {
          throw new Error('read failed')
        }

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })

      lab.test('redirects to error screen when failing to get the list of categories', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        StandardRuleType.getCategories = () => {
          throw new Error('search failed')
        }

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })
  })

  lab.experiment(`POST ${routePath}`, () => {
    let postRequest

    lab.beforeEach(() => {
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: {}
      }
    })

    lab.experiment('success', async () => {
      const checkSuccessRoute = async (route) => {
        const setCookieSpy = sandbox.spy(CookieService, 'set')
        postRequest.payload['chosen-category'] = fakeStandardRuleType.id
        const res = await server.inject(postRequest)

        // Make sure standard rule type is saved in a cookie
        Code.expect(setCookieSpy.calledOnce).to.equal(true)
        Code.expect(setCookieSpy.calledWith(res.request, 'standardRuleTypeId', fakeStandardRuleType.id)).to.equal(true)

        // Make sure a redirection has taken place correctly
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(route)
      }

      lab.test('when online category is selected', async () => {
        await checkSuccessRoute(nextRoutePath)
      })

      offlineCategories.forEach((standardRuleType) => {
        lab.test(`when offline ${standardRuleType.category} is selected`, async () => {
          fakeStandardRuleType = standardRuleType
          await checkSuccessRoute(offlineRoutePath)
        })
      })
    })

    lab.test('invalid when category not selected', async () => {
      postRequest.payload = {}
      const doc = await GeneralTestHelper.getDoc(postRequest)
      await GeneralTestHelper.checkValidationMessage(doc, 'chosen-category', 'Select what you want the permit for')
    })
  })
})
