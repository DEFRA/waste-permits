'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const Application = require('../../src/persistence/entities/application.entity')
const CharityDetail = require('../../src/models/charityDetail.model')
const DataStore = require('../../src/models/dataStore.model')
const StandardRule = require('../../src/persistence/entities/standardRule.entity')
const StandardRulesTaskList = require('../../src/models/taskList/standardRules.taskList')
const { COOKIE_RESULT } = require('../../src/constants')

let sandbox

const routePath = '/task-list'
const alreadySubmittedRoutePath = '/errors/order/done-cant-go-back'

let getRequest

const fakeApplication = {
  id: 'APPLICATION_ID',
  applicationNumber: 'APPLICATION_NUMBER'
}

const fakeCookie = {
  applicationId: 'APPLICATION_ID',
  authToken: 'AUTH_TOKEN'
}

const fakeStandardRule = {
  id: 'STANDARD_RULE_ID',
  permitName: 'Metal recycling, vehicle storage, depollution and dismantling facility',
  limits: 'Less than 25,000 tonnes a year of waste metal and less than 5,000 tonnes a year of waste motor vehicles',
  code: 'SR2015 No 18',
  codeForId: 'sr2015-no-18',
  guidanceUrl: 'https://www.gov.uk/government/publications/sr2015-no18-metal-recycling-vehicle-storage-depollution-and-dismantling-facility'
}

const fakeTaskList = {
  sections: [
    {
      id: 'prepare-application-section',
      sectionNumber: 1,
      sectionName: 'Prepare application',
      sectionItems: [
        {
          id: 'check-permit-cost-and-time',
          label: 'Check costs and processing time',
          href: '/cost-time',
          completedLabelId: 'cost-and-time-completed',
          ruleSetId: 'defra_showcostandtime',
          complete: false
        },
        {
          id: 'confirm-that-your-operation-meets-the-rules',
          label: 'Confirm that your operation meets the rules',
          href: '/confirm-rules',
          completedLabelId: 'operation-rules-completed',
          ruleSetId: 'defra_confirmreadrules',
          complete: false
        },
        {
          id: 'waste-recovery-plan',
          label: 'Get your waste recovery plan checked',
          href: '/waste-recovery-plan',
          completedLabelId: 'waste-recovery-plan-completed',
          ruleSetId: 'defra_wasterecoveryplanreq',
          complete: false
        },
        {
          id: 'tell-us-if-youve-discussed-this-application-with-us',
          label: `Tell us if you have discussed this application with us`,
          href: '/pre-application',
          completedLabelId: 'preapp-completed',
          ruleSetId: 'defra_preapprequired',
          complete: false
        },
        {
          id: 'give-contact-details',
          label: 'Give contact details',
          href: '/contact-details',
          completedLabelId: 'contact-details-completed',
          ruleSetId: 'defra_contactdetailsrequired',
          complete: false
        },
        {
          id: 'give-permit-holder-details',
          label: 'Give permit holder details',
          href: '/permit-holder/company/number',
          completedLabelId: 'site-operator-completed',
          ruleSetId: 'defra_pholderdetailsrequired',
          complete: false
        },
        {
          id: 'give-site-name-and-location',
          label: 'Give site name and location',
          href: '/site/site-name',
          completedLabelId: 'site-name-completed',
          ruleSetId: 'defra_locationrequired',
          complete: true
        },
        {
          id: 'upload-the-site-plan',
          label: 'Upload the site plan',
          href: '/site-plan',
          completedLabelId: 'site-plan-completed',
          ruleSetId: 'defra_siteplanrequired',
          complete: false
        },
        {
          id: 'upload-technical-management-qualifications',
          label: 'Upload technical management qualifications',
          href: '/technical-competence',
          completedLabelId: 'technical-qualification-completed',
          ruleSetId: 'defra_techcompetenceevreq',
          complete: false
        },
        {
          id: 'tell-us-which-management-system-you-use',
          label: 'Tell us which management system you use',
          href: '/management-system',
          completedLabelId: 'management-system-completed',
          ruleSetId: 'defra_mansystemrequired',
          complete: false
        },
        {
          id: 'upload-the-fire-prevention-plan',
          label: 'Upload the fire prevention plan',
          href: '/fire-prevention-plan',
          completedLabelId: 'firepp-completed',
          ruleSetId: 'defra_fireplanrequired',
          complete: false
        },
        {
          id: 'confirm-the-drainage-system-for-the-vehicle-storage-area',
          label: 'Confirm the drainage system for your site',
          href: '/drainage-type/drain',
          completedLabelId: 'confirm-drainage-completed',
          ruleSetId: 'defra_surfacedrainagereq',
          complete: false
        },
        {
          id: 'confirm-confidentiality-needs',
          label: 'Confirm confidentiality needs',
          href: '/confidentiality',
          completedLabelId: 'confidentiality-completed',
          ruleSetId: 'defra_cnfconfidentialityreq',
          complete: false
        },
        {
          id: 'invoicing-details',
          label: 'Give invoicing details',
          href: '/billing/invoice-postcode',
          completedLabelId: 'invoicing-details-completed',
          ruleSetId: 'defra_invoicingdetailsrequired',
          complete: false
        }
      ]
    },
    {
      id: 'send-and-pay-section',
      sectionNumber: 2,
      sectionName: 'Apply',
      sectionItems: [
        {
          id: 'submit-pay',
          label: 'Send application and pay',
          href: '/check-before-sending',
          completedLabelId: 'submit-and-pay',
          complete: false
        }
      ]
    }
  ]
}

const checkElement = (element, text, href) => {
  Code.expect(element).to.exist()
  if (text) {
    Code.expect(element.lastChild.nodeValue.trim()).to.equal(text)
  }
  if (href) {
    Code.expect(element.getAttribute('href')).to.equal(href)
  }
}
let dataStore
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  dataStore = mocks.dataStore

  getRequest = {
    method: 'GET',
    url: routePath,
    headers: {},
    payload: {}
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub cookies
  GeneralTestHelper.stubGetCookies(sandbox, CookieService, {
    applicationId: () => fakeApplication.id
  })

  // Stub methods
  sandbox.stub(CookieService, 'generateCookie').value(() => fakeCookie)
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(CharityDetail, 'get').value(() => new CharityDetail({}))
  sandbox.stub(DataStore, 'get').value(async () => dataStore)
  sandbox.stub(StandardRule, 'getByApplicationLineId').value(() => fakeStandardRule)
  sandbox.stub(StandardRule, 'getByCode').value(() => fakeStandardRule)
  sandbox.stub(StandardRulesTaskList, 'buildTaskList').value(() => fakeTaskList)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test({
    excludeCookiePostTests: true
  })

  lab.test('The page should NOT have a back link', async () => {
    const doc = await GeneralTestHelper.getDoc(getRequest)

    let element = doc.getElementById('back-link')
    Code.expect(element).to.not.exist()
  })

  lab.test(`GET ${routePath} success`, async () => {
    const res = await server.inject(getRequest)
    Code.expect(res.statusCode).to.equal(200)
  })

  lab.test('Task list page contains the correct heading and StandardRule info', async () => {
    const doc = await GeneralTestHelper.getDoc(getRequest)

    // Check the existence of the page title and Standard Rule infos
    checkElement(doc.getElementById('page-heading'), 'Apply for a standard rules environmental permit')
    checkElement(doc.getElementById('task-list-heading-visually-hidden'))
    checkElement(doc.getElementById('standard-rule-name-and-code'), `${fakeStandardRule.permitName} - ${fakeStandardRule.code}`)
    checkElement(doc.getElementById('select-a-different-permit'))
  })

  lab.test(`GET ${routePath} redirects to the Already Submitted route ${alreadySubmittedRoutePath} if the application has been submitted`, async () => {
    Application.prototype.isSubmitted = () => true

    const res = await server.inject(getRequest)
    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers['location']).to.equal(alreadySubmittedRoutePath)
  })

  lab.experiment('Task list page contains the correct section headings and correct task list items', () => {
    fakeTaskList.sections.forEach((section) => {
      section.sectionItems.forEach((sectionItem) => {
        lab.test(`for ${sectionItem.label}`, async () => {
          const doc = await GeneralTestHelper.getDoc(getRequest)

          // Check the existence of the correct task list sections
          checkElement(doc.getElementById(section.id))
          checkElement(doc.getElementById(`${section.id}-number`), `${section.sectionNumber}.`)
          checkElement(doc.getElementById(`${section.id}-heading`), section.sectionName)

          // The task list item should exist
          checkElement(doc.getElementById(sectionItem.id))
          checkElement(doc.getElementById(`${sectionItem.id}-link`), sectionItem.label, sectionItem.href)
          if (sectionItem.complete) {
            // The task list item complete flag should exist
            checkElement(doc.getElementById(sectionItem.completedLabelId))
          } else {
            // The task list item complete flag should not exist
            Code.expect(doc.getElementById(sectionItem.completedLabelId)).to.not.exist()
          }
        })
      })
    })
  })

  lab.test('Task list page shows a validation error correctly', async () => {
    // No error
    getRequest.url = routePath
    let doc = await GeneralTestHelper.getDoc(getRequest)

    let element = doc.getElementById('error-summary-heading')
    Code.expect(element).to.not.exist()

    // Has error
    getRequest.url = `${routePath}?showError=true`
    doc = await GeneralTestHelper.getDoc(getRequest)

    element = doc.getElementById('error-summary-heading')
    Code.expect(element).to.exist()
    Code.expect(element.firstChild.nodeValue).to.equal('You must complete all the tasks before you send your application')
  })
})
