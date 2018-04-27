'use strict'

const Constants = require('../../../constants')
const Route = require('../base/uploadRoute')
const {UPLOAD_WAMITAB_QUALIFICATION, TECHNICAL_MANAGERS} = Constants.Routes
const WamitabQualificationController = require('../../../controllers/upload/technicalQualification/wamitabQualification.controller')
const UploadValidator = require('../../../validators/upload/upload.validator')

const validator = new UploadValidator()
const controller = new WamitabQualificationController({route: UPLOAD_WAMITAB_QUALIFICATION, validator, nextRoute: TECHNICAL_MANAGERS})

module.exports = Route.register('GET, REMOVE, UPLOAD', controller)
