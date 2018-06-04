'use strict'

const Joi = require('joi')
const BaseValidator = require('../base.validator')
const Annotation = require('../../models/annotation.model')
const Constants = require('../../constants')

module.exports = class UploadValidator extends BaseValidator {
  constructor (options = {}) {
    super()

    this._validatorOptions = {...Constants.DEFAULT_UPLOAD_OPTIONS, ...options}

    this.errorMessages = {
      'file': {
        'custom.max.filename': `That file’s name is greater than ${Annotation.filename.length.max} characters - please rename the file with a shorter name before uploading it again.`,
        'custom.empty': 'Choose and upload a file',
        'fileTooBig': `That file is too big. Upload a file that is no more than ${this.getMaxSize()}.`,
        'duplicateFile': `That file has the same name as one you have already uploaded. Choose another file or rename the file before uploading it again.`,
        'virusFile': `Our scanner detected a virus in that file. It has not been uploaded. Please use your own virus scanner to check and clean the file. You should either upload a clean copy of the file or contact us if you think that the file does not have a virus.`,
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
        'custom.max.filename': ({hapi: {filename}}) => filename.length > Annotation.filename.length.max,
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
