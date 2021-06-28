'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('./base.validator')
const Location = require('../persistence/entities/location.entity')

const DISALLOWED_CHARACTERS = '^ | _ ~ ¬ `'
const DISALLOWED_CHARACTERS_REGEX = /[\^|_~¬`]/

module.exports = class SiteNameValidator extends BaseValidator {
  get errorMessages () {
    return {
      'site-name': {
        'any.empty': 'Enter the site name',
        'any.required': 'Enter the site name',
        'string.max': `Enter a shorter site name with no more than ${Location.siteName.length.max} characters`,
        'custom.invalid': `The site name cannot contain any of these characters: ${DISALLOWED_CHARACTERS}`
      }
    }
  }

  get formValidators () {
    return {
      'site-name': Joi
        .string()
        .max(Location.siteName.length.max)
        .required()
    }
  }

  get customValidators () {
    return {
      'site-name': {
        'custom.invalid': (value) => (DISALLOWED_CHARACTERS_REGEX).test(value)
      }
    }
  }
}
