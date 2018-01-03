'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const TaskList = require('../../../src/models/taskList/taskList.model')
const DynamicsDalService = require('../../../src/services/dynamicsDal.service')

let dynamicsSearchStub

lab.beforeEach(() => {
  // Stub methods
  dynamicsSearchStub = DynamicsDalService.prototype.search
  DynamicsDalService.prototype.search = () => {
    return {
      // None of the other return values are required for the tests
      defra_parametersId: {
        // The actual waste parameters are not required for the tests
      }
    }
  }
})

lab.afterEach(() => {
  // Restore stubbed methods
  DynamicsDalService.prototype.search = dynamicsSearchStub
})

lab.experiment('Task List Model tests:', () => {
  lab.test('getByApplicationLineId() method returns a TaskList object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    const taskList = await TaskList.getByApplicationLineId()
    Code.expect(taskList).to.not.be.null()
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('Task List returned by getByApplicationLineId() method has the correct sections', async () => {
    // Get the Task List
    const taskList = await TaskList.getByApplicationLineId()

    // Check we have the correct sections
    Code.expect(Array.isArray(taskList.sections)).to.be.true()
    Code.expect(taskList.sections.length).to.equal(2)

    // Check we have the correct section IDs in the first section
    Code.expect(Array.isArray(taskList.sections[0].sectionItems)).to.be.true()
    Code.expect(taskList.sections[0].sectionItems.length).to.equal(14)
    const actualSectionItemIds = taskList.sections[0].sectionItems.map(sectionItem => sectionItem.id)
    const expectedSectionItemIds = [
      'check-permit-cost-and-time',
      'confirm-that-your-operation-meets-the-rules',
      'waste-recovery-plan',
      'tell-us-if-youve-discussed-this-application-with-us',
      'give-contact-details',
      'give-permit-holder-details',
      'give-site-name-and-location',
      'upload-the-site-plan',
      'upload-technical-management-qualifications',
      'tell-us-which-management-system-you-use',
      'upload-the-fire-prevention-plan',
      'confirm-the-drainage-system-for-the-vehicle-storage-area',
      'confirm-confidentiality-needs',
      'invoicing-details'
    ]
    Code.expect(JSON.stringify(actualSectionItemIds)).to.equal(JSON.stringify(expectedSectionItemIds))

    // Check we have the correct section IDs in the second section
    Code.expect(Array.isArray(taskList.sections[1].sectionItems)).to.be.true()
    Code.expect(taskList.sections[1].sectionItems.length).to.equal(1)
    Code.expect(taskList.sections[1].sectionItems[0].id).to.equal('submit-pay')
  })
})
