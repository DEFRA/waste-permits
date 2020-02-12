'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const { BESPOKE } = require('../../src/constants').PermitTypes
const { MCP_TYPES: { STATIONARY_MCP }, FACILITY_TYPES: { MCP, WASTE_OPERATION } } = require('../../src/dynamics')
const CookieService = require('../../src/services/cookie.service')
const RecoveryService = require('../../src/services/recovery.service')
const Application = require('../../src/persistence/entities/application.entity')
const StandardRule = require('../../src/persistence/entities/standardRule.entity')
const WasteActivities = require('../../src/models/wasteActivities.model')
const StandardRulesTaskList = require('../../src/models/taskList/standardRules.taskList')
const BespokeTaskList = require('../../src/models/taskList/bespoke.taskList')
const McpBespokeTaskList = require('../../src/models/taskList/mcpBespoke.taskList')
const { COOKIE_RESULT } = require('../../src/constants')

const routePath = '/task-list'
const alreadySubmittedRoutePath = '/errors/order/done-cant-go-back'

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

const checkElementList = (list, text) => {
  // converting to an array allows us to iterate over all elements with forEach
  Array.from(list).forEach(element => checkElement(element, text))
}

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  const { applicationId, authToken } = mocks.context

  mocks.cookie = { applicationId, authToken }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub cookies
  GeneralTestHelper.stubGetCookies(sandbox, CookieService, {
    applicationId: () => mocks.application.id
  })

  // Stub methods
  sandbox.stub(CookieService, 'generateCookie').value(() => mocks.cookie)
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application, 'getById').value(() => mocks.application)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
  sandbox.stub(StandardRule, 'getByApplicationLineId').value(() => mocks.standardRule)
  sandbox.stub(StandardRule, 'getByCode').value(() => mocks.standardRule)
  sandbox.stub(StandardRulesTaskList, 'buildTaskList').value(() => fakeTaskList)
  sandbox.stub(BespokeTaskList, 'buildTaskList').value(() => fakeTaskList)
  sandbox.stub(McpBespokeTaskList, 'buildTaskList').value(() => fakeTaskList)
  sandbox.stub(WasteActivities.prototype, 'formattedActivityName').value(() => 'ACTIVITY_NAME')
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List page tests:', () => {
  let getRequest

  new GeneralTestHelper({ lab, routePath }).test({
    excludeCookiePostTests: true
  })

  lab.beforeEach(() => {
    getRequest = {
      method: 'GET',
      url: routePath,
      headers: {},
      payload: {}
    }
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
    checkElement(doc.getElementById('standard-rule-name-and-code'), `${mocks.standardRule.permitName} - ${mocks.standardRule.code}`)
    checkElement(doc.getElementById('select-a-different-permit'))
  })

  lab.test('Task list page contains the correct heading and Bespoke MCP info when dispersion modelling is required', async () => {
    mocks.context.isBespoke = true
    mocks.context.permitType = BESPOKE.id
    mocks.taskDeterminants.facilityType = MCP
    mocks.taskDeterminants.airDispersionModellingRequired = true
    mocks.taskDeterminants.mcpType = STATIONARY_MCP
    const doc = await GeneralTestHelper.getDoc(getRequest)

    // Check the existence of the page title and Bespoke info
    checkElement(doc.getElementById('page-heading'), 'Apply for a bespoke environmental permit')
    checkElement(doc.getElementById('task-list-heading-visually-hidden'))
    checkElement(doc.getElementById('activity-name'), `Medium combustion plant site - requires dispersion modelling`)
    checkElement(doc.getElementById('select-a-different-permit'))
    Code.expect(doc.getElementById('select-a-different-permit')
      .getAttribute('href'))
      .to
      .equal('/bespoke-or-standard-rules')
  })

  lab.test('Task list page contains the correct heading and Bespoke MCP info when dispersion modelling is not required', async () => {
    mocks.context.isBespoke = true
    mocks.context.permitType = BESPOKE.id
    mocks.taskDeterminants.facilityType = MCP
    mocks.taskDeterminants.airDispersionModellingRequired = false
    mocks.taskDeterminants.mcpType = STATIONARY_MCP
    const doc = await GeneralTestHelper.getDoc(getRequest)

    // Check the existence of the page title and Bespoke MCP info
    checkElement(doc.getElementById('page-heading'), 'Apply for a bespoke environmental permit')
    checkElement(doc.getElementById('task-list-heading-visually-hidden'))
    checkElement(doc.getElementById('activity-name'), `Medium combustion plant site - does not require dispersion modelling`)
    checkElement(doc.getElementById('select-a-different-permit'))
    Code.expect(doc.getElementById('select-a-different-permit')
      .getAttribute('href'))
      .to
      .equal('/bespoke-or-standard-rules')
  })

  lab.experiment('Task list page contains the correct heading and Bespoke info for waste operations', () => {
    let getWasteActivitiesStub
    lab.beforeEach(() => {
      getWasteActivitiesStub = sandbox.stub(WasteActivities, 'get')
      mocks.context.isBespoke = true
      mocks.context.permitType = BESPOKE.id
      mocks.taskDeterminants.facilityType = WASTE_OPERATION
      mocks.taskDeterminants.airDispersionModellingRequired = false
    })
    lab.test('page heading and link', async () => {
      getWasteActivitiesStub.resolves(new WasteActivities([], []))
      const doc = await GeneralTestHelper.getDoc(getRequest)
      checkElement(doc.getElementById('page-heading'), 'Apply for a bespoke environmental permit')
      checkElement(doc.getElementById('task-list-heading-visually-hidden'))
      Code.expect(doc.getElementById('change-activities')
        .getAttribute('href'))
        .to
        .equal('/waste-activity-continue')
    })
    lab.test('no activities or assessments', async () => {
      getWasteActivitiesStub.resolves(new WasteActivities([], []))
      const doc = await GeneralTestHelper.getDoc(getRequest)
      checkElement(doc.getElementById('waste-details-line'), 'You’ve selected no activities and no assessments for this permit application.')
      Code.expect(doc.getElementById('waste-activities-list')).to.not.exist()
    })
    lab.test('1 activity and assessment', async () => {
      getWasteActivitiesStub.resolves(new WasteActivities([], [{ id: 'a' }]))
      mocks.taskDeterminants.wasteAssessments.push({})
      const doc = await GeneralTestHelper.getDoc(getRequest)
      checkElement(doc.getElementById('waste-details-line'), 'You’ve selected 1 activity and 1 assessment for this permit application.')
      checkElementList(doc.getElementById('waste-activities-list').getElementsByTagName('li'), 'ACTIVITY_NAME')
    })
    lab.test('multiple activities and assessments', async () => {
      getWasteActivitiesStub.resolves(new WasteActivities([], [{ id: 'a' }, { id: 'b' }]))
      mocks.taskDeterminants.wasteAssessments.push({})
      mocks.taskDeterminants.wasteAssessments.push({})
      const doc = await GeneralTestHelper.getDoc(getRequest)
      checkElement(doc.getElementById('waste-details-line'), 'You’ve selected 2 activities and 2 assessments for this permit application.')
      checkElementList(doc.getElementById('waste-activities-list').getElementsByTagName('li'), 'ACTIVITY_NAME')
    })
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
