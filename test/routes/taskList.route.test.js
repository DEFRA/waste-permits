'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const StandardRule = require('../../src/models/standardRule.model')
const TaskList = require('../../src/models/taskList/taskList.model')
const ApplicationLine = require('../../src/models/applicationLine.model')

let generateCookieStub
let validateCookieStub
let standardRuleGetByCodeStub
let taskListGetByApplicationLineIdStub
let applicationLineGetByIdStub
let standardRuleByApplicationIdStub

const routePath = '/task-list'

const fakeCookie = {
  applicationId: 'APPLICATION_ID',
  authToken: 'AUTH_TOKEN'
}

const fakeStandardRule = {
  id: 'STANDARD_RULE_ID',
  name: 'Metal recycling, vehicle storage, depollution and dismantling facility',
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

lab.beforeEach(() => {
  // Stub methods
  generateCookieStub = CookieService.generateCookie
  CookieService.generateCookie = () => fakeCookie

  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = () => true

  standardRuleGetByCodeStub = StandardRule.getByCode
  StandardRule.getByCode = async () => fakeStandardRule

  taskListGetByApplicationLineIdStub = TaskList.getByApplicationLineId
  TaskList.getByApplicationLineId = () => fakeTaskList

  applicationLineGetByIdStub = ApplicationLine.getById
  ApplicationLine.getById = () => {standardRuleId: 'STANDARD_RULE_ID'}

  standardRuleByApplicationIdStub = StandardRule.getByApplicationLineId
  StandardRule.getByApplicationLineId = () => fakeStandardRule
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.generateCookie = generateCookieStub
  CookieService.validateCookie = validateCookieStub
  StandardRule.getByCode = standardRuleGetByCodeStub
  TaskList.getByApplicationLineId = taskListGetByApplicationLineIdStub
  ApplicationLine.getById = applicationLineGetByIdStub
  StandardRule.getByApplicationLineId = standardRuleByApplicationIdStub
})

lab.experiment('Task List page tests:', () => {
  lab.test('The page should NOT have a back link', async () => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {},
      payload: {}
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element = doc.getElementById('back-link')
    Code.expect(element).to.not.exist()
  })

  lab.test('GET /task-list success ', async () => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {},
      payload: {}
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)
  })

  lab.test('Task list contains the correct heading and StandardRule info', async () => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {},
      payload: {}
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element

    // Check the existence of the page title and Standard Rule infos
    element = doc.getElementById('page-heading')
    Code.expect(element).to.exist()

    element = doc.getElementById('task-list-heading-visually-hidden')
    Code.expect(element).to.exist()

    element = doc.getElementById('standard-rule-name-and-code')
    Code.expect(element).to.exist()

    element = doc.getElementById('select-a-different-permit')
    Code.expect(element).to.exist()
  })

  lab.test('Task list contains the correct section headings', async () => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {},
      payload: {}
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element

    // Check the existence of the correct task list sections
    element = doc.getElementById('prepare-application-section-number')
    Code.expect(element).to.exist()
    element = doc.getElementById('prepare-application-section-heading')
    Code.expect(element).to.exist()

    element = doc.getElementById('send-and-pay-section-number')
    Code.expect(element).to.exist()
    element = doc.getElementById('send-and-pay-section-heading')
    Code.expect(element).to.exist()
  })

  lab.test('Task list contains the correct task list items', async () => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {},
      payload: {}
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element

    const taskListItemIds = [
      'check-permit-cost-and-time',
      'confirm-that-your-operation-meets-the-rules',
      'tell-us-if-youve-discussed-this-application-with-us',
      'give-contact-details',
      'give-permit-holder-details',
      'give-site-name-and-location',
      'upload-technical-management-qualifications',
      'tell-us-which-management-system-you-use',
      'upload-the-fire-prevention-plan',
      'confirm-the-drainage-system-for-the-vehicle-storage-area',
      'confirm-confidentiality-needs',
      'invoicing-details',
      'submit-pay'
    ]

    // These task list items should exist
    taskListItemIds.forEach((id) => {
      element = doc.getElementById(id)
      Code.expect(element).to.exist()
    })

    const taskListItemLinkIds = [
      'check-permit-cost-and-time-link',
      'confirm-that-your-operation-meets-the-rules-link',
      'tell-us-if-youve-discussed-this-application-with-us-link',
      'give-contact-details-link',
      'give-permit-holder-details-link',
      'give-site-name-and-location-link',
      'upload-technical-management-qualifications-link',
      'tell-us-which-management-system-you-use-link',
      'upload-the-fire-prevention-plan-link',
      'confirm-the-drainage-system-for-the-vehicle-storage-area-link',
      'confirm-confidentiality-needs-link',
      'invoicing-details-link',
      'submit-pay-link'
    ]

    // These task list item links should exist
    taskListItemLinkIds.forEach((id) => {
      element = doc.getElementById(id)
      Code.expect(element).to.exist()
    })

    // This task list item should NOT exist
    element = doc.getElementById('upload-the-site-plan')
    Code.expect(element).to.not.exist()
    element = doc.getElementById('upload-the-site-plan-link')
    Code.expect(element).to.not.exist()
  })

  // Completeness flags are not in scope yet
  lab.test('Task list items have the correct completeness flags', async () => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {},
      payload: {}
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element

    const completedItemIds = [
      'site-name-completed'
    ]

    const incompleteItemIds = [
      'cost-and-time-completed',
      'operation-rules-completed',
      'waste-recovery-plan-completed',
      'preapp-completed',
      'contact-details-completed',
      'site-operator-completed',
      'site-plan-completed',
      'technical-qualification-completed',
      'management-system-completed',
      'firepp-completed',
      'confirm-drainage-completed',
      'confidentiality-completed',
      'invoicing-details-completed',
      'submit-and-pay'
    ]

    // These task list item complete flags should be there
    completedItemIds.forEach((id) => {
      console.log(id)

      element = doc.getElementById(id)
      Code.expect(element).to.exist()
    })

    // These task list item complete flags should NOT be there
    incompleteItemIds.forEach((id) => {
      console.log(id)

      element = doc.getElementById(id)
      Code.expect(element).to.not.exist()
    })
  })

  lab.test('GET /task-list redirects to error screen when the user token is invalid', async () => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {},
      payload: {}
    }

    CookieService.validateCookie = () => {
      return undefined
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers['location']).to.equal('/error')
  })
})
