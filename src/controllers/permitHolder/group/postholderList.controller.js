'use strict'

const MemberListController = require('../base/memberList.controller')
const PostholderDetails = require('../../../models/taskList/postholderDetails.task')

module.exports = class PostholderListController extends MemberListController {
  get task () {
    return PostholderDetails
  }
}
