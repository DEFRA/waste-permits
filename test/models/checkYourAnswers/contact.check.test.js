'use strict'

const Merge = require('deepmerge')
const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const BaseCheck = require('../../../src/models/checkYourAnswers/base.check')
const ContactCheck = require('../../../src/models/checkYourAnswers/contact.check')

const CONTACT_LINE = 0
const AGENT_LINE = 1
const TELEPHONE_LINE = 2
const EMAIL_LINE = 3

const fakeContact = {
  firstName: 'CONTACT_FIRSTNAME',
  lastName: 'CONTACT_LASTNAME',
  email: 'CONTACT_EMAIL'
}
const fakePrimaryContact = {
  telephone: 'PRIMARY_CONTACT_TELEPHONE'
}
const fakeAgentAccount = {
  description: 'This person is an agent or consultant',
  accountName: 'AGENT_ACCOUNT_NAME'
}

const prefix = 'section-contact'
let sandbox

lab.beforeEach(() => {
  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous base methods
  sandbox.stub(BaseCheck.prototype, 'getContact').value(() => Merge({}, fakeContact))
  sandbox.stub(BaseCheck.prototype, 'getPrimaryContactDetails').value(() => Merge({}, fakePrimaryContact))
  sandbox.stub(BaseCheck.prototype, 'getAgentAccount').value(() => Merge({}, fakeAgentAccount))
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('Contact Check tests:', () => {
  lab.test('rulesetId works correctly', async () => {
    Code.expect(ContactCheck.rulesetId).to.equal('defra_contactdetailsrequired')
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
      const { firstName, lastName } = fakeContact
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

      const { description, accountName } = fakeAgentAccount
      answers.forEach(({ answer, answerId }, answerIndex) => {
        Code.expect(answerId).to.equal(`${linePrefix}-answer-${answerIndex + 1}`)
        switch (answerIndex) {
          case 0: {
            Code.expect(answer).to.equal(description)
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
      Code.expect(linkType).to.equal(`agent details`)
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })

    lab.test('(telephone line) works correctly', async () => {
      const { heading, headingId, answers, links } = lines[TELEPHONE_LINE]
      const linePrefix = `${prefix}-telephone`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const { answer, answerId } = answers.pop()
      const { telephone } = fakePrimaryContact
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
      const { email } = fakeContact
      Code.expect(answer).to.equal(email)
      Code.expect(answerId).to.equal(`${linePrefix}-answer`)

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/contact-details')
      Code.expect(linkType).to.equal('main contact email')
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })
  })
})
