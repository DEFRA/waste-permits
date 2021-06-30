'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const WasteActivities = require('../models/wasteActivities.model')

module.exports = class WasteActivityNameController extends BaseController {
  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h)
    const { duplicateWasteActivitiesValues } = await WasteActivities.get(context)

    const pageContext = this.createPageContext(h, errors)

    // Add attributes for form display (mostly for any errors)
    for (const activity of duplicateWasteActivitiesValues) {
      activity.formFieldId = 'activity-name-' + activity.index
      activity.errorFormFieldId = activity.formFieldId + '-error'
      // Attach any page errors to their activities
      if (pageContext.errors) {
        activity.formErrors = pageContext.errors[activity.formFieldId]
      }
      if (request.payload) {
        activity.referenceName = request.payload[activity.formFieldId]
      }
    }
    pageContext.activities = duplicateWasteActivitiesValues
    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const wasteActivities = await WasteActivities.get(context)
    const { duplicateWasteActivitiesValues } = wasteActivities

    // It is possible for the client to have failed to send values for all of the activities requiring names,
    // which will bypass the validation, so check here that all names have been supplied
    const requiredPayload = {}
    for (const activity of duplicateWasteActivitiesValues) {
      const formFieldId = 'activity-name-' + activity.index
      activity.referenceName = request.payload[formFieldId]
      requiredPayload[formFieldId] = activity.referenceName
    }

    const { error } = this.validator.formValidators.validate(requiredPayload, { abortEarly: false })
    if (error) {
      return this.doGet(request, h, error)
    } else {
      for (const activity of duplicateWasteActivitiesValues) {
        wasteActivities.setWasteActivityReferenceName(activity.index, activity.referenceName)
      }
      await wasteActivities.save(context)
    }

    return this.redirect({ h })
  }
}
