'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const BaseCheck = require('../../../src/models/checkList/base.check')
const WasteWeightsCheck = require('../../../src/models/checkList/wasteWeights.check')

const prefix = 'section-waste-weights'

let sandbox
let stub

const checkLine = (line, expectedLinePrefix, expectedHeading) => {
  Code.expect(line.heading).to.equal(expectedHeading)
  Code.expect(line.headingId).to.equal(`${expectedLinePrefix}-heading`)
  Code.expect(line.answers.length).to.equal(1)
  Code.expect(line.links.length).to.equal(1)
  Code.expect(line.links[0].linkId).to.equal(`${expectedLinePrefix}-link`)
  Code.expect(line.links[0].link).to.equal('/waste-weights')
  Code.expect(line.links[0].linkType).to.equal('waste storage capacity and annual throughput')
}

lab.beforeEach(() => {
  // Create a sinon sandbox
  sandbox = sinon.createSandbox()
  stub = sandbox.stub(BaseCheck.prototype, 'getAllWasteWeights')
  stub.resolves([])
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('Waste Weights Check tests:', () => {
  let check

  lab.beforeEach(() => {
    check = new WasteWeightsCheck()
  })

  lab.test('buildlines has correct lines', async () => {
    stub.resolves([
      {
        hasHazardousWaste: true,
        nonHazardousThroughput: 1,
        nonHazardousMaximum: 2,
        hazardousThroughput: 3,
        hazardousMaximum: 4
      }
    ])
    const lines = await check.buildLines()
    Code.expect(lines.length).to.equal(4)
    checkLine(lines[0], `${prefix}-non-haz-tp`, 'Total non-hazardous waste throughput (tonnes a year)')
    checkLine(lines[1], `${prefix}-non-haz-max`, 'Total non-hazardous waste stored (tonnes)')
    checkLine(lines[2], `${prefix}-haz-tp`, 'Total hazardous waste throughput (tonnes a year)')
    checkLine(lines[3], `${prefix}-haz-max`, 'Total hazardous waste stored (tonnes)')
  })

  lab.test('buildlines provides correct answers for single non-hazardous', async () => {
    stub.resolves([
      {
        hasHazardousWaste: false,
        nonHazardousThroughput: '1',
        nonHazardousMaximum: '2'
      }
    ])
    const lines = await check.buildLines()
    Code.expect(lines.length).to.equal(2)
    Code.expect(lines[0].answers[0].answer).to.equal('1')
    Code.expect(lines[1].answers[0].answer).to.equal('2')
  })

  lab.test('buildlines provides correct answers for multiple non-hazardous', async () => {
    stub.resolves([
      {
        hasHazardousWaste: false,
        nonHazardousThroughput: '1',
        nonHazardousMaximum: '2'
      },
      {
        hasHazardousWaste: false,
        nonHazardousThroughput: '3',
        nonHazardousMaximum: '4'
      }
    ])
    const lines = await check.buildLines()
    Code.expect(lines.length).to.equal(2)
    Code.expect(lines[0].answers[0].answer).to.equal('1; 3')
    Code.expect(lines[1].answers[0].answer).to.equal('2; 4')
  })

  lab.test('buildlines provides correct answers for single hazardous', async () => {
    stub.resolves([
      {
        hasHazardousWaste: true,
        nonHazardousThroughput: '1',
        nonHazardousMaximum: '2',
        hazardousThroughput: '3',
        hazardousMaximum: '4'
      }
    ])
    const lines = await check.buildLines()
    Code.expect(lines.length).to.equal(4)
    Code.expect(lines[0].answers[0].answer).to.equal('1')
    Code.expect(lines[1].answers[0].answer).to.equal('2')
    Code.expect(lines[2].answers[0].answer).to.equal('3')
    Code.expect(lines[3].answers[0].answer).to.equal('4')
  })

  lab.test('buildlines provides correct answers for multiple hazardous', async () => {
    stub.resolves([
      {
        hasHazardousWaste: true,
        nonHazardousThroughput: '1',
        nonHazardousMaximum: '2',
        hazardousThroughput: '3',
        hazardousMaximum: '4'
      },
      {
        hasHazardousWaste: true,
        nonHazardousThroughput: '5',
        nonHazardousMaximum: '6',
        hazardousThroughput: '7',
        hazardousMaximum: '8'
      }
    ])
    const lines = await check.buildLines()
    Code.expect(lines.length).to.equal(4)
    Code.expect(lines[0].answers[0].answer).to.equal('1; 5')
    Code.expect(lines[1].answers[0].answer).to.equal('2; 6')
    Code.expect(lines[2].answers[0].answer).to.equal('3; 7')
    Code.expect(lines[3].answers[0].answer).to.equal('4; 8')
  })

  lab.test('Provides the correct task', async () => {
    Code.expect(WasteWeightsCheck.task.id).to.equal('waste-weights')
  })
})
