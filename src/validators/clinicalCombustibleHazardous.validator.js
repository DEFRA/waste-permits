'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class NeedToConsultValidator extends BaseValidator {
  get errorMessages () {
    return {
      select: {
        'object.without': 'You cannot select a type and ‘None of these’. Please deselect one of them.',
        'object.missing': 'Select at least one option. If you don’t accept any of these select ‘None of these’.'
      }
    }
  }

  get formValidators () {
    return Joi.object({ 'none-required': Joi.string().label('select') })
      .or('none-required', 'clinical', 'combustible', 'hazardous')
      .label('select') // The name of the field that object-level errors should be attached to on the page
      .when(Joi.object({ 'none-required': Joi.exist() }), {
        then: Joi.object()
          .without('none-required', ['clinical', 'combustible', 'hazardous'])
      })
  }
}
