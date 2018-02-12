'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class UploadEntityValidator extends BaseValidator {
  constructor (options) {
    super()
    if (!options || typeof options.maxSize !== 'string') {
      throw new Error('Expected maxSize in validator options')
    }
    if (!options || !(options.fileTypes && options.fileTypes.length)) {
      throw new Error('Expected fileTypes in validator options to contain an array')
    }
    this._validatorOptions = options

    this.errorMessages = {
      'file': {
        'custom.empty': 'Choose and upload a file',
        'fileTooBig': `That file’s too big. Upload a file that’s no more than ${this.getMaxSize()}.`,
        'duplicateFile': `That file has the same name as one you’ve already uploaded. Choose another file or rename the file before uploading it again.`,
        'noFilesUploaded': `You must upload at least one file. Choose a file then press the 'Upload chosen file' button.`,
        'array.base': ' ',
        'object.base': ' '
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
          'headers': Joi.object().keys({
            'content-type': Joi.string(),
            'content-disposition': Joi.string().required()
          }).required().when('filename', {is: Joi.string().required(), then: Joi.object({'content-type': Joi.valid(this.listValidMimeTypes())})})
        })
      }).optional()
    return {
      'file': Joi.alternatives([Joi.array().items(fileSchema), fileSchema])
    }
  }

  customValidators () {
    return {
      'file': {
        'custom.empty': ({hapi: {filename}}, {'is-upload-file': isUpload}) => {
          return isUpload && !filename
        }
      }
    }
  }

  formatValidTypes () {
    if (this._validatorOptions.fileTypes) {
      const types = this._validatorOptions
        .fileTypes
        .map(({type}) => type)
      const lastType = types.pop()
      if (types.length) {
        return `${types.join(', ')} or ${lastType}`
      }
      return lastType
    } else {
      throw new Error('Missing valid filetypes')
    }
  }

  listValidMimeTypes () {
    if (this._validatorOptions.fileTypes) {
      return this._validatorOptions
        .fileTypes
        .map(({mimeType}) => mimeType)
    } else {
      return ''
    }
  }

  getMaxSize () {
    return this._validatorOptions.maxSize
  }
}
