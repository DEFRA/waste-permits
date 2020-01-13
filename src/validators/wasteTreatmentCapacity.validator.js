'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('./base.validator')
const { treatmentAnswers } = require('../models/wasteTreatmentCapacityPt2.model')

module.exports = class WasteTreatmentCapacityValidator extends BaseValidator {
  get errorMessages () {
    return {
      'select': {
        'object.without': `You cannot select a type and ‘None of the above’. Please deselect one of them.`,
        'object.missing': `Select at least one option. If the facility does not accept any of these select ‘None of these’.`
      }
    }
  }

  get formValidators () {
    const codes = treatmentAnswers.map(ta => ta.questionCode)
    return Joi.object({ 'treatment-none': Joi.string().label('select') })
      .or(...codes)
      .label('select') // The name of the field that object-level errors should be attached to on the page
      .when(Joi.object({ 'treatment-none': Joi.exist() }), {
        then: Joi.object()
          .without('treatment-none', codes.filter(code => code !== 'treatment-none'))
      })
  }
}
