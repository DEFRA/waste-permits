'use strict'

const MemberContactDetailsController = require('../base/memberContactDetails.controller')
const PostholderDetails = require('../../../models/taskList/postholderDetails.task')

module.exports = class PostholderContactDetailsController extends MemberContactDetailsController {
  get task () {
    return PostholderDetails
  }
}
