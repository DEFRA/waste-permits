'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const WasteBespokePermitCheck = require('../../../src/models/checkList/wasteBespokePermit.check')
const { path } = require('../../../src/routes').BESPOKE_OR_STANDARD_RULES

const prefix = 'section-permit'

let sandbox

lab.beforeEach(() => {
  // Create a sinon sandbox
  sandbox = sinon.createSandbox()
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('WasteBespokePermit Check tests:', () => {
  lab.experiment('buildlines', () => {
    let check
    let lines

    lab.beforeEach(async () => {
      check = new WasteBespokePermitCheck()
      lines = await check.buildLines()
    })

    lab.test('(waste bespoke permit line) works correctly', async () => {
      const { heading, headingId, answers, links } = lines.pop()
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${prefix}-heading`)

      const { answerId, answer } = answers.pop()
      Code.expect(answerId).to.equal(`${prefix}-answer`)
      Code.expect(answer).to.equal('Bespoke environmental permit')

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal(path)
      Code.expect(linkType).to.equal('bespoke environmental permit')
      Code.expect(linkId).to.equal(`${prefix}-link`)
    })
  })
})
