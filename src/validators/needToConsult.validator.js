'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')
const MAX_NAME_LENGTH = 150

module.exports = class NeedToConsultValidator extends BaseValidator {
  get errorMessages () {
    return {
      'consult-none-required': {
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
    return Joi.object().keys({
      'consult-sewerage-undertaker': Joi
        .string()
        .max(MAX_NAME_LENGTH)
        .when('consult-sewer-required', {
          is: 'yes',
          then: Joi.required(),
          otherwise: Joi.optional() }),
      'consult-harbour-authority': Joi
        .string()
        .max(MAX_NAME_LENGTH)
        .when('consult-harbour-required', {
          is: 'yes',
          then: Joi.required(),
          otherwise: Joi.optional() }),
      'consult-fisheries-committee': Joi
        .string()
        .max(MAX_NAME_LENGTH)
        .when('consult-fisheries-required', {
          is: 'yes',
          then: Joi.required(),
          otherwise: Joi.optional() })
    })
      .without('consult-none-required', ['consult-sewer-required', 'consult-harbour-required', 'consult-fisheries-required'])
      .or('consult-none-required', 'consult-sewer-required', 'consult-harbour-required', 'consult-fisheries-required')
      .label('consult-none-required') // Label with the name of the field that the error should be attached to on the form
  }
}
