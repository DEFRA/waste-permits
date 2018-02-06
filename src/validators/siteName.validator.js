'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

const CHARACTER_LIMIT = 170
const DISALLOWED_CHARACTERS = '^ | _ ~ ¬ `'
const DISALLOWED_CHARACTERS_REGEX = /[\^|_~¬`]/g

module.exports = class SiteNameValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'site-name': {
        'any.empty': `Enter the site name`,
        'any.required': `Enter the site name`,
        'string.max': `Enter a shorter site name with no more than ${CHARACTER_LIMIT} characters`,
        'string.regex.invert.base': `The site name cannot contain any of these characters: ${DISALLOWED_CHARACTERS}`
      }
    }
  }

  getFormValidators () {
    return {
      'site-name': Joi
        .string()
        .max(CHARACTER_LIMIT)
        .regex(DISALLOWED_CHARACTERS_REGEX, {
          invert: true
        })
        .required()
    }
  }
}
