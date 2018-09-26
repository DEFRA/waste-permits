'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const BaseCheck = require('../../../src/models/checkYourAnswers/base.check')
const SiteCheck = require('../../../src/models/checkYourAnswers/site.check')

const SITE_NAME_LINE = 0
const GRID_REFERENCE_LINE = 1
const SITE_ADDRESS_LINE = 2

const fakeLocation = {
  siteName: 'SITE_NAME'
}
const fakeLocationDetail = {
  gridReference: 'GRID_REFERENCE'
}
const fakeLocationAddress = {
  fromAddressLookup: true,
  buildingNameOrNumber: 'BUILDING_NAME_OR_NUMBER',
  addressLine1: 'ADDRESS_LINE_1',
  addressLine2: 'ADDRESS_LINE_2',
  townOrCity: 'TOWN_OR_CITY',
  postcode: 'POSTCODE'
}

const prefix = 'section-site'

let sandbox

lab.beforeEach(() => {
  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous base methods
  sandbox.stub(BaseCheck.prototype, 'getLocation').value(() => Object.assign({}, fakeLocation))
  sandbox.stub(BaseCheck.prototype, 'getLocationDetail').value(() => Object.assign({}, fakeLocationDetail))
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('Site Check tests:', () => {
  lab.test('ruleSetId works correctly', async () => {
    Code.expect(SiteCheck.ruleSetId).to.equal('defra_locationrequired')
  })

  lab.experiment('buildlines', () => {
    let check
    let lines

    lab.beforeEach(async () => {
      sandbox.stub(BaseCheck.prototype, 'getLocationAddress').value(() => Object.assign({}, fakeLocationAddress))
      check = new SiteCheck()
      lines = await check.buildLines()
    })

    lab.test('(site name line) works correctly', async () => {
      const { heading, headingId, answers, links } = lines[SITE_NAME_LINE]
      const linePrefix = `${prefix}-name`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const { answer, answerId } = answers.pop()
      const { siteName } = fakeLocation
      Code.expect(answer).to.equal(siteName)
      Code.expect(answerId).to.equal(`${linePrefix}-answer`)

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/site/site-name')
      Code.expect(linkType).to.equal('site name')
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })

    lab.test('(grid reference line) works correctly', async () => {
      const { heading, headingId, answers, links } = lines[GRID_REFERENCE_LINE]
      const linePrefix = `${prefix}-grid-reference`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const { answer, answerId } = answers.pop()
      const { gridReference } = fakeLocationDetail
      Code.expect(answer).to.equal(gridReference)
      Code.expect(answerId).to.equal(`${linePrefix}-answer`)

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/site/grid-reference')
      Code.expect(linkType).to.equal('grid reference')
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })

    lab.test('(site address line) works correctly', async () => {
      const { heading, headingId, answers, links } = lines[SITE_ADDRESS_LINE]
      const linePrefix = `${prefix}-address`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const { buildingNameOrNumber, addressLine1, addressLine2, townOrCity, postcode } = fakeLocationAddress
      answers.forEach(({ answer, answerId }, answerIndex) => {
        Code.expect(answerId).to.equal(`${linePrefix}-answer-${answerIndex + 1}`)
        switch (answerIndex) {
          case 0: {
            Code.expect(answer).to.equal(`${buildingNameOrNumber}, ${addressLine1}`)
            break
          }
          case 1: {
            Code.expect(answer).to.equal(addressLine2)
            break
          }
          case 2: {
            Code.expect(answer).to.equal(townOrCity)
            break
          }
          case 3: {
            Code.expect(answer).to.equal(postcode)
            break
          }
        }
      })

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/site/address/postcode')
      Code.expect(linkType).to.equal('site address')
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })
  })

  lab.test('site address line has correct link for manually entered address', async () => {
    sandbox.stub(BaseCheck.prototype, 'getLocationAddress').value(() => Object.assign({}, fakeLocationAddress, { fromAddressLookup: false }))
    const check = new SiteCheck()
    const lines = await check.buildLines()
    const { links } = lines[SITE_ADDRESS_LINE]

    const { link, linkId, linkType } = links.pop()
    Code.expect(link).to.equal('/site/address/address-manual')
    Code.expect(linkType).to.equal('site address')
    Code.expect(linkId).to.equal(`${prefix}-address-link`)
  })
})
