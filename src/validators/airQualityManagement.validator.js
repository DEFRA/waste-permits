'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')
const NAME_LENGTH_MAX = 150
const NITROGEN_DIOXIDE_MIN = 0
const NITROGEN_DIOXIDE_MAX = 100
const NITROGEN_DIOXIDE_OUT_OF_RANGE = 'The background level should be a number between 0 and 100'

module.exports = class AirQualityManagementValidator extends BaseValidator {
  get errorMessages () {
    return {
      'aqma-is-in-aqma': {
        'any.required': 'Please select Yes or No',
        'boolean.base': 'Please select Yes or No'
      },
      'aqma-name': {
        'any.required': 'Enter the AQMA name',
        'string.max': `Enter the AQMA name with fewer than ${NAME_LENGTH_MAX} characters`
      },
      'aqma-nitrogen-dioxide-level': {
        'any.required': 'Enter the background level of nitrogen dioxide',
        'number.min': NITROGEN_DIOXIDE_OUT_OF_RANGE,
        'number.max': NITROGEN_DIOXIDE_OUT_OF_RANGE,
        'number.base': NITROGEN_DIOXIDE_OUT_OF_RANGE
      },
      'aqma-local-authority-name': {
        'any.required': 'Enter the local authority name',
        'string.max': `Enter the local authority name with fewer than ${NAME_LENGTH_MAX} characters`
      }
    }
  }

  get formValidators () {
    const aqmaIsInAqmaCheck = Joi
      .boolean()
      .truthy('yes')
      .falsy('no')
      .required()

    const aqmaNameCheck = Joi
      .string()
      .max(NAME_LENGTH_MAX)
      .required()

    const aqmaNitrogenDioxideLevelCheck = Joi
      .number()
      .min(NITROGEN_DIOXIDE_MIN)
      .max(NITROGEN_DIOXIDE_MAX)
      .required()

    const aqmaLocalAuthorityNameCheck = Joi
      .string()
      .max(NAME_LENGTH_MAX)
      .required()

    return Joi.object({ 'aqma-is-in-aqma': aqmaIsInAqmaCheck })
      .when(Joi.object({ 'aqma-is-in-aqma': 'yes' }), {
        then: Joi.object({
          'aqma-name': aqmaNameCheck,
          'aqma-nitrogen-dioxide-level': aqmaNitrogenDioxideLevelCheck,
          'aqma-local-authority-name': aqmaLocalAuthorityNameCheck
        })
      })
  }
}
