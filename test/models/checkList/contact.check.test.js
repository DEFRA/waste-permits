'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const BaseCheck = require('../../../src/models/checkList/base.check')
const ContactCheck = require('../../../src/models/checkList/contact.check')

const CONTACT_LINE = 0
const AGENT_LINE = 1
const TELEPHONE_LINE = 2
const EMAIL_LINE = 3

const prefix = 'section-contact'
let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous base methods
  sandbox.stub(BaseCheck.prototype, 'getAgentAccount').value(async () => mocks.account)
  sandbox.stub(BaseCheck.prototype, 'getContactDetails').value(async () => mocks.contactDetail)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('Contact Check tests:', () => {
  lab.test('ruleSetId works correctly', async () => {
    Code.expect(ContactCheck.task.ruleSetId).to.equal('defra_contactdetailsrequired')
  })

  lab.experiment('buildlines', () => {
    let check
    let lines

    lab.beforeEach(async () => {
      check = new ContactCheck()
      lines = await check.buildLines()
    })

    lab.test('(contact line) works correctly', async () => {
      const { heading, headingId, answers, links } = lines[CONTACT_LINE]
      const linePrefix = `${prefix}-name`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const { answer, answerId } = answers.pop()
      const { firstName, lastName } = mocks.contactDetail
      Code.expect(answer).to.equal(`${firstName} ${lastName}`)
      Code.expect(answerId).to.equal(`${linePrefix}-answer`)

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/contact-details')
      Code.expect(linkType).to.equal('contact details')
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })

    lab.test('(agent line) works correctly', async () => {
      const { heading, headingId, answers, links } = lines[AGENT_LINE]
      const linePrefix = `${prefix}-agent`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const { accountName } = mocks.account
      answers.forEach(({ answer, answerId }, answerIndex) => {
        Code.expect(answerId).to.equal(`${linePrefix}-answer-${answerIndex + 1}`)
        switch (answerIndex) {
          case 0: {
            Code.expect(answer).to.equal('This person is an agent or consultant')
            break
          }
          case 1: {
            Code.expect(answer).to.equal(accountName)
            break
          }
        }
      })

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/contact-details')
      Code.expect(linkType).to.equal('agent details')
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })

    lab.test('(telephone line) works correctly', async () => {
      const { heading, headingId, answers, links } = lines[TELEPHONE_LINE]
      const linePrefix = `${prefix}-telephone`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const { answer, answerId } = answers.pop()
      const { telephone } = mocks.contactDetail
      Code.expect(answer).to.equal(telephone)
      Code.expect(answerId).to.equal(`${linePrefix}-answer`)

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/contact-details')
      Code.expect(linkType).to.equal('contact telephone number')
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })

    lab.test('(main contact email line) works correctly', async () => {
      const { heading, headingId, answers, links } = lines[EMAIL_LINE]
      const linePrefix = `${prefix}-email`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const { answer, answerId } = answers.pop()
      const { email } = mocks.contactDetail
      Code.expect(answer).to.equal(email)
      Code.expect(answerId).to.equal(`${linePrefix}-answer`)

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/contact-details')
      Code.expect(linkType).to.equal('main contact email')
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })
  })
})
