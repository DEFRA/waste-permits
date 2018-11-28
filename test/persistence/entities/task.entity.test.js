'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const Task = require('../../../src/persistence/entities/task.entity')
const BaseEntity = require('../../../src/persistence/entities/base.entity')

let sandbox
let applicationId
let entityContext
let expectedXml

lab.beforeEach(() => {
  applicationId = 'APPLICATION_ID'
  entityContext = { authToken: 'AUTH_TOKEN', applicationId }
  expectedXml = `<fetch distinct="true"><entity name="defra_applicationtaskdefinition"><attribute name="defra_shortname"/><filter><condition attribute="statecode" operator="eq" value="0"/></filter><link-entity name="defra_itemapplicationtaskdefinition" from="defra_applicationtaskdefinitionid" to="defra_applicationtaskdefinitionid" link-type="inner" alias="link"><filter type="and"><condition attribute="statecode" operator="eq" value="0"/></filter><link-entity name="defra_item" from="defra_itemid" to="defra_itemid" link-type="inner" alias="item"><filter type="and"><condition attribute="statecode" operator="eq" value="0"/></filter><link-entity name="defra_applicationline" from="defra_itemid" to="defra_itemid" link-type="inner" alias="line"><filter type="and"><condition attribute="statecode" operator="eq" value="0"/><condition attribute="defra_applicationid" operator="eq" value="${applicationId}"/></filter></link-entity></link-entity></link-entity></entity></fetch>`

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(BaseEntity, 'listUsingFetchXml').value(async () => undefined)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Item Entity tests:', () => {
  lab.test('buildQuery() method should return correct xml query', async () => {
    Code.expect(Task.buildQuery(entityContext)).to.equal(expectedXml)
  })

  lab.test('getAvailableTasks() method should call listUsingFetchXml with correct xml', async () => {
    let listUsingFetchXmlSpy = sinon.spy(BaseEntity, 'listUsingFetchXml')
    await Task.getAvailableTasks(entityContext)
    Code.expect(listUsingFetchXmlSpy.calledWith(entityContext, expectedXml)).to.be.true()
  })
})
