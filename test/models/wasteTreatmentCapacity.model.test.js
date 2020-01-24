'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const wasteTreatmentCapacities = require('../../src/models/wasteTreatmentCapacity.model')

lab.experiment('wasteTreatmentCapacyModel test', () => {
  lab.test('basic API', () => {
    Code.expect(wasteTreatmentCapacities).to.exist()
    Code.expect(wasteTreatmentCapacities.getForActivity)
      .to
      .be
      .a
      .function()
    Code.expect(wasteTreatmentCapacities.saveWeights)
      .to
      .be
      .a
      .function()
    Code.expect(wasteTreatmentCapacities.saveAnswers)
      .to
      .be
      .a
      .function()
    Code
      .expect(wasteTreatmentCapacities.treatmentAnswers)
      .to
      .be
      .an
      .array()
    Code
      .expect(wasteTreatmentCapacities.listAllAnswers)
      .to
      .be
      .a
      .function()
    Code
      .expect(wasteTreatmentCapacities.getAllWeightsHaveBeenEnteredForApplication)
      .to
      .be
      .a
      .function()
  })
  lab.test('getTreatmentAnswerForQuestionCode', () => {
    Code
      .expect(wasteTreatmentCapacities.getTreatmentAnswerForQuestionCode)
      .to
      .be
      .a
      .function()
    Code
      .expect(
        wasteTreatmentCapacities
          .getTreatmentAnswerForQuestionCode(
            wasteTreatmentCapacities
              .treatmentAnswers[0].questionCode
          )
      )
      .to
      .be
      .an
      .object()
    Code
      .expect(
        wasteTreatmentCapacities
          .getTreatmentAnswerForQuestionCode('nonsense')
      )
      .to
      .be
      .undefined()
  })
})
