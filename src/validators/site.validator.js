'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

const DISALLOWED_CHARACTERS = '^ | _ ~ ¬ `'
const DISALLOWED_CHARACTERS_REGEX = /[\^|_~¬`]/g
const SITE_NAME_MAX_LENGTH = 170

module.exports = class SiteValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'site-name': {
        'any.empty': `Enter the site name`,
        'string.max': `Enter a shorter site name with no more than 170 characters`,
        'string.regex.invert.base': `The site name cannot contain any of these characters: ${DISALLOWED_CHARACTERS}`
      },
      'another-name': {
        'any.empty': `Enter the other name`,
        'string.max': `Enter a shorter other name with no more than 170 characters`,
        'string.regex.invert.base': `The other name cannot contain any of these characters: ${DISALLOWED_CHARACTERS}`
      }
    }
  }

  static getFormValidators () {
    return {
      'site-name': Joi
        .string()
        .max(SITE_NAME_MAX_LENGTH)
        .regex(DISALLOWED_CHARACTERS_REGEX, {
          invert: true
        })
        .required(),
      'another-name': Joi
        .string()
        .max(SITE_NAME_MAX_LENGTH)
        .regex(DISALLOWED_CHARACTERS_REGEX, {
          invert: true
        })
        .required()
    }
  }
}
