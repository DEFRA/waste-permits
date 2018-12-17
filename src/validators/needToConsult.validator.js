'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')
const MAX_NAME_LENGTH = 150

module.exports = class NeedToConsultValidator extends BaseValidator {
  get errorMessages () {
    return {
      'consult-select': {
        'object.without': `You cannot select a release and 'None of these'. Please deselect one of them.`,
        'object.missing': `Select at least one option. If there are no releases select 'None of these'.`
      },
      'consult-sewerage-undertaker': {
        'any.required': 'Enter the water or sewerage company name',
        'string.max': `Enter fewer than ${MAX_NAME_LENGTH} characters in water or sewerage company name`
      },
      'consult-harbour-authority': {
        'any.required': 'Enter the harbour authority name',
        'string.max': `Enter fewer than ${MAX_NAME_LENGTH} characters in harbour authority name`
      },
      'consult-fisheries-committee': {
        'any.required': 'Enter the fisheries committee name',
        'string.max': `Enter fewer than ${MAX_NAME_LENGTH} characters in fisheries committee name`
      }
    }
  }

  get formValidators () {
    return Joi.object({
      'consult-none-required': Joi.string().label('consult-select')
    })
      .or('consult-none-required', 'consult-sewer-required', 'consult-harbour-required', 'consult-fisheries-required')
      .label('consult-select') // The name of the field that object-level errors should be attached to on the page
      .when(Joi.object({ 'consult-none-required': Joi.exist() }), {
        then: Joi.object()
          .without('consult-none-required', ['consult-sewer-required', 'consult-harbour-required', 'consult-fisheries-required']),
        otherwise: Joi.object({
          'consult-sewerage-undertaker': Joi.string()
            .max(MAX_NAME_LENGTH)
            .when('consult-sewer-required', { is: Joi.exist(), then: Joi.required() }),
          'consult-harbour-authority': Joi.string()
            .max(MAX_NAME_LENGTH)
            .when('consult-harbour-required', { is: Joi.exist(), then: Joi.required() }),
          'consult-fisheries-committee': Joi.string()
            .max(MAX_NAME_LENGTH)
            .when('consult-fisheries-required', { is: Joi.exist(), then: Joi.required() })
        })
      })
  }
}
