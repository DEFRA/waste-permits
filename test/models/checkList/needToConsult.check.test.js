'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const BaseCheck = require('../../../src/models/checkList/base.check')
const NeedToConsultCheck = require('../../../src/models/checkList/needToConsult.check')

const prefix = 'section-consult'

let sandbox
let mocks
let check
let lines

lab.beforeEach(() => {
  mocks = new Mocks()
  mocks.dataStore.data.consult = {
    none: true
  }

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()
  sandbox.stub(BaseCheck.prototype, 'getNeedToConsult').value(async () => mocks.needToConsult)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('Consultee tests:', () => {
  lab.experiment('buildlines', () => {

    lab.test('(consultee line) works correctly for None', async () => {
      mocks.needToConsult.none = true

      check = new NeedToConsultCheck()
      lines = await check.buildLines()
      const { heading, headingId, answers, links } = lines[0]

      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${prefix}-heading`)

      Code.expect(answers.length).to.equal(1)
      const { answer, answerId } = answers.pop()
      Code.expect(answer).to.equal('None')
      Code.expect(answerId).to.equal(`${prefix}-answer`)

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/consultation/names')
      Code.expect(linkType).to.equal('organisation')
      Code.expect(linkId).to.equal(`${prefix}-link`)
    })

    lab.test('(consultee line) works correctly for releases', async () => {
      mocks.needToConsult.sewer = true
      mocks.needToConsult.sewerageUndertaker = 'SEWERAGE UNDERTAKER'
      mocks.needToConsult.harbour = true
      mocks.needToConsult.harbourAuthority = 'HARBOUR AUTHORITY'
      mocks.needToConsult.fisheries = true
      mocks.needToConsult.fisheriesCommittee = 'FISHERIES COMMITTEE'
      mocks.needToConsult.none = false
      check = new NeedToConsultCheck()
      lines = await check.buildLines()
      const { heading, headingId, answers, links } = lines[0]

      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${prefix}-heading`)

      Code.expect(answers.length).to.equal(3)
      Code.expect(answers[0].answer).to.equal('SEWERAGE UNDERTAKER')
      Code.expect(answers[0].answerId).to.equal(`${prefix}-answer-1`)
      Code.expect(answers[1].answer).to.equal('HARBOUR AUTHORITY')
      Code.expect(answers[1].answerId).to.equal(`${prefix}-answer-2`)
      Code.expect(answers[2].answer).to.equal('FISHERIES COMMITTEE')
      Code.expect(answers[2].answerId).to.equal(`${prefix}-answer-3`)

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/consultation/names')
      Code.expect(linkType).to.equal('organisation')
      Code.expect(linkId).to.equal(`${prefix}-link`)
    })

    lab.test('(consultee line) works correctly for single release', async () => {
      mocks.needToConsult.sewer = true
      mocks.needToConsult.sewerageUndertaker = 'SEWERAGE UNDERTAKER'
      mocks.needToConsult.harbour = false
      mocks.needToConsult.fisheries = false
      mocks.needToConsult.none = false
      check = new NeedToConsultCheck()
      lines = await check.buildLines()
      const { heading, headingId, answers, links } = lines[0]

      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${prefix}-heading`)

      Code.expect(answers.length).to.equal(1)
      Code.expect(answers[0].answer).to.equal('SEWERAGE UNDERTAKER')
      Code.expect(answers[0].answerId).to.equal(`${prefix}-answer`)

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/consultation/names')
      Code.expect(linkType).to.equal('organisation')
      Code.expect(linkId).to.equal(`${prefix}-link`)
    })
  })

  lab.test('(consultee line) works correctly with missing information', async () => {
    mocks.needToConsult.sewer = false
    mocks.needToConsult.sewerageUndertaker = 'SEWERAGE UNDERTAKER'
    mocks.needToConsult.harbour = true
    mocks.needToConsult.fisheries = true
    mocks.needToConsult.none = false
    check = new NeedToConsultCheck()
    lines = await check.buildLines()
    const { heading, headingId, answers, links } = lines[0]

    Code.expect(heading).to.equal(heading)
    Code.expect(headingId).to.equal(`${prefix}-heading`)

    Code.expect(answers.length).to.equal(0)

    const { link, linkId, linkType } = links.pop()
    Code.expect(link).to.equal('/consultation/names')
    Code.expect(linkType).to.equal('organisation')
    Code.expect(linkId).to.equal(`${prefix}-link`)
  })
})
