'use strict'

const Constants = require('../../constants')
const DynamicsDalService = require('../../services/dynamicsDal.service')
const BaseModel = require('../base.model')
const LoggingService = require('../../services/logging.service')
const Account = require('../account.model')
const Application = require('../application.model')
const ApplicationLine = require('../applicationLine.model')
const Contact = require('../contact.model')
const AddressDetail = require('../addressDetail.model')

module.exports = class PermitHolderDetails extends BaseModel {
  constructor (data) {
    super()
    this.applicationLineId = data.applicationLineId
  }

  static async updateCompleteness (authToken, applicationId, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(authToken)

    try {
      const applicationLine = await ApplicationLine.getById(authToken, applicationLineId)
      const isComplete = await PermitHolderDetails.isComplete(authToken, applicationId, applicationLineId)

      const entity = {
        [Constants.Dynamics.CompletedParamters.PERMIT_HOLDER_DETAILS]: isComplete
      }
      const query = `defra_wasteparamses(${applicationLine.parametersId})`
      await dynamicsDal.update(query, entity)
    } catch (error) {
      LoggingService.logError(`Unable to update CompanyDetails completeness: ${error}`)
      throw error
    }
  }

  static async isComplete (authToken, applicationId) {
    let isComplete = false
    try {
      const {isIndividual, accountId, permitHolderIndividualId} = await Application.getById(authToken, applicationId)

      if (isIndividual) {
        // Get the Contact for this application
        const contact = await Contact.getById(authToken, permitHolderIndividualId)
        const addressDetail = await AddressDetail.getIndividualPermitHolderDetails(authToken, applicationId)
        isComplete = Boolean(contact && contact.firstName && contact.lastName && addressDetail.dateOfBirth && addressDetail.telephone)
      } else {
        // Get the Account for this application
        const account = await Account.getById(authToken, accountId)
        isComplete = Boolean(account && account.accountName)
      }
    } catch (error) {
      LoggingService.logError(`Unable to calculate PermitHolderDetails completeness: ${error}`)
      throw error
    }
    return isComplete
  }
}
