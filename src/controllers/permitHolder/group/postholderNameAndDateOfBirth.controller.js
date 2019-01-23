'use strict'

const MemberNameAndDateOfBirthController = require('../base/memberNameAndDateOfBirth.controller')
const PostholderDetails = require('../../../models/taskList/postholderDetails.task')

module.exports = class PostholderNameAndDateOfBirthController extends MemberNameAndDateOfBirthController {
  get task () {
    return PostholderDetails
  }
}
