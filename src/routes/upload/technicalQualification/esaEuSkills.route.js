'use strict'

const Constants = require('../../../constants')
const Route = require('../base/uploadRoute')
const {UPLOAD_ESA_EU_SKILLS, TASK_LIST} = Constants.Routes
const EsaEuSkillsController = require('../../../controllers/upload/technicalQualification/esaEuSkills.controller')
const UploadValidator = require('../../../validators/upload/upload.validator')

const validator = new UploadValidator()
const controller = new EsaEuSkillsController({route: UPLOAD_ESA_EU_SKILLS, validator, nextRoute: TASK_LIST})

module.exports = Route.register('GET, REMOVE, UPLOAD', controller)
