'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')
const defaultValidatorOptions = {
  maxSize: '30MB',
  fileTypes: [
    {type: 'PDF', mimeType: 'application/pdf'},
    {type: 'JPG', mimeType: 'image/jpeg'}
  ]
}

module.exports = class UploadEntityValidator extends BaseValidator {
  constructor (options = defaultValidatorOptions) {
    super()
    this._validatorOptions = options

    this.errorMessages = {
      'file': {
        'fileTooBig': `That file’s too big. Upload a file that’s no more than ${this.getMaxSize()}.`,
        'duplicateFile': `You cannot upload files with the same name as a file you have previously uploaded.`,
        'array.base': ' ',
        'object.base': ' '
      },
      'filename': {
        'any.empty': 'Choose and upload a file'
      },
      'content-type': {
        'any.allowOnly': `You can only upload ${this.formatValidTypes()} files`
      }
    }
  }

  getFormValidators () {
    const fileSchema =
      Joi.object().keys({
        'hapi': Joi.object().keys({
          'headers': Joi.object({
            'content-type': Joi.string().valid(this.listValidMimeTypes()),
            'content-disposition': Joi.string().required()
          }),
          'filename': Joi.string().required()
        })
      }).optional()
    return {
      'file': Joi.alternatives([Joi.array().items(fileSchema), fileSchema])
    }
  }

  formatValidTypes () {
    return this._validatorOptions
      .fileTypes
      .map(({type}) => type)
      .join(' or ')
  }

  listValidMimeTypes () {
    return this._validatorOptions
      .fileTypes
      .map(({mimeType}) => mimeType)
  }

  getMaxSize () {
    return this._validatorOptions.maxSize
  }
}
