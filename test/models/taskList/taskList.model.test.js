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
  DynamicsDalService.prototype.search = (query) => {
    return {
      '@odata.context': 'https://ea-lp-crm-devmaster.crm4.dynamics.com/api/data/v8.2/$metadata#defra_applicationlines(defra_parametersId(defra_showcostandtime,defra_showcostandtime_completed,defra_confirmreadrules,defra_confirmreadrules_completed,defra_wasterecoveryplanreq,defra_wasterecoveryplanreq_completed,defra_preapprequired,defra_preapprequired_completed,defra_contactdetailsrequired,defra_contactdetailsrequired_completed,defra_pholderdetailsrequired,defra_pholderdetailsrequired_completed,defra_locationrequired,defra_locationrequired_completed,defra_siteplanrequired,defra_siteplanrequired_completed,defra_techcompetenceevreq,defra_techcompetenceevreq_completed,defra_mansystemrequired,defra_mansystemrequired_completed,defra_fireplanrequired,defra_fireplanrequired_completed,defra_surfacedrainagereq,defra_surfacedrainagereq_completed,defra_cnfconfidentialityreq,defra_cnfconfidentialityreq_completed))/$entity',
      '@odata.etag': 'W/"725645"',
      'defra_permittype@OData.Community.Display.V1.FormattedValue': 'Standard',
      defra_permittype: 910400000,
      utcconversiontimezonecode: null,
      'statuscode@OData.Community.Display.V1.FormattedValue': 'Active',
      statuscode: 1,
      _createdonbehalfby_value: null,
      defra_applicationlineid: '97fdc0e4-a9b5-e711-810f-5065f38adb81',
      '_createdby_value@OData.Community.Display.V1.FormattedValue': 'Waste Sys Ops',
      _createdby_value: '10b88e9b-abaa-e711-8114-5065f38a3b21',
      '_ownerid_value@OData.Community.Display.V1.FormattedValue': 'Waste Sys Ops',
      _ownerid_value: '10b88e9b-abaa-e711-8114-5065f38a3b21',
      _modifiedonbehalfby_value: null,
      '_defra_parametersid_value@OData.Community.Display.V1.FormattedValue': 'Application Completion',
      _defra_parametersid_value: '98fdc0e4-a9b5-e711-810f-5065f38adb81',
      'createdon@OData.Community.Display.V1.FormattedValue': '10/20/2017 3:18 PM',
      createdon: '2017-10-20T15:18:19Z',
      '_defra_standardruleid_value@OData.Community.Display.V1.FormattedValue': 'SR2015 No 18',
      _defra_standardruleid_value: 'bd610c23-8ba7-e711-810a-5065f38a5b01',
      defra_name: null,
      defra_tonnesperannum: null,
      overriddencreatedon: null,
      _owningteam_value: null,
      '_modifiedby_value@OData.Community.Display.V1.FormattedValue': 'Waste Sys Ops',
      _modifiedby_value: '10b88e9b-abaa-e711-8114-5065f38a3b21',
      _defra_facilityid_value: null,
      'versionnumber@OData.Community.Display.V1.FormattedValue': '725,645',
      versionnumber: 725645,
      timezoneruleversionnumber: null,
      '_owninguser_value@OData.Community.Display.V1.FormattedValue': null,
      _owninguser_value: '10b88e9b-abaa-e711-8114-5065f38a3b21',
      '_owningbusinessunit_value@OData.Community.Display.V1.FormattedValue': null,
      _owningbusinessunit_value: 'd0e1178d-8193-e711-8111-5065f38a6ad1',
      'statecode@OData.Community.Display.V1.FormattedValue': 'Active',
      statecode: 0,
      'modifiedon@OData.Community.Display.V1.FormattedValue': '10/20/2017 3:18 PM',
      modifiedon: '2017-10-20T15:18:19Z',
      '_defra_applicationid_value@OData.Community.Display.V1.FormattedValue': null,
      _defra_applicationid_value: '95fdc0e4-a9b5-e711-810f-5065f38adb81',
      importsequencenumber: null,
      defra_parametersId: {
        '@odata.etag': 'W/"725644"',
        'defra_showcostandtime@OData.Community.Display.V1.FormattedValue': 'Yes',
        defra_showcostandtime: true,
        'defra_showcostandtime_completed@OData.Community.Display.V1.FormattedValue': 'No',
        defra_showcostandtime_completed: false,
        'defra_confirmreadrules@OData.Community.Display.V1.FormattedValue': 'Yes',
        defra_confirmreadrules: true,
        'defra_confirmreadrules_completed@OData.Community.Display.V1.FormattedValue': 'No',
        defra_confirmreadrules_completed: false,
        'defra_wasterecoveryplanreq@OData.Community.Display.V1.FormattedValue': 'No',
        defra_wasterecoveryplanreq: false,
        'defra_wasterecoveryplanreq_completed@OData.Community.Display.V1.FormattedValue': 'No',
        defra_wasterecoveryplanreq_completed: false,
        'defra_preapprequired@OData.Community.Display.V1.FormattedValue': 'Yes',
        defra_preapprequired: true,
        'defra_preapprequired_completed@OData.Community.Display.V1.FormattedValue': 'No',
        defra_preapprequired_completed: false,
        'defra_contactdetailsrequired@OData.Community.Display.V1.FormattedValue': 'Yes',
        defra_contactdetailsrequired: true,
        'defra_contactdetailsrequired_completed@OData.Community.Display.V1.FormattedValue': 'No',
        defra_contactdetailsrequired_completed: false,
        'defra_pholderdetailsrequired@OData.Community.Display.V1.FormattedValue': 'Yes',
        defra_pholderdetailsrequired: true,
        'defra_pholderdetailsrequired_completed@OData.Community.Display.V1.FormattedValue': 'No',
        defra_pholderdetailsrequired_completed: false,
        'defra_locationrequired@OData.Community.Display.V1.FormattedValue': 'Yes',
        defra_locationrequired: true,
        'defra_locationrequired_completed@OData.Community.Display.V1.FormattedValue': 'No',
        defra_locationrequired_completed: false,
        'defra_siteplanrequired@OData.Community.Display.V1.FormattedValue': 'Yes',
        defra_siteplanrequired: true,
        'defra_siteplanrequired_completed@OData.Community.Display.V1.FormattedValue': 'No',
        defra_siteplanrequired_completed: false,
        'defra_techcompetenceevreq@OData.Community.Display.V1.FormattedValue': 'Yes',
        defra_techcompetenceevreq: true,
        'defra_techcompetenceevreq_completed@OData.Community.Display.V1.FormattedValue': 'No',
        defra_techcompetenceevreq_completed: false,
        'defra_mansystemrequired@OData.Community.Display.V1.FormattedValue': 'Yes',
        defra_mansystemrequired: true,
        'defra_mansystemrequired_completed@OData.Community.Display.V1.FormattedValue': 'No',
        defra_mansystemrequired_completed: false,
        'defra_fireplanrequired@OData.Community.Display.V1.FormattedValue': 'Yes',
        defra_fireplanrequired: true,
        'defra_fireplanrequired_completed@OData.Community.Display.V1.FormattedValue': 'No',
        defra_fireplanrequired_completed: false,
        'defra_surfacedrainagereq@OData.Community.Display.V1.FormattedValue': 'Yes',
        defra_surfacedrainagereq: true,
        'defra_surfacedrainagereq_completed@OData.Community.Display.V1.FormattedValue': 'No',
        defra_surfacedrainagereq_completed: false,
        'defra_cnfconfidentialityreq@OData.Community.Display.V1.FormattedValue': 'Yes',
        defra_cnfconfidentialityreq: true,
        'defra_cnfconfidentialityreq_completed@OData.Community.Display.V1.FormattedValue': 'No',
        defra_cnfconfidentialityreq_completed: false,
        defra_wasteparamsid: '98fdc0e4-a9b5-e711-810f-5065f38adb81'
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

  lab.test('TaskList returned by getByApplicationLineId() method has the correct sections', async () => {
    const taskList = await TaskList.getByApplicationLineId()
    Code.expect(Array.isArray(taskList.sections)).to.be.true()
    Code.expect(taskList.sections.length).to.equal(3)

    Code.expect(Array.isArray(taskList.sections[0].sectionItems)).to.be.true()
    Code.expect(taskList.sections[0].sectionItems.length).to.equal(4)
    Code.expect(taskList.sections[0].sectionItems[0].id).to.equal('check-permit-cost-and-time')
    Code.expect(taskList.sections[0].sectionItems[1].id).to.equal('confirm-that-your-operation-meets-the-rules')
    Code.expect(taskList.sections[0].sectionItems[2].id).to.equal('waste-recovery-plan')
    Code.expect(taskList.sections[0].sectionItems[3].id).to.equal('tell-us-if-youve-discussed-this-application-with-us')

    Code.expect(Array.isArray(taskList.sections[1].sectionItems)).to.be.true()
    Code.expect(taskList.sections[1].sectionItems.length).to.equal(9)
    Code.expect(taskList.sections[1].sectionItems[0].id).to.equal('give-contact-details')
    Code.expect(taskList.sections[1].sectionItems[1].id).to.equal('give-permit-holder-details')
    Code.expect(taskList.sections[1].sectionItems[2].id).to.equal('give-site-name-and-location')
    Code.expect(taskList.sections[1].sectionItems[3].id).to.equal('upload-the-site-plan')
    Code.expect(taskList.sections[1].sectionItems[4].id).to.equal('upload-technical-management-qualifications')
    Code.expect(taskList.sections[1].sectionItems[5].id).to.equal('tell-us-which-management-system-you-use')
    Code.expect(taskList.sections[1].sectionItems[6].id).to.equal('upload-the-fire-prevention-plan')
    Code.expect(taskList.sections[1].sectionItems[7].id).to.equal('confirm-the-drainage-system-for-the-vehicle-storage-area')
    Code.expect(taskList.sections[1].sectionItems[8].id).to.equal('confirm-confidentiality-needs')

    Code.expect(Array.isArray(taskList.sections[2].sectionItems)).to.be.true()
    Code.expect(taskList.sections[2].sectionItems.length).to.equal(1)
    Code.expect(taskList.sections[2].sectionItems[0].id).to.equal('submit-pay')
  })
})
