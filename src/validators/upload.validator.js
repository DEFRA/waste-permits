'use strict'

const BaseValidator = require('./base.validator')
const Annotation = require('../persistence/entities/annotation.entity')
const Constants = require('../constants')

module.exports = class UploadValidator extends BaseValidator {
  constructor (options = {}) {
    super()

    this._validatorOptions = { ...Constants.DEFAULT_UPLOAD_OPTIONS, ...options }
  }

  get errorMessages () {
    return {
      'file': {
        'custom.max.filename': `That file’s name is greater than ${Annotation.filename.length.max} characters - please rename the file with a shorter name before uploading it again.`,
        'custom.empty': 'Choose and upload a file',
        'fileTooBig': `That file is too big. Upload a file that is no more than ${this.getMaxSize()}.`,
        'duplicateFile': `That file has the same name as one you have already uploaded. Choose another file or rename the file before uploading it again.`,
        'virusFile': `Our scanner detected a virus in that file. It has not been uploaded. Please use your own virus scanner to check and clean the file. You should either upload a clean copy of the file or contact us if you think that the file does not have a virus.`,
        'noFilesUploaded': `You must upload at least one file. Choose a file then press the 'Upload chosen file' button.`,
        'array.base': ' ',
        'object.base': ' ',
        'custom.extension.filename': `You can only upload ${this.formatValidTypes()} files`
      }
    }
  }

  get customValidators () {
    return {
      'file': {
        'custom.max.filename': ({ hapi: { filename } }) => filename.length > Annotation.filename.length.max,
        'custom.empty': ({ hapi: { filename } }, { 'is-upload-file': isUpload }) => {
          return isUpload && !filename
        },
        'custom.extension.filename': ({
          hapi: {
            filename,
            headers
          }
        }) => {
          const regexPattern = '\\.' + this.listValidFileTypeExtensions().join('|\\.')
          const re = new RegExp(regexPattern)
          if (re.test(filename)) {
            if (
              typeof headers['content-type'] === 'string' &&
              typeof headers['content-disposition'] === 'string'
            ) {
              return !this.listValidMimeTypes().includes(headers['content-type'])
            }
          }
          // none of the above matched
          // report the validation failure
          return true
        }
      }
    }
  }

  formatValidTypes () {
    if (this._validatorOptions.fileTypes) {
      const types = this._validatorOptions
        .fileTypes
        .map(({ type }) => type)
      const lastType = types.pop()
      if (types.length) {
        return `${types.join(', ')} or ${lastType}`
      }
      return lastType
    } else {
      throw new Error('Missing valid filetypes')
    }
  }

  listValidFileTypeExtensions () {
    if (this._validatorOptions.fileTypes) {
      return []
        .concat
        .apply(
          [],
          this._validatorOptions
            .fileTypes
            .map(({ type }) => {
              return [type, type.toLowerCase()]
            }))
    }
    return []
  }

  listValidMimeTypes () {
    if (this._validatorOptions.fileTypes) {
      const mimeTypes = this._validatorOptions
        .fileTypes
        .map(({ mimeType }) => {
          // allow for mime-type arrays and strings
          return Array.isArray(mimeType) ? mimeType : [mimeType]
        })
      // force mime-type array to "flat" array
      return [].concat.apply([], mimeTypes)
    } else {
      return ''
    }
  }

  getMaxSize () {
    return this._validatorOptions.maxSize
  }
}
