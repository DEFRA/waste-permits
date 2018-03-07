'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const BACS_PAYMENT = 910400005
const CARD_PAYMENT = 910400000

const Payment = require('../../src/models/payment.model')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')

let dynamicsCreateStub
let dynamicsSearchStub
let dynamicsUpdateStub
let sandbox

let testPayment
const fakePaymentData = {
  applicationId: 'APPLICATION_ID',
  applicationLineId: 'APPLICATION_LINE_ID',
  category: 'CATEGORY',
  statusCode: 'STATUS_CODE',
  type: 'TYPE',
  value: 'VALUE'
}
const testPaymentId = 'PAYMENT_ID'

const authToken = 'THE_AUTH_TOKEN'

lab.beforeEach(() => {
  testPayment = new Payment(fakePaymentData)

  dynamicsSearchStub = DynamicsDalService.prototype.search
  DynamicsDalService.prototype.search = () => {
    // Dynamics Payment object
    return {
      value: [{
        _defra_applicationid_value: testPayment.applicationId,
        _defra_applicationlineid_value: testPayment.applicationLineId,
        defra_paymentcategory: testPayment.category,
        statuscode: testPayment.statusCode,
        defra_type: testPayment.type,
        defra_paymentvalue: testPayment.value
      }]
    }
  }

  dynamicsCreateStub = DynamicsDalService.prototype.create
  DynamicsDalService.prototype.create = () => testPaymentId

  dynamicsUpdateStub = DynamicsDalService.prototype.update
  DynamicsDalService.prototype.update = (dataObject) => dataObject.id

  // Create a sinon sandbox to prevent the "spy already wrapped errors" when a "spy.calledWith" fails
  sandbox = sinon.createSandbox()
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()

  // Restore stubbed methods
  DynamicsDalService.prototype.create = dynamicsCreateStub
  DynamicsDalService.prototype.search = dynamicsSearchStub
  DynamicsDalService.prototype.update = dynamicsUpdateStub
})

lab.experiment('Payment Model tests:', () => {
  lab.test('Constructor creates a Payment object correctly', () => {
    const emptyPayment = new Payment({})
    Code.expect(emptyPayment.applicationId).to.be.undefined()

    const {type, applicationId} = fakePaymentData
    Code.expect(testPayment.type).to.equal(type)
    Code.expect(testPayment.applicationId).to.equal(applicationId)
  })

  lab.test('getByApplicationLineIdAndType() method returns a single Payment object', async () => {
    const spy = sandbox.spy(DynamicsDalService.prototype, 'search')
    const {applicationLineId, type} = fakePaymentData
    const payment = await Payment.getByApplicationLineIdAndType(authToken, applicationLineId, type)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(payment.applicationLineId).to.equal(applicationLineId)
  })

  lab.test(`getCardPaymentDetails() method calls getByApplicationLineIdAndType() method with type of ${CARD_PAYMENT}`, async () => {
    const spy = sandbox.spy(Payment, 'getByApplicationLineIdAndType')
    const {applicationId, applicationLineId, category, statusCode, type, value} = fakePaymentData
    const payment = await Payment.getCardPaymentDetails(authToken, applicationLineId)
    Code.expect(spy.calledWith(authToken, applicationLineId, CARD_PAYMENT)).to.equal(true)
    Code.expect(payment.applicationId).to.equal(applicationId)
    Code.expect(payment.applicationLineId).to.equal(applicationLineId)
    Code.expect(payment.category).to.equal(category)
    Code.expect(payment.statusCode).to.equal(statusCode)
    Code.expect(payment.type).to.equal(type)
    Code.expect(payment.value).to.equal(value)
  })

  lab.test(`getCardPaymentDetails() method creates a new Payment with type of ${CARD_PAYMENT}`, async () => {
    sandbox.stub(Payment, 'getByApplicationLineIdAndType').callsFake(() => {})
    const {applicationLineId} = fakePaymentData
    const payment = await Payment.getCardPaymentDetails(authToken, applicationLineId)
    Code.expect(payment.applicationLineId).to.equal(applicationLineId)
    Code.expect(payment.type).to.equal(CARD_PAYMENT)
  })

  lab.test(`getBacsPaymentDetails() method calls getByApplicationLineIdAndType() method with type of ${BACS_PAYMENT}`, async () => {
    const spy = sandbox.spy(Payment, 'getByApplicationLineIdAndType')
    const {applicationId, applicationLineId, category, statusCode, type, value} = fakePaymentData
    const payment = await Payment.getBacsPaymentDetails(authToken, applicationLineId)
    Code.expect(spy.calledWith(authToken, applicationLineId, BACS_PAYMENT)).to.equal(true)
    Code.expect(payment.applicationId).to.equal(applicationId)
    Code.expect(payment.applicationLineId).to.equal(applicationLineId)
    Code.expect(payment.category).to.equal(category)
    Code.expect(payment.statusCode).to.equal(statusCode)
    Code.expect(payment.type).to.equal(type)
    Code.expect(payment.value).to.equal(value)
  })

  lab.test(`getBacsPaymentDetails() method creates a new Payment with type of ${BACS_PAYMENT}`, async () => {
    sandbox.stub(Payment, 'getByApplicationLineIdAndType').callsFake(() => {})
    const {applicationLineId} = fakePaymentData
    const payment = await Payment.getBacsPaymentDetails(authToken, applicationLineId)
    Code.expect(payment.applicationLineId).to.equal(applicationLineId)
    Code.expect(payment.type).to.equal(BACS_PAYMENT)
  })

  lab.test('save() method saves a new Payment object', async () => {
    const spy = sandbox.spy(DynamicsDalService.prototype, 'create')
    await testPayment.save(authToken)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testPayment.id).to.equal(testPaymentId)
  })

  lab.test('save() method updates an existing Payment object', async () => {
    const spy = sandbox.spy(DynamicsDalService.prototype, 'update')
    testPayment.id = testPaymentId
    await testPayment.save(authToken)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testPayment.id).to.equal(testPaymentId)
  })
})
