'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const BACS_PAYMENT = 910400005
const CARD_PAYMENT = 910400000

const Payment = require('../../../src/persistence/entities/payment.entity')
const dynamicsDal = require('../../../src/services/dynamicsDal.service')

let dynamicsCreateStub
let dynamicsSearchStub
let dynamicsUpdateStub
let sandbox

let testPayment
let fakePaymentData

const testPaymentId = 'PAYMENT_ID'
const CONFIGURATION_PREFIX = 'WastePermits.ECOM.'

let context

lab.beforeEach(() => {
  fakePaymentData = {
    id: 'PAYMENT_ID',
    applicationId: 'APPLICATION_ID',
    applicationLineId: 'APPLICATION_LINE_ID',
    category: 'CATEGORY',
    statusCode: 'STATUS_CODE',
    referenceNumber: 'REFERENCE_NUMBER',
    type: 'TYPE',
    title: 'TITLE',
    value: 'VALUE'
  }
  testPayment = new Payment(fakePaymentData)

  const searchResult = {
    value: [{
      _defra_applicationid_value: testPayment.applicationId,
      _defra_applicationlineid_value: testPayment.applicationLineId,
      defra_paymentcategory: testPayment.category,
      statuscode: testPayment.statusCode,
      defra_type: testPayment.type,
      defra_title: testPayment.title,
      defra_paymentvalue: testPayment.value
    }]
  }

  context = {
    authToken: 'AUTH_TOKEN',
    applicationId: fakePaymentData.applicationId,
    applicationLineId: fakePaymentData.applicationLineId,
    taskDeterminants: {
      facilityType: {}
    }
  }

  dynamicsSearchStub = dynamicsDal.search
  dynamicsDal.search = () => searchResult

  dynamicsCreateStub = dynamicsDal.create
  dynamicsDal.create = () => testPaymentId

  dynamicsUpdateStub = dynamicsDal.update
  dynamicsDal.update = (dataObject) => dataObject.id

  // Create a sinon sandbox to prevent the "spy already wrapped errors" when a "spy.calledWith" fails
  sandbox = sinon.createSandbox()
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()

  // Restore stubbed methods
  dynamicsDal.create = dynamicsCreateStub
  dynamicsDal.search = dynamicsSearchStub
  dynamicsDal.update = dynamicsUpdateStub
})

lab.experiment('Payment Entity tests:', () => {
  lab.test('Constructor creates a Payment object correctly', () => {
    const emptyPayment = new Payment({})
    Code.expect(emptyPayment.applicationId).to.be.undefined()

    const { type, applicationId } = fakePaymentData
    Code.expect(testPayment.type).to.equal(type)
    Code.expect(testPayment.applicationId).to.equal(applicationId)
  })

  lab.test('getByApplicationLineIdAndType() method returns a single Payment object', async () => {
    const spy = sandbox.spy(dynamicsDal, 'search')
    const { applicationLineId, type } = fakePaymentData
    const payment = await Payment.getByApplicationLineIdAndType(context, type)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(payment.applicationLineId).to.equal(applicationLineId)
  })

  lab.test(`getCardPaymentDetails() method calls getByApplicationLineIdAndType() method with type of ${CARD_PAYMENT}`, async () => {
    const spy = sandbox.spy(Payment, 'getByApplicationLineIdAndType')
    const { applicationId, applicationLineId, category, statusCode, type, title, value } = fakePaymentData
    const payment = await Payment.getCardPaymentDetails(context)
    Code.expect(spy.calledWith(context, CARD_PAYMENT)).to.equal(true)
    Code.expect(payment.applicationId).to.equal(applicationId)
    Code.expect(payment.applicationLineId).to.equal(applicationLineId)
    Code.expect(payment.category).to.equal(category)
    Code.expect(payment.statusCode).to.equal(statusCode)
    Code.expect(payment.type).to.equal(type)
    Code.expect(payment.title).to.equal(title)
    Code.expect(payment.value).to.equal(value)
  })

  lab.test(`getCardPaymentDetails() method creates a new Payment with type of ${CARD_PAYMENT}`, async () => {
    sandbox.stub(Payment, 'getByApplicationLineIdAndType').callsFake(() => {})
    const { applicationLineId } = fakePaymentData
    const payment = await Payment.getCardPaymentDetails(context)
    Code.expect(payment.applicationLineId).to.equal(applicationLineId)
    Code.expect(payment.type).to.equal(CARD_PAYMENT)
  })

  lab.test(`getBacsPaymentDetails() method calls getByApplicationLineIdAndType() method with type of ${BACS_PAYMENT}`, async () => {
    const spy = sandbox.spy(Payment, 'getByApplicationLineIdAndType')
    const { applicationId, applicationLineId, category, statusCode, type, title, value } = fakePaymentData
    const payment = await Payment.getBacsPaymentDetails(context)
    Code.expect(spy.calledWith(context, BACS_PAYMENT)).to.equal(true)
    Code.expect(payment.applicationId).to.equal(applicationId)
    Code.expect(payment.applicationLineId).to.equal(applicationLineId)
    Code.expect(payment.category).to.equal(category)
    Code.expect(payment.statusCode).to.equal(statusCode)
    Code.expect(payment.type).to.equal(type)
    Code.expect(payment.title).to.equal(title)
    Code.expect(payment.value).to.equal(value)
  })

  lab.test(`getBacsPaymentDetails() method creates a new Payment with type of ${BACS_PAYMENT}`, async () => {
    sandbox.stub(Payment, 'getByApplicationLineIdAndType').callsFake(() => {})
    context.applicationLineId = fakePaymentData.applicationLineId
    const payment = await Payment.getBacsPaymentDetails(context)
    Code.expect(payment.applicationLineId).to.equal(context.applicationLineId)
    Code.expect(payment.type).to.equal(BACS_PAYMENT)
  })

  lab.test(`getCardPaymentResult() method is successful`, async () => {
    const expectedActionDataObject = {
      ConfigurationPrefix: CONFIGURATION_PREFIX,
      LookupByPaymentReference: fakePaymentData.referenceNumber
    }
    sandbox.stub(dynamicsDal, 'callAction').callsFake(async (action, actionDataObject) => {
      Code.expect(action).to.equal('defra_get_payment_status')
      Code.expect(actionDataObject).to.equal(expectedActionDataObject)
      return { Status: true }
    })
    Code.expect(await testPayment.getCardPaymentResult(context)).to.equal(true)
  })

  lab.test(`makeCardPayment() method is successful`, async () => {
    const description = 'DESCRIPTION'
    const returnUrl = 'RETURN_URL'
    const expectedActionDataObject = {
      ConfigurationPrefix: CONFIGURATION_PREFIX,
      Amount: fakePaymentData.value,
      ReturnUrl: returnUrl,
      Description: description,
      PaymentRecord: {
        '@odata.type': 'Microsoft.Dynamics.CRM.defra_payment',
        defra_paymentid: fakePaymentData.id
      }
    }

    const actionResult = { PaymentNextUrlHref: returnUrl }

    sandbox.stub(dynamicsDal, 'callAction').callsFake(async (action, actionDataObject) => {
      Code.expect(action).to.equal('defra_create_payment_transaction')
      Code.expect(actionDataObject).to.equal(expectedActionDataObject)
      return actionResult
    })
    Code.expect(await testPayment.makeCardPayment(context, description, returnUrl)).to.equal(actionResult)
  })

  lab.test('save() method saves a new Payment object', async () => {
    const spy = sandbox.spy(dynamicsDal, 'create')
    delete testPayment.id
    await testPayment.save(context)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testPayment.id).to.equal(testPaymentId)
  })

  lab.test('save() method updates an existing Payment object', async () => {
    const spy = sandbox.spy(dynamicsDal, 'update')
    testPayment.id = testPaymentId
    await testPayment.save(context)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testPayment.id).to.equal(testPaymentId)
  })
})
