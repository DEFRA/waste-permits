'use strict'

const Merge = require('deepmerge')
const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

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

let fakeApplication
let fakeCompanyAccount
let fakeDirector
let fakePartner
let fakeIndividualPermitHolder
let fakeIndividualPermitHolderDetails
let fakeIndividualPermitHolderAddress
let fakeCompanyRegisteredAddress
let fakePermitHolderType
let fakeCompanySecretary
let fakeMainAddress
let fakeResponsibleOfficer

let sandbox

lab.beforeEach(() => {
  fakeApplication = {
    tradingName: 'TRADING_NAME',
    useTradingName: true,
    relevantOffences: true,
    relevantOffencesDetails: 'CONVICTION DETAILS 1\nCONVICTION DETAILS 2',
    bankruptcy: true,
    bankruptcyDetails: 'BANKRUPTCY DETAILS\nINSOLVENCY DETAILS'
  }

  fakeCompanyAccount = {
    accountName: 'COMPANY_NAME',
    companyNumber: 'COMPANY_NUMBER'
  }

  fakeCompanySecretary = {
    email: 'COMPANY_SECRETARY_EMAIL'
  }

  fakeDirector = {
    firstName: 'FIRSTNAME',
    lastName: 'LASTNAME',
    dateOfBirth: '2003-2-1'
  }

  fakePartner = {
    firstName: 'FIRSTNAME',
    lastName: 'LASTNAME',
    email: 'PARTNER_EMAIL',
    telephone: 'PARTNER_TELEPHONE',
    dateOfBirth: '2003-2-11',
    fullAddress: 'FULL_ADDRESS'
  }

  fakeIndividualPermitHolder = {
    firstName: 'FIRSTNAME',
    lastName: 'LASTNAME',
    email: 'EMAIL'
  }

  fakeResponsibleOfficer = {
    firstName: 'FIRSTNAME',
    lastName: 'LASTNAME',
    jobTitle: 'JOB_TITLE',
    email: 'EMAIL'
  }

  fakeIndividualPermitHolderDetails = {
    dateOfBirth: '1999-11-23',
    telephone: 'TELEPHONE'
  }

  fakeIndividualPermitHolderAddress = {
    buildingNameOrNumber: '5',
    addressLine1: 'A ROAD',
    addressLine2: 'AN AREA',
    townOrCity: 'A TOWN',
    postcode: 'BS1 6AD'
  }

  fakeCompanyRegisteredAddress = {
    buildingNameOrNumber: '10',
    addressLine1: 'A STREET',
    addressLine2: 'A SUBURB',
    townOrCity: 'A CITY',
    postcode: 'SB14 6QG'
  }

  fakeMainAddress = {
    buildingNameOrNumber: '25',
    addressLine1: 'A CLOSE',
    addressLine2: 'A SUBURB',
    townOrCity: 'A MAIN CITY',
    postcode: 'SB16 7GB'
  }

  fakePermitHolderType = {
    type: 'Limited company'
  }

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous base methods
  sandbox.stub(BaseCheck.prototype, 'getApplication').value(() => Merge({}, fakeApplication))
  sandbox.stub(BaseCheck.prototype, 'getPermitHolderType').value(() => Merge({}, fakePermitHolderType))
  sandbox.stub(BaseCheck.prototype, 'getCompanyAccount').value(() => Merge({}, fakeCompanyAccount))
  sandbox.stub(BaseCheck.prototype, 'getCompanySecretaryDetails').value(() => Merge({}, fakeCompanySecretary))
  sandbox.stub(BaseCheck.prototype, 'getCompanyRegisteredAddress').value(() => Merge({}, fakeCompanyRegisteredAddress))
  sandbox.stub(BaseCheck.prototype, 'getDirectors').value(() => [Merge({}, fakeDirector)])
  sandbox.stub(BaseCheck.prototype, 'getPartners').value(() => [Merge({}, fakePartner)])
  sandbox.stub(BaseCheck.prototype, 'getResponsibleOfficer').value(() => Merge({}, fakeResponsibleOfficer))
  sandbox.stub(BaseCheck.prototype, 'getMainAddress').value(() => Merge({}, fakeMainAddress))
  sandbox.stub(BaseCheck.prototype, 'getIndividualPermitHolder').value(() => Merge({}, fakeIndividualPermitHolder))
  sandbox.stub(BaseCheck.prototype, 'getIndividualPermitHolderAddress').value(() => Merge({}, fakeIndividualPermitHolderAddress))
  sandbox.stub(BaseCheck.prototype, 'getIndividualPermitHolderDetails').value(() => Merge({}, fakeIndividualPermitHolderDetails))
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

      const { buildingNameOrNumber, addressLine1, addressLine2, townOrCity, postcode } = fakeCompanyRegisteredAddress
      const { tradingName } = fakeApplication
      const { accountName, companyNumber } = fakeCompanyAccount
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
      fakePermitHolderType.type = 'Partnership'
      const lines = await buildLines()
      const { heading, headingId, answers, links } = lines[PARTNERSHIP_NAME_LINE]
      const linePrefix = `${prefix}-partnership-name`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const { answer, answerId } = answers.pop()
      const { tradingName } = fakeApplication
      Code.expect(answer).to.equal(tradingName)
      Code.expect(answerId).to.equal(`${linePrefix}-answer`)

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/permit-holder/partners/trading-name')
      Code.expect(linkType).to.equal('partnership name')
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })

    lab.test('(partners line) works correctly', async () => {
      fakePermitHolderType.type = 'Partnership'
      const lines = await buildLines()
      const { heading, headingId, answers, links } = lines[PARTNERSHIP_PERMIT_HOLDER_LINE]
      const linePrefix = `${prefix}-partner`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const { answer, answerId } = answers.shift()
      Code.expect(answer).to.equal('The partners will be the permit holders and each will be responsible for the operation of the permit.')
      Code.expect(answerId).to.equal(`${linePrefix}-answer-1`)

      const { firstName, lastName, email, telephone, dateOfBirth, fullAddress } = fakePartner
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
      fakeApplication.isIndividual = true
      const lines = await buildLines()
      const { heading, headingId, answers, links } = lines[PERMIT_HOLDER_LINE]
      const linePrefix = `${prefix}-individual`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const { buildingNameOrNumber, addressLine1, addressLine2, townOrCity, postcode } = fakeIndividualPermitHolderAddress
      const { tradingName } = fakeApplication
      const { firstName, lastName, email } = fakeIndividualPermitHolder
      const { telephone, dateOfBirth } = fakeIndividualPermitHolderDetails
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
            Code.expect(answer).to.equal(`${buildingNameOrNumber}, ${addressLine1}`)
            break
          case 7:
            Code.expect(answer).to.equal(addressLine2)
            break
          case 8:
            Code.expect(answer).to.equal(townOrCity)
            break
          case 9:
            Code.expect(answer).to.equal(postcode)
            break
        }
      })
      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/permit-holder/name')
      Code.expect(linkType).to.equal('individual details')
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })

    lab.test('(responsible officer line) works correctly', async () => {
      fakePermitHolderType.type = 'Local authority or public body'
      const lines = await buildLines()
      const { heading, headingId, answers, links } = lines[RESPONSIBLE_OFFICER_LINE]
      const linePrefix = `${prefix}-responsible-officer`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const { firstName, lastName, jobTitle } = fakeResponsibleOfficer

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
      fakePermitHolderType.type = 'Local authority or public body'
      const lines = await buildLines()
      const { heading, headingId, answers, links } = lines[PERMIT_HOLDER_LINE]
      const linePrefix = `${prefix}-permit-holder`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const { tradingName } = fakeApplication
      const { buildingNameOrNumber, addressLine1, addressLine2, townOrCity, postcode } = fakeMainAddress

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
      const { firstName, lastName, dateOfBirth } = fakeDirector
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
      const { email } = fakeCompanySecretary
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

      const { relevantOffencesDetails } = fakeApplication
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

      const { bankruptcyDetails } = fakeApplication
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
