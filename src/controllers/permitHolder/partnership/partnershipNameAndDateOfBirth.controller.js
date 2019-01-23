'use strict'

const MemberNameAndDateOfBirthController = require('../base/memberNameAndDateOfBirth.controller')
const PartnerDetails = require('../../../models/taskList/partnerDetails.task')

module.exports = class PartnershipNameAndDateOfBirthController extends MemberNameAndDateOfBirthController {
  get task () {
    return PartnerDetails
  }
}
