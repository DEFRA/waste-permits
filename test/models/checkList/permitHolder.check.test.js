'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const BaseCheck = require('../../../src/models/checkList/base.check')
const PermitHolderCheck = require('../../../src/models/checkList/permitHolder.check')

const PERMIT_HOLDER_TYPE_LINE = 0
const PERMIT_HOLDER_LINE = 1
const PARTNERSHIP_NAME_LINE = 1
const PARTNERSHIP_PERMIT_HOLDER_LINE = 2
const RESPONSIBLE_OFFICER_LINE = 2
const DIRECTORS_LINE = 2
const COMPANY_SECRETARY_EMAIL_LINE = 3
const CONVICTIONS_LINE = 4
const BANKRUPTCY_LINE = 5

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
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous base methods
  sandbox.stub(BaseCheck.prototype, 'getApplication').value(() => mocks.application)
  sandbox.stub(BaseCheck.prototype, 'getPermitHolderType').value(() => mocks.permitHolderType)
  sandbox.stub(BaseCheck.prototype, 'getCompanyAccount').value(() => mocks.account)
  sandbox.stub(BaseCheck.prototype, 'getCompanyRegisteredAddress').value(() => mocks.address)
  sandbox.stub(BaseCheck.prototype, 'getMainAddress').value(() => mocks.address)
  sandbox.stub(BaseCheck.prototype, 'listContactDetails').value(() => [mocks.contactDetail])
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('PermitHolder Check tests:', () => {
  lab.test('ruleSetId works correctly', async () => {
    Code.expect(PermitHolderCheck.ruleSetId).to.equal('defra_pholderdetailsrequired')
  })

  lab.experiment('buildlines', () => {
    const buildLines = async () => {
      const check = new PermitHolderCheck()
      return check.buildLines()
    }

    lab.test('(permit holder type) works correctly', async () => {
      const lines = await buildLines()
      const { heading, headingId, answers, links } = lines[PERMIT_HOLDER_TYPE_LINE]
      const linePrefix = `${prefix}-type`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const { answer, answerId } = answers.pop()
      Code.expect(answer).to.equal('Limited company')
      Code.expect(answerId).to.equal(`${linePrefix}-answer`)

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/permit-holder')
      Code.expect(linkType).to.equal(`permit holder`)
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })

    lab.test('(company line) works correctly', async () => {
      const lines = await buildLines()
      const { heading, headingId, answers, links } = lines[PERMIT_HOLDER_LINE]
      const linePrefix = `${prefix}-company`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const { buildingNameOrNumber, addressLine1, addressLine2, townOrCity, postcode } = mocks.address
      const { tradingName } = mocks.application
      const { accountName, companyNumber } = mocks.account
      answers.forEach(({ answer, answerId }, answerIndex) => {
        Code.expect(answerId).to.equal(`${linePrefix}-answer-${answerIndex + 1}`)
        switch (answerIndex) {
          case 0:
            Code.expect(answer).to.equal(accountName)
            break
          case 1:
            Code.expect(answer).to.equal(`Trading as: ${tradingName}`)
            break
          case 2:
            Code.expect(answer).to.equal(`${buildingNameOrNumber}, ${addressLine1}`)
            break
          case 3:
            Code.expect(answer).to.equal(addressLine2)
            break
          case 4:
            Code.expect(answer).to.equal(townOrCity)
            break
          case 5:
            Code.expect(answer).to.equal(postcode)
            break
          case 6:
            Code.expect(answer).to.equal(`Company number: ${companyNumber}`)
            break
        }
      })
      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/permit-holder/company/number')
      Code.expect(linkType).to.equal('company details')
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })

    lab.test('(partnership name line) works correctly', async () => {
      mocks.permitHolderType.type = 'Partnership'
      const lines = await buildLines()
      const { heading, headingId, answers, links } = lines[PARTNERSHIP_NAME_LINE]
      const linePrefix = `${prefix}-partnership-name`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const { answer, answerId } = answers.pop()
      const { tradingName } = mocks.application
      Code.expect(answer).to.equal(tradingName)
      Code.expect(answerId).to.equal(`${linePrefix}-answer`)

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/permit-holder/partners/trading-name')
      Code.expect(linkType).to.equal('partnership name')
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })

    lab.test('(partners line) works correctly', async () => {
      mocks.permitHolderType.type = 'Partnership'
      const lines = await buildLines()
      const { heading, headingId, answers, links } = lines[PARTNERSHIP_PERMIT_HOLDER_LINE]
      const linePrefix = `${prefix}-partner`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const { answer, answerId } = answers.shift()
      Code.expect(answer).to.equal('The partners will be the permit holders and each will be responsible for the operation of the permit.')
      Code.expect(answerId).to.equal(`${linePrefix}-answer-1`)

      const { firstName = '', lastName = '', email = '', telephone = '', dateOfBirth = '---', fullAddress = '' } = mocks.contactDetail
      const [year, month, day] = dateOfBirth.split('-')

      answers.forEach(({ answer, answerId }, answerIndex) => {
        Code.expect(answerId).to.equal(`${linePrefix}-answer-${answerIndex + 2}`)
        switch (answerIndex) {
          case 0:
            Code.expect(answer).to.equal({ blankLine: true })
            break
          case 1:
            Code.expect(answer).to.equal(`${firstName} ${lastName}`)
            break
          case 2:
            Code.expect(answer).to.equal(fullAddress)
            break
          case 3:
            Code.expect(answer).to.equal(email)
            break
          case 4:
            Code.expect(answer).to.equal(`Telephone: ${telephone}`)
            break
          case 5:
            Code.expect(answer).to.equal(`Date of birth: ${day} ${getMonth(month)} ${year}`)
            break
        }
      })

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/permit-holder/partners/list')
      Code.expect(linkType).to.equal('partners')
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })

    lab.test('(individual line) works correctly', async () => {
      mocks.application.applicantType = 910400000
      const lines = await buildLines()
      const { heading, headingId, answers, links } = lines[PERMIT_HOLDER_LINE]
      const linePrefix = `${prefix}-individual`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const { tradingName } = mocks.application
      const { firstName = '', lastName = '', email = '', telephone = '', dateOfBirth = '---', fullAddress = '' } = mocks.contactDetail
      const [year, month, day] = dateOfBirth.split('-')
      answers.forEach(({ answer, answerId }, answerIndex) => {
        Code.expect(answerId).to.equal(`${linePrefix}-answer-${answerIndex + 1}`)
        switch (answerIndex) {
          case 0:
            Code.expect(answer).to.equal(`${firstName} ${lastName}`)
            break
          case 1:
            Code.expect(answer).to.equal(`Trading as: ${tradingName}`)
            break
          case 2:
            Code.expect(answer).to.equal(email)
            break
          case 3:
            Code.expect(answer).to.equal(`Telephone: ${telephone}`)
            break
          case 4:
            Code.expect(answer).to.equal(`Date of birth: ${day} ${getMonth(month)} ${year}`)
            break
          case 5:
            Code.expect(answer).to.equal({ blankLine: true })
            break
          case 6:
            Code.expect(answer).to.equal(`${fullAddress}`)
            break
        }
      })
      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/permit-holder/name')
      Code.expect(linkType).to.equal('individual details')
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })

    lab.test('(responsible officer line) works correctly', async () => {
      mocks.permitHolderType.type = 'Local authority or public body'
      const lines = await buildLines()
      const { heading, headingId, answers, links } = lines[RESPONSIBLE_OFFICER_LINE]
      const linePrefix = `${prefix}-responsible-officer`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const { firstName = '', lastName = '', jobTitle = '' } = mocks.contactDetail

      answers.forEach(({ answer, answerId }, answerIndex) => {
        Code.expect(answerId).to.equal(`${linePrefix}-answer-${answerIndex + 1}`)
        switch (answerIndex) {
          case 0:
            Code.expect(answer).to.equal(`${firstName} ${lastName}`)
            break
          case 1:
            Code.expect(answer).to.equal(jobTitle)
            break
        }
      })

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/permit-holder/public-body/officer')
      Code.expect(linkType).to.equal(`responsible officer`)
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })

    lab.test('(public body line) works correctly', async () => {
      mocks.permitHolderType.type = 'Local authority or public body'
      const lines = await buildLines()
      const { heading, headingId, answers, links } = lines[PERMIT_HOLDER_LINE]
      const linePrefix = `${prefix}-permit-holder`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const { tradingName } = mocks.application
      const { buildingNameOrNumber, addressLine1, addressLine2, townOrCity, postcode } = mocks.address

      answers.forEach(({ answer, answerId }, answerIndex) => {
        Code.expect(answerId).to.equal(`${linePrefix}-answer-${answerIndex + 1}`)
        switch (answerIndex) {
          case 0:
            Code.expect(answer).to.equal(tradingName)
            break
          case 1:
            Code.expect(answer).to.equal(`${buildingNameOrNumber}, ${addressLine1}`)
            break
          case 2:
            Code.expect(answer).to.equal(addressLine2)
            break
          case 3:
            Code.expect(answer).to.equal(townOrCity)
            break
          case 4:
            Code.expect(answer).to.equal(postcode)
            break
        }
      })

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/permit-holder/public-body/name')
      Code.expect(linkType).to.equal(`permit holder`)
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })

    lab.test('(directors line) works correctly', async () => {
      const lines = await buildLines()
      const { heading, headingId, answers, links } = lines[DIRECTORS_LINE]
      const linePrefix = `${prefix}-director`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const { answer, answerId } = answers.pop()
      const { firstName = '', lastName = '', dateOfBirth = '---' } = mocks.contactDetail
      const [year, month, day] = dateOfBirth.split('-')
      Code.expect(answer).to.equal(`${firstName} ${lastName}: ${day} ${getMonth(month)} ${year}`)
      Code.expect(answerId).to.equal(`${linePrefix}-answer`)

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/permit-holder/company/director-date-of-birth')
      Code.expect(linkType).to.equal(`director's date of birth`)
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })

    lab.test('(company secretary email line) works correctly', async () => {
      const lines = await buildLines()
      const { heading, headingId, answers, links } = lines[COMPANY_SECRETARY_EMAIL_LINE]
      const linePrefix = `${prefix}-company-secretary-email`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const { answer, answerId } = answers.pop()
      const { email } = mocks.contactDetail
      Code.expect(answer).to.equal(email)
      Code.expect(answerId).to.equal(`${linePrefix}-answer`)

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/permit-holder/company/director-email')
      Code.expect(linkType).to.equal('company secretary or director email')
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })

    lab.test('(convictions line) works correctly', async () => {
      const lines = await buildLines()
      const { heading, headingId, answers, links } = lines[CONVICTIONS_LINE]
      const linePrefix = `${prefix}-convictions`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const { relevantOffencesDetails } = mocks.application
      answers.forEach(({ answer, answerId }, answerIndex) => {
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
      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/permit-holder/company/declare-offences')
      Code.expect(linkType).to.equal('offences')
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })

    lab.test('(bankruptcy line) works correctly', async () => {
      const lines = await buildLines()
      const { heading, headingId, answers, links } = lines[BANKRUPTCY_LINE]
      const linePrefix = `${prefix}-bankruptcy-or-insolvency`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const { bankruptcyDetails } = mocks.application
      answers.forEach(({ answer, answerId }, answerIndex) => {
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
      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/permit-holder/company/bankruptcy-insolvency')
      Code.expect(linkType).to.equal('bankruptcy or insolvency')
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })
  })
})
