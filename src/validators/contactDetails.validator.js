'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

const FIRSTNAME_MAX_LENGTH = 50
const LASTNAME_MAX_LENGTH = 50
const COMPANY_NAME_MAX_LENGTH = 170
const SPACES_REGEX = /\s/g
const PLUSES_AND_SPACES_REGEX = /(\+|\s)/g
const PLUSES_SPACES_AND_NUMBERS_REGEX = /^[0-9 +]*$/
const PLUSES_CANNOT_PRECEED_ZERO = /^(\+[1-9]+[0-9]*|[^+][0-9]*)$/
const LEADING_AND_TRAILING_DASHES_REGEX = /(^-.*$|^.*-$)/
const LETTERS_HYPHENS_AND_APOSTROPHES_REGEX = /^[A-zÀ-ÖØ-öø-ÿ'-]+$/
const EMAIL_VALID_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

module.exports = class ContactDetailsValidator extends BaseValidator {
  constructor (options) {
    super()
    this.validatorOptions = options

    this.errorMessages = {
      'first-name': {
        'any.empty': `Enter a first name`,
        'any.required': `Enter a first name`,
        'string.min': `First name must have at least two letters - if you entered an initial please enter a name`,
        'custom.invalid': `First name can only include letters, hyphens and apostrophes - delete any other characters`,
        'custom.no-leading-and-trailing-dashes': `First name can’t start or end with a dash - delete the dash`,
        'string.max': `Enter a shorter first name with no more than ${FIRSTNAME_MAX_LENGTH} characters`
      },
      'last-name': {
        'any.empty': `Enter a last name`,
        'any.required': `Enter a last name`,
        'string.min': `Last name must have at least two letters - if you entered an initial please enter a name`,
        'custom.invalid': `Last name can only include letters, hyphens and apostrophes - delete any other characters`,
        'custom.no-leading-and-trailing-dashes': `Last name can’t start or end with a dash - delete the dash`,
        'string.max': `Enter a shorter last name with no more than ${LASTNAME_MAX_LENGTH} characters`
      },
      'agent-company': {
        'any.empty': `Enter the agent’s trading, business or company name`,
        'any.required': `Enter the agent’s trading, business or company name`,
        'string.max': `Enter a shorter trading, business or company name with no more than ${COMPANY_NAME_MAX_LENGTH} characters`
      },
      'telephone': {
        'any.empty': `Enter a telephone number`,
        'any.required': `Enter a telephone number`,
        'custom.invalid': `Telephone number can only include numbers, spaces and the + sign. Please remove any other characters.`,
        'custom.plus-zero': `The + sign for international numbers should be at the start of the number, followed by a number 1 to 9, not a 0`,
        'custom.min': `That telephone number is too short. It should have at least ${this.getTelephoneMin()} characters. Make sure you include the area code.`,
        'custom.max': `That telephone number is too long. It should have no more than ${this.getTelephoneMax()} characters.`
      },
      'email': {
        'any.empty': `Enter an email address for the main contact`,
        'any.required': `Enter an email address for the main contact`,
        'string.regex.base': `Enter a valid email address for the main contact`
      },
      'company-secretary-email': {
        'any.empty': `Enter an email address for the Company Secretary or a director`,
        'any.required': `Enter an email address for the Company Secretary or a director`,
        'string.regex.base': `Enter a valid email address for the Company Secretary or director`
      }
    }
  }

  getFormValidators () {
    return {
      'first-name': Joi
        .string()
        .min(2)
        .max(FIRSTNAME_MAX_LENGTH)
        .required(),
      'last-name': Joi
        .string()
        .min(2)
        .max(LASTNAME_MAX_LENGTH)
        .required(),
      'agent-company': Joi
        .string()
        .max(COMPANY_NAME_MAX_LENGTH)
        .when('is-contact-an-agent', {
          is: 'on',
          then: Joi.required() }),
      'telephone': Joi
        .string()
        .required(),
      'email': Joi
        .string()
        .regex(EMAIL_VALID_REGEX)
        .required(),
      'company-secretary-email': Joi
        .string()
        .regex(EMAIL_VALID_REGEX)
        .required()
    }
  }

  customValidators () {
    return {
      'first-name': {
        'custom.invalid': (value) => !(LETTERS_HYPHENS_AND_APOSTROPHES_REGEX).test(value.replace(SPACES_REGEX, '')),
        'custom.no-leading-and-trailing-dashes': (value) => (LEADING_AND_TRAILING_DASHES_REGEX).test(value.replace(SPACES_REGEX, ''))
      },
      'last-name': {
        'custom.invalid': (value) => !(LETTERS_HYPHENS_AND_APOSTROPHES_REGEX).test(value.replace(SPACES_REGEX, '')),
        'custom.no-leading-and-trailing-dashes': (value) => (LEADING_AND_TRAILING_DASHES_REGEX).test(value.replace(SPACES_REGEX, ''))
      },
      'telephone': {
        'custom.invalid': (value) => !(PLUSES_SPACES_AND_NUMBERS_REGEX).test(value.replace(SPACES_REGEX, '')),
        'custom.plus-zero': (value) => !(PLUSES_CANNOT_PRECEED_ZERO).test(value.replace(SPACES_REGEX, '')),
        'custom.min': (value) => value.replace(PLUSES_AND_SPACES_REGEX, '').length < this.getTelephoneMin(),
        'custom.max': (value) => value.replace(PLUSES_AND_SPACES_REGEX, '').length > this.getTelephoneMax()
      }
    }
  }

  getTelephoneMin () {
    return this.validatorOptions.telephone.min
  }

  getTelephoneMax () {
    return this.validatorOptions.telephone.max
  }
}
