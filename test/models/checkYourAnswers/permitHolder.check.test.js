'use strict'

const Merge = require('deepmerge')
const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const BaseCheck = require('../../../src/models/checkYourAnswers/base.check')
const PermitHolderCheck = require('../../../src/models/checkYourAnswers/permitHolder.check')

const COMPANY_LINE = 0
const DIRECTORS_LINE = 1
const CONVICTIONS_LINE = 2
const BANKRUPTCY_LINE = 3

const fakeApplication = {
  tradingName: 'TRADING_NAME',
  relevantOffences: true,
  relevantOffencesDetails: 'CONVICTION DETAILS 1\nCONVICTION DETAILS 2',
  bankruptcy: true,
  bankruptcyDetails: 'BANKRUPTCY DETAILS\nINSOLVENCY DETAILS'
}
const fakeCompany = {
  name: 'NAME',
  address: 'ADDRESS'
}
const fakeCompanyAccount = {
  companyNumber: 'COMPANY_NUMBER'
}
const fakeDirector = {
  firstName: 'FIRSTNAME',
  lastName: 'LASTNAME',
  dob: {
    day: 1,
    month: 2,
    year: 2003
  }
}
const prefix = 'section-permit-holder'

const getMonth = (month) => [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
][month - 1]

let sandbox

lab.beforeEach(() => {
  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous base methods
  sandbox.stub(BaseCheck.prototype, 'getApplication').value(() => Merge({}, fakeApplication))
  sandbox.stub(BaseCheck.prototype, 'getCompany').value(() => Merge({}, fakeCompany))
  sandbox.stub(BaseCheck.prototype, 'getCompanyAccount').value(() => Merge({}, fakeCompanyAccount))
  sandbox.stub(BaseCheck.prototype, 'getDirectors').value(() => [Merge({}, fakeDirector)])
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('PermitHolder Check tests:', () => {
  lab.test('rulesetId works correctly', async () => {
    Code.expect(PermitHolderCheck.rulesetId).to.equal('defra_pholderdetailsrequired')
  })

  lab.experiment('buildlines', () => {
    let check
    let lines

    lab.beforeEach(async () => {
      check = new PermitHolderCheck()
      lines = await check.buildLines()
    })

    lab.test('(company line) works correctly', async () => {
      const {heading, headingId, answers, links} = lines[COMPANY_LINE]
      const linePrefix = `${prefix}-company`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const {name, address} = fakeCompany
      const {tradingName} = fakeApplication
      const {companyNumber} = fakeCompanyAccount
      answers.forEach(({answer, answerId}, answerIndex) => {
        Code.expect(answerId).to.equal(`${linePrefix}-answer-${answerIndex + 1}`)
        switch (answerIndex) {
          case 0:
            Code.expect(answer).to.equal(name)
            break
          case 1:
            Code.expect(answer).to.equal(`Trading as: ${tradingName}`)
            break
          case 2:
            Code.expect(answer).to.equal(address)
            break
          case 3:
            Code.expect(answer).to.equal(`Company number: ${companyNumber}`)
            break
        }
      })
      const {link, linkId, linkType} = links.pop()
      Code.expect(link).to.equal('/permit-holder/company/number')
      Code.expect(linkType).to.equal('permit holder')
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })

    lab.test('(directors line) works correctly', async () => {
      const {heading, headingId, answers, links} = lines[DIRECTORS_LINE]
      const linePrefix = `${prefix}-director`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const {answer, answerId} = answers.pop()
      const {firstName, lastName, dob: {day, month, year}} = fakeDirector
      Code.expect(answer).to.equal(`${firstName} ${lastName}: ${day} ${getMonth(month)} ${year}`)
      Code.expect(answerId).to.equal(`${linePrefix}-answer`)

      const {link, linkId, linkType} = links.pop()
      Code.expect(link).to.equal('/permit-holder/company/director-date-of-birth')
      Code.expect(linkType).to.equal(`director's date of birth`)
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })

    lab.test('(convictions line) works correctly', async () => {
      const {heading, headingId, answers, links} = lines[CONVICTIONS_LINE]
      const linePrefix = `${prefix}-convictions`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const {relevantOffencesDetails} = fakeApplication
      answers.forEach(({answer, answerId}, answerIndex) => {
        Code.expect(answerId).to.equal(`${linePrefix}-answer-${answerIndex + 1}`)
        switch (answerIndex) {
          case 0:
            Code.expect(answer).to.equal('You have declared these convictions:')
            break
          case 1:
            Code.expect(answer).to.equal(relevantOffencesDetails.split('\n')[0])
            break
          case 2:
            Code.expect(answer).to.equal(relevantOffencesDetails.split('\n')[1])
            break
        }
      })
      const {link, linkId, linkType} = links.pop()
      Code.expect(link).to.equal('/permit-holder/company/declare-offences')
      Code.expect(linkType).to.equal('offences')
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })

    lab.test('(bankruptcy line) works correctly', async () => {
      const {heading, headingId, answers, links} = lines[BANKRUPTCY_LINE]
      const linePrefix = `${prefix}-bankruptcy-or-insolvency`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const {bankruptcyDetails} = fakeApplication
      answers.forEach(({answer, answerId}, answerIndex) => {
        Code.expect(answerId).to.equal(`${linePrefix}-answer-${answerIndex + 1}`)
        switch (answerIndex) {
          case 0:
            Code.expect(answer).to.equal('You have declared these bankruptcy or insolvency proceedings:')
            break
          case 1:
            Code.expect(answer).to.equal(bankruptcyDetails.split('\n')[0])
            break
          case 2:
            Code.expect(answer).to.equal(bankruptcyDetails.split('\n')[1])
            break
        }
      })
      const {link, linkId, linkType} = links.pop()
      Code.expect(link).to.equal('/permit-holder/company/bankruptcy-insolvency')
      Code.expect(linkType).to.equal('bankruptcy or insolvency')
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })
  })
})
