'use strict'

const MemberDeleteController = require('../base/memberDelete.controller')
const PartnerDetails = require('../../../models/taskList/partnerDetails.task')

module.exports = class PartnershipPartnerDeleteController extends MemberDeleteController {
  get task () {
    return PartnerDetails
  }
}
