'use strict'

const fs = require('fs')
const path = require('path')
// const del = require('del')
const { Stream } = require('stream')
const UPLOAD_PATH = path.resolve(`${process.cwd()}/temp`)
const Annotation = require('../models/annotation.model')
const LoggingService = require('./logging.service')

module.exports = class UploadService {
  static get DUPLICATE () {
    return 'duplicateFile'
  }

  static async upload (authToken, application, file, subject) {
    const annotationsList = await Annotation.listByApplicationIdAndSubject(authToken, application.id, subject)

    // create temporary uploads directory
    const uploadPath = path.resolve(UPLOAD_PATH, UploadService._buildUploadDir(application.applicationName))
    UploadService._createTempUploadDirectory(uploadPath)

    const fileData = UploadService._getFileData(file, uploadPath)

    // Make sure no duplicate files are uploaded
    if (UploadService._haveDuplicateFiles(fileData, annotationsList)) {
      throw new Error('duplicateFile')
    }

    // Save each file as an attachment to an annotation
    const uploadPromises = fileData.map(async ({file, filename, path}) => {
      const annotation = new Annotation({subject, filename, applicationId: application.id})
      await annotation.save(authToken)
      UploadService._uploadToDynamics(authToken, file, path, application.applicationName, annotation)
      return Promise.resolve(annotation)
    })
    await Promise.all(uploadPromises)

    // Remove temporary uploads directory
    // await UploadService._removeTempUploadDirectory(uploadPath)
  }

  static _buildUploadDir (applicationReference) {
    return applicationReference.replace(/(\/|\\)/g, '_')
  }

  static _createTempUploadDirectory (uploadPath) {
    if (!fs.existsSync(UPLOAD_PATH)) {
      fs.mkdirSync(UPLOAD_PATH)
    }
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath)
    }
    return uploadPath
  }

  // static _removeTempUploadDirectory (uploadPath) {
  //   if (fs.existsSync(uploadPath)) {
  //     del(uploadPath)
  //   }
  //   return uploadPath
  // }

  static _getFileData (file, uploadPath) {
    const files = file.hapi ? [file] : file
    return files.map((file) => {
      const filename = file.hapi.filename
      const savedFileName = path.resolve(uploadPath, filename)
      return {
        fieldname: file.hapi.name,
        filename,
        mimetype: file.hapi.headers['content-type'],
        destination: uploadPath,
        path: savedFileName,
        file
      }
    })
  }

  static async _streamFile (file, filename, path) {
    // Upload the file to the server
    await new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream(path)
      fileStream.on('error', (err) => reject(err))
      fileStream.on('finish', () => resolve('ok'))

      if (fileStream instanceof Stream) {
        file.pipe(fileStream)
      }
    })

    // Stream the file from the node server into a base24 string as required by the CRM
    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(path)
      const chunks = []
      stream.on('error', (err) => reject(err))
      stream.on('data', (chunk) => chunks.push(chunk))
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('base64')))
    })
  }

  static _uploadToDynamics (authToken, file, path, applicationName, {applicationId, subject, filename}) {
    setImmediate(async () => {
      try {
        const annotation = await Annotation.getByApplicationIdSubjectAndFilename(authToken, applicationId, subject, filename)
        annotation.documentBody = await UploadService._streamFile(file, filename, path)
        await annotation.save(authToken)
        LoggingService.logInfo(`Successfully uploaded ${filename} in dynamics for ${applicationName}`)
      } catch (err) {
        LoggingService.logError(err.message)
      }
    })
  }

  static _containsFilename (filename, fileList) {
    const containsFilename = fileList.filter((file) => file.filename === filename)
    return Boolean(containsFilename.length)
  }

  static _haveDuplicateFiles (listA, listB) {
    const haveDuplicateFiles = listA.filter(({filename}) => UploadService._containsFilename(filename, listB))
    return Boolean(haveDuplicateFiles.length)
  }

  static _customError (type) {
    return {
      details: [{
        type,
        path: ['file']
      }]
    }
  }
}
