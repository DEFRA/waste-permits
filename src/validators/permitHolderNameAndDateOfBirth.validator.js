'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')
const Contact = require('../models/contact.model')

const LEADING_AND_TRAILING_DASHES_REGEX = /(^-.*$|^.*-$)/
const LETTERS_HYPHENS_AND_APOSTROPHES_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ'-]+$/

module.exports = class PermitHolderNameAndDateOfBirthValidator extends BaseValidator {
  constructor (options) {
    super()
    this.validatorOptions = options

    this.errorMessages = {
      'first-name': {
        'any.empty': `Enter a first name`,
        'any.required': `Enter a first name`,
        'string.min': `First name must have at least two letters - if you entered an initial please enter a name`,
        'custom.invalid': `First name can only include letters, hyphens and apostrophes - delete any other characters`,
        'custom.no-leading-and-trailing-dashes': `First name can not start or end with a dash - delete the dash`,
        'string.max': `Enter a shorter first name with no more than ${Contact.firstName.length.max} characters`
      },
      'last-name': {
        'any.empty': `Enter a last name`,
        'any.required': `Enter a last name`,
        'string.min': `Last name must have at least two letters - if you entered an initial please enter a name`,
        'custom.invalid': `Last name can only include letters, hyphens and apostrophes - delete any other characters`,
        'custom.no-leading-and-trailing-dashes': `Last name can not start or end with a dash - delete the dash`,
        'string.max': `Enter a shorter last name with no more than ${Contact.lastName.length.max} characters`
      },
      'dob-day': {
        'invalid': 'Enter a valid date of birth'
      }
    }
  }

  getFormValidators () {
    return {
      'first-name': Joi
        .string()
        .min(2)
        .max(Contact.firstName.length.max)
        .required(),
      'last-name': Joi
        .string()
        .min(2)
        .max(Contact.lastName.length.max)
        .required()
    }
  }

  customValidators () {
    return {
      'first-name': {
        'custom.invalid': (value) => !(LETTERS_HYPHENS_AND_APOSTROPHES_REGEX).test(value),
        'custom.no-leading-and-trailing-dashes': (value) => (LEADING_AND_TRAILING_DASHES_REGEX).test(value)
      },
      'last-name': {
        'custom.invalid': (value) => !(LETTERS_HYPHENS_AND_APOSTROPHES_REGEX).test(value),
        'custom.no-leading-and-trailing-dashes': (value) => (LEADING_AND_TRAILING_DASHES_REGEX).test(value)
      }
    }
  }
}
