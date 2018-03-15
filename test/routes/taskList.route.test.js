'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const DOMParser = require('xmldom').DOMParser
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const Application = require('../../src/models/application.model')
const ApplicationLine = require('../../src/models/applicationLine.model')
const Payment = require('../../src/models/payment.model')
const StandardRule = require('../../src/models/standardRule.model')
const TaskList = require('../../src/models/taskList/taskList.model')
const {COOKIE_RESULT} = require('../../src/constants')

let sandbox

const routePath = '/task-list'
const notPaidForRoute = '/errors/order/card-payment-not-complete'
const alreadySubmittedRoutePath = '/errors/order/done-cant-go-back'

const getRequest = {
  method: 'GET',
  url: routePath,
  headers: {},
  payload: {}
}

const fakeApplication = {
  id: 'APPLICATION_ID',
  applicationName: 'APPLICATION_NAME'
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
          rulesetId: 'defra_showcostandtime',
          completedId: 'defra_showcostandtime',
          available: true,
          complete: false
        },
        {
          id: 'confirm-that-your-operation-meets-the-rules',
          label: 'Confirm that your operation meets the rules',
          href: '/confirm-rules',
          completedLabelId: 'operation-rules-completed',
          rulesetId: 'defra_confirmreadrules',
          completedId: 'defra_confirmreadrules_completed',
          available: true,
          complete: false
        },
        {
          id: 'waste-recovery-plan',
          label: 'Get your waste recovery plan checked',
          href: '/waste-recovery-plan',
          completedLabelId: 'waste-recovery-plan-completed',
          rulesetId: 'defra_wasterecoveryplanreq',
          completedId: 'defra_wasterecoveryplanreq_completed',
          available: false,
          complete: false
        },
        {
          id: 'tell-us-if-youve-discussed-this-application-with-us',
          label: `Tell us if you've discussed this application with us`,
          href: '/pre-application',
          completedLabelId: 'preapp-completed',
          rulesetId: 'defra_preapprequired',
          completedId: 'defra_preapprequired_completed',
          available: true,
          complete: false
        },
        {
          id: 'give-contact-details',
          label: 'Give contact details',
          href: '/contact-details',
          completedLabelId: 'contact-details-completed',
          rulesetId: 'defra_contactdetailsrequired',
          completedId: 'defra_contactdetailsrequired_completed',
          available: true,
          complete: false
        },
        {
          id: 'give-permit-holder-details',
          label: 'Give permit holder details',
          href: '/permit-holder/company/number',
          completedLabelId: 'site-operator-completed',
          rulesetId: 'defra_pholderdetailsrequired',
          completedId: 'defra_pholderdetailsrequired_completed',
          available: true,
          complete: false
        },
        {
          id: 'give-site-name-and-location',
          label: 'Give site name and location',
          href: '/site/site-name',
          completedLabelId: 'site-name-completed',
          rulesetId: 'defra_locationrequired',
          completedId: 'defra_locationrequired_completed',
          available: true,
          complete: true
        },
        {
          id: 'upload-the-site-plan',
          label: 'Upload the site plan',
          href: '/site-plan',
          completedLabelId: 'site-plan-completed',
          rulesetId: 'defra_siteplanrequired',
          completedId: 'defra_siteplanrequired_completed',
          available: false
        },
        {
          id: 'upload-technical-management-qualifications',
          label: 'Upload technical management qualifications',
          href: '/technical-qualification',
          completedLabelId: 'technical-qualification-completed',
          rulesetId: 'defra_techcompetenceevreq',
          completedId: 'defra_techcompetenceevreq_completed',
          available: true,
          complete: false
        },
        {
          id: 'tell-us-which-management-system-you-use',
          label: 'Tell us which management system you use',
          href: '/management-system',
          completedLabelId: 'management-system-completed',
          rulesetId: 'defra_mansystemrequired',
          completedId: 'defra_mansystemrequired_completed',
          available: true,
          complete: false
        },
        {
          id: 'upload-the-fire-prevention-plan',
          label: 'Upload the fire prevention plan',
          href: '/fire-prevention-plan',
          completedLabelId: 'firepp-completed',
          rulesetId: 'defra_fireplanrequired',
          completedId: 'defra_fireplanrequired_completed',
          available: true,
          complete: false
        },
        {
          id: 'confirm-the-drainage-system-for-the-vehicle-storage-area',
          label: 'Confirm the drainage system for your site',
          href: '/drainage-type/drain',
          completedLabelId: 'confirm-drainage-completed',
          rulesetId: 'defra_surfacedrainagereq',
          completedId: 'defra_surfacedrainagereq_completed',
          available: true,
          complete: false
        },
        {
          id: 'confirm-confidentiality-needs',
          label: 'Confirm confidentiality needs',
          href: '/confidentiality',
          completedLabelId: 'confidentiality-completed',
          rulesetId: 'defra_cnfconfidentialityreq',
          completedId: 'defra_cnfconfidentialityreq_completed',
          available: true,
          complete: false
        },
        {
          id: 'invoicing-details',
          label: 'Give invoicing details',
          href: '/billing/invoice-postcode',
          completedLabelId: 'invoicing-details-completed',
          rulesetId: 'defra_invoicingdetailsrequired',
          completedId: 'defra_invoicingdetails_completed',
          available: true,
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
          available: true,
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

lab.beforeEach(() => {
  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'generateCookie').value(() => fakeCookie)
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'isPaid').value(() => false)
  sandbox.stub(ApplicationLine, 'getById').value(() => { standardRuleId: 'STANDARD_RULE_ID' })
  sandbox.stub(Payment, 'getByApplicationLineIdAndType').value(() => {})
  sandbox.stub(StandardRule, 'getByApplicationLineId').value(() => fakeStandardRule)
  sandbox.stub(StandardRule, 'getByCode').value(() => fakeStandardRule)
  sandbox.stub(TaskList, 'getByApplicationLineId').value(() => fakeTaskList)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List page tests:', () => {
  new GeneralTestHelper(lab, routePath).test({
    excludeCookiePostTests: true,
    excludeAlreadySubmittedTest: true})

  lab.test('The page should NOT have a back link', async () => {
    const res = await server.inject(getRequest)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element = doc.getElementById('back-link')
    Code.expect(element).to.not.exist()
  })

  lab.test(`GET ${routePath} success`, async () => {
    const res = await server.inject(getRequest)
    Code.expect(res.statusCode).to.equal(200)
  })

  lab.test('Task list contains the correct heading and StandardRule info', async () => {
    const res = await server.inject(getRequest)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    // Check the existence of the page title and Standard Rule infos
    checkElement(doc.getElementById('page-heading'), 'Apply for a standard rules waste permit')
    checkElement(doc.getElementById('task-list-heading-visually-hidden'))
    checkElement(doc.getElementById('standard-rule-name-and-code'), `${fakeStandardRule.permitName} - ${fakeStandardRule.code}`)
    checkElement(doc.getElementById('select-a-different-permit'))
  })

  lab.test(`GET ${routePath} redirects to the Not Paid route ${notPaidForRoute} if the applicaiton has been submitted but not paid for yet`, async () => {
    Application.prototype.isSubmitted = () => true
    Application.prototype.isPaid = () => false

    const res = await server.inject(getRequest)
    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers['location']).to.equal(notPaidForRoute)
  })

  lab.test(`GET ${routePath} redirects to the Already Submitted route ${alreadySubmittedRoutePath} if the application has been submitted and paid for`, async () => {
    Application.prototype.isSubmitted = () => true
    Application.prototype.isPaid = () => true

    const res = await server.inject(getRequest)
    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers['location']).to.equal(alreadySubmittedRoutePath)
  })

  lab.experiment('Task list contains the correct section headings and correct task list items', () => {
    fakeTaskList.sections.forEach((section) => {
      section.sectionItems.forEach((sectionItem) => {
        lab.test(`for ${sectionItem.label}`, async () => {
          const res = await server.inject(getRequest)
          Code.expect(res.statusCode).to.equal(200)

          const parser = new DOMParser()
          const doc = parser.parseFromString(res.payload, 'text/html')

          // Check the existence of the correct task list sections
          checkElement(doc.getElementById(section.id))
          checkElement(doc.getElementById(`${section.id}-number`), `${section.sectionNumber}.`)
          checkElement(doc.getElementById(`${section.id}-heading`), section.sectionName)

          if (sectionItem.available) {
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
          } else {
            // The task list item should not exist
            Code.expect(doc.getElementById(sectionItem.id)).to.not.exist()
          }
        })
      })
    })
  })
})
