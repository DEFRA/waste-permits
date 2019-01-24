'use strict'

const MemberListController = require('../base/memberList.controller')
const PartnerDetails = require('../../../models/taskList/partnerDetails.task')

module.exports = class PartnershipListController extends MemberListController {
  get task () {
    return PartnerDetails
  }
}
