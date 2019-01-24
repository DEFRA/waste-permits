'use strict'

const MemberContactDetailsController = require('../base/memberContactDetails.controller')
const PartnerDetails = require('../../../models/taskList/partnerDetails.task')

module.exports = class PartnershipContactDetailsController extends MemberContactDetailsController {
  get task () {
    return PartnerDetails
  }
}
