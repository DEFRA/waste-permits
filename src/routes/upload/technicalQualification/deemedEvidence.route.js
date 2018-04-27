'use strict'

const Constants = require('../../../constants')
const Route = require('../base/uploadRoute')
const {UPLOAD_DEEMED_EVIDENCE, TECHNICAL_MANAGERS} = Constants.Routes
const DeemedEvidenceController = require('../../../controllers/upload/technicalQualification/deemedEvidence.controller')
const UploadValidator = require('../../../validators/upload/upload.validator')

const validator = new UploadValidator()
const controller = new DeemedEvidenceController({route: UPLOAD_DEEMED_EVIDENCE, validator, nextRoute: TECHNICAL_MANAGERS})

module.exports = Route.register('GET, REMOVE, UPLOAD', controller)
