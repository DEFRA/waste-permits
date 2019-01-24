'use strict'

const MemberDeleteController = require('../base/memberDelete.controller')
const PostholderDetails = require('../../../models/taskList/postholderDetails.task')

module.exports = class PostholderDeleteController extends MemberDeleteController {
  get task () {
    return PostholderDetails
  }
}
