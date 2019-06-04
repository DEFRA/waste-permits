'use strict'
const fs = require('fs')
const Path = require('path')
const config = require('../config/config')

const { Stream } = require('stream')
const UPLOAD_PATH = Path.resolve(`${process.cwd()}/temp`)
const Annotation = require('../persistence/entities/annotation.entity')
const LoggingService = require('./logging.service')
const VirusScan = require('../services/virusScan')

module.exports = class UploadService {
  static get DUPLICATE () {
    return 'duplicateFile'
  }

  static get VIRUS () {
    return 'virusFile'
  }

  static get VIRUS_SCAN_ERROR () {
    return 'virusScanError'
  }

  static async upload (context, application, file, subject) {
    const annotationsList = await Annotation.listByApplicationIdAndSubject(context, subject)

    // create temporary uploads directory
    const uploadPath = Path.resolve(UPLOAD_PATH, UploadService._buildUploadDir(application.applicationNumber))
    UploadService._createTempUploadDirectory(uploadPath)

    const fileData = UploadService._getFileData(file, uploadPath)

    // Make sure no duplicate files are uploaded
    if (UploadService._haveDuplicateFiles(fileData, annotationsList)) {
      throw new Error(this.DUPLICATE)
    }

    await UploadService._saveFilesToDisk(fileData)

    if (!config.bypassVirusScan) {
      await UploadService._scanFiles(fileData)
    }

    await UploadService._uploadFilestoDynamics(context, application, subject, fileData)
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

  static _getFileData (file, uploadPath) {
    const files = file.hapi ? [file] : file
    return files.map((file) => {
      const filename = file.hapi.filename
      const savedFileName = Path.resolve(uploadPath, filename)
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
    // Stream the file from the node server into a base24 string as required by the CRM
    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(path)
      const chunks = []
      stream.on('error', (err) => reject(err))
      stream.on('data', (chunk) => chunks.push(chunk))
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('base64')))
    })
  }

  static async _saveFilesToDisk (fileData) {
    // Save each file as an attachment to an annotation
    const fileSavePromises = fileData.map(async ({ file, path }) => {
      return new Promise((resolve, reject) => {
        const filename = Path.basename(path)
        const dirname = Path.dirname(path)
        const fileStream = fs.createWriteStream(Path.join(dirname, filename.split(' ').join('_').split(',').join('_')))
        fileStream.on('error', (err) => reject(err))
        fileStream.on('finish', () => resolve('ok'))

        if (fileStream instanceof Stream) {
          file.pipe(fileStream)
        }
      })
    })
    await Promise.all(fileSavePromises)
  }

  static async _scanFiles (fileData) {
    const isInfectedPromises = fileData.map(async ({ path }) => VirusScan.isInfected(path).then((isInfected) => {
      LoggingService.logInfo(`Scanned ${path} and found that it is ${isInfected ? 'infected' : 'not infected'}`)
      return Promise.resolve(isInfected)
    }).catch(error => {
      LoggingService.logError(`Error while scanning: ${error}`)
      return Promise.resolve(this.VIRUS_SCAN_ERROR)
    })
    )
    const results = await Promise.all(isInfectedPromises)

    if (results.includes(true)) {
      throw Error(this.VIRUS)
    } else if (results.includes(this.VIRUS_SCAN_ERROR)) {
      throw Error(this.VIRUS_SCAN_ERROR)
    }
  }

  static async _uploadFilestoDynamics (context, application, subject, fileData) {
    // Save each file as an attachment to an annotation
    const uploadPromises = fileData.map(async ({ file, filename, path }) => {
      const annotation = new Annotation({ subject, filename, applicationId: application.id })
      await annotation.save(context)
      UploadService._uploadFileDataToDynamics(context, file, path, application.applicationNumber, annotation)
      return Promise.resolve(annotation)
    })
    await Promise.all(uploadPromises)
  }

  static _uploadFileDataToDynamics (context, file, path, applicationNumber, { subject, filename }) {
    setImmediate(async () => {
      try {
        const annotation = await Annotation.getByApplicationIdSubjectAndFilename(context, subject, filename)
        annotation.documentBody = await UploadService._streamFile(file, filename, path)
        await annotation.save(context)
        LoggingService.logInfo(`Successfully uploaded ${filename} in dynamics for ${applicationNumber}`)
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
    const haveDuplicateFiles = listA.filter(({ filename }) => UploadService._containsFilename(filename, listB))
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
