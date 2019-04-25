'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/persistence/entities/application.entity')
const RecoveryService = require('../../src/services/recovery.service')
const LoggingService = require('../../src/services/logging.service')
const CookieService = require('../../src/services/cookie.service')
const { COOKIE_RESULT } = require('../../src/constants')
const ItemEntity = require('../../src/persistence/entities/item.entity')
const Routes = require('../../src/routes')

const routes = {}

for (const key in Routes) {
  let item = Routes[key]
  if (item.controller === 'bespokeApplyOffline') {
    Object.assign(routes, { item })
  }
}

const errorPath = '/errors/technical-problem'

const ACTIVITY_ITEMS = [
  {
    id: 'ITEM_1',
    itemName: 'ITEM_1',
    shortName: 'item-1',
    canApplyFor: true,
    canApplyOnline: true
  }, {
    id: 'ITEM_2',
    itemName: 'ITEM_2',
    shortName: 'item-2',
    canApplyFor: true,
    canApplyOnline: false
  }, {
    id: 'ITEM_3',
    itemName: 'ITEM_3',
    shortName: 'item-3',
    canApplyFor: false,
    canApplyOnline: true
  }, {
    id: 'ITEM_4',
    itemName: 'ITEM_4',
    shortName: 'item-4',
    canApplyFor: false,
    canApplyOnline: false
  }
]

const comparisonValues = ACTIVITY_ITEMS
  .filter((item) => !item.canApplyFor || !item.canApplyOnline)
  .map(({ id }) => id)

Object.entries(routes).forEach(([route, { path: routePath, pageHeading, pageDescription, nextRoute }]) => {
  lab.experiment(route, () => {
    let sandbox
    let mocks

    lab.beforeEach(() => {
      mocks = new Mocks()

      Object.assign(mocks.wasteActivities, { activities: 'item-1,item-2,item-3,item-4' })

      // Create a sinon sandbox to stub methods
      sandbox = sinon.createSandbox()

      // Stub methods
      sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
      sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
      sandbox.stub(ItemEntity, 'listWasteActivitiesForFacilityTypes').value(() => ACTIVITY_ITEMS)
      sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
    })

    lab.afterEach(() => {
      // Restore the sandbox to make sure the stubs are removed correctly
      sandbox.restore()
    })

    lab.experiment('bespokeApplyOffline page tests:', () => {
      new GeneralTestHelper({ lab, routePath }).test({
        excludeCookiePostTests: true
      })

      lab.experiment(`GET ${routePath}`, () => {
        let getRequest

        lab.beforeEach(() => {
          getRequest = {
            method: 'GET',
            url: routePath,
            headers: {}
          }
        })

        lab.test('success', async () => {
          const doc = await GeneralTestHelper.getDoc(getRequest)
          Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal(pageHeading)

          // Test for the existence of expected static content
          GeneralTestHelper.checkElementsExist(doc, [
            'change-selection-link',
            'how-to-apply',
            'bespoke-prefix',
            'bespoke-link',
            'bespoke-text'
          ])
        })

        lab.experiment('failure', () => {
          lab.test('redirects to error screen when failing to recover the application', async () => {
            const spy = sandbox.spy(LoggingService, 'logError')
            RecoveryService.createApplicationContext = () => {
              throw new Error('recovery failed')
            }

            const res = await server.inject(getRequest)
            Code.expect(spy.callCount).to.equal(1)
            Code.expect(res.statusCode).to.equal(302)
            Code.expect(res.headers['location']).to.equal(errorPath)
          })
        })

        lab.experiment('checks', () => {
          lab.test(`correctly displays names of permits that can't be applied for`, async () => {
            const doc = await GeneralTestHelper.getDoc(getRequest)

            const values = Object
              .values(doc.getElementById('items').childNodes)
              .filter(({ firstChild }) => firstChild && firstChild.nodeValue)
              .map(({ firstChild }) => firstChild.nodeValue)

            Code.expect(values).to.only.include(comparisonValues)
          })
        })
      })
    })
  })
})
