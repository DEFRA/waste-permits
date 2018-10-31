'use strict'

const Routes = require('../../routes')

const BaseController = require('../base.controller')

const PermitTypeList = require('../../models/triage/permitTypeList.model')

const ActiveDirectoryAuthService = require('../../services/activeDirectoryAuth.service')
const authService = new ActiveDirectoryAuthService()

module.exports = class TriageController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)

    const entityContext = {}
    entityContext.authToken = await authService.getToken()

    pageContext.triageData = await TriageController.initialiseDataFromParams(entityContext, request.params)
    const paths = TriageController.generatePathsFromData(pageContext.triageData)
    pageContext.previousStepPath = paths.previousStepPath

    // Deal with the query string
    if (!pageContext.triageData.selectedPermitTypes) {
      if (request.query && request.query['permit-type']) {
        pageContext.triageData.availablePermitTypes.setSelectedByIds([request.query['permit-type']])
      }
    }

    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    }

    const entityContext = {}
    entityContext.authToken = await authService.getToken()
    const data = await TriageController.initialiseDataFromParams(entityContext, request.params)

    if (data.selectedPermitTypes) {
      if (data.selectedPermitHolderTypes) {
        if (data.selectedFacilityTypes) {
          if (data.selectedActivities) {
            // POSTing optional assessments
            const selectedOptionalAssessments = request.payload['assessment'] ? request.payload['assessment'].split(',') : []
            data.selectedOptionalAssessments = data.availableOptionalAssessments.getListFilteredByIds(selectedOptionalAssessments)
          } else {
            // POSTing activities
            const selectedActivities = request.payload['activity'] ? request.payload['activity'].split(',') : []
            data.selectedActivities = data.availableActivities.getListFilteredByIds(selectedActivities)
            if (!data.selectedActivities.canApplyOnline) {
              return this.redirect({ request, h, redirectPath: Routes.BESPOKE_APPLY_OFFLINE.path })
            } else {
              data.selectedOptionalAssessments = { ids: [] }
              // Currently we're not handling assessments
              // // Check to see if there are any optional additional assessments that we want to ask for, otherwise we skip that step
              // const optionalAssessmentList = await data.selectedActivities.getOptionalAssessmentList()
              // if (optionalAssessmentList.length === 0) {
              //   data.selectedOptionalAssessments = { ids: [] }
              // }
            }
          }
        } else {
          // POSTing facility type(s)
          const selectedFacilityType = request.payload['facility-type']
          data.selectedFacilityTypes = data.availableFacilityTypes.getListFilteredByIds([selectedFacilityType])
          // Currently only waste facilities are supported online
          if (!data.selectedFacilityTypes.canApplyOnline) {
            return this.redirect({ request, h, redirectPath: Routes.BESPOKE_APPLY_OFFLINE.path })
          }
        }
      } else {
        // POSTing permit holder type(s)
        const selectedPermitHolderType = request.payload['permit-holder-type']
        data.selectedPermitHolderTypes = data.availablePermitHolderTypes.getListFilteredByIds([selectedPermitHolderType])
        if (!data.selectedPermitHolderTypes.canApplyOnline) {
          return this.redirect({ request, h, redirectPath: Routes.BESPOKE_APPLY_OFFLINE.path })
        }
      }
    } else {
      // POSTing permit type(s)
      const selectedPermitType = request.payload['permit-type']
      data.selectedPermitTypes = data.availablePermitTypes.getListFilteredByIds([selectedPermitType])

      // Currently standard rules steps out of triage - just go to the usual page
      if (selectedPermitType === 'standard-rules') {
        return this.redirect({ request, h, redirectPath: Routes.PERMIT_HOLDER_TYPE.path })
      } else if (!data.selectedPermitTypes.canApplyOnline) {
        return this.redirect({ request, h, redirectPath: Routes.BESPOKE_APPLY_OFFLINE.path })
      }
    }

    const paths = TriageController.generatePathsFromData(data)

    return this.redirect({ request, h, redirectPath: paths.currentStepPath })
  }

  static async initialiseDataFromParams (entityContext, params) {
    const data = {}
    const decodeParamValue = TriageController.decodeParamValue

    data.availablePermitTypes = await PermitTypeList.getListOfAllPermitTypes(entityContext)

    // See if we've got a permit type
    const permitTypeParam = decodeParamValue(params.permitType)
    // We have to have chosen exactly one permit type
    if (permitTypeParam && permitTypeParam.length === 1) {
      const chosenPermitTypeList = data.availablePermitTypes.getListFilteredByIds(permitTypeParam)
      // We have to have chosen a valid permit type
      if (chosenPermitTypeList.items.length === 1) {
        data.selectedPermitTypes = chosenPermitTypeList
        data.availablePermitHolderTypes = await data.selectedPermitTypes.getPermitHolderTypeList()
      }
    }

    // If we've managed to select a valid permit type then check for permit holder types
    if (data.selectedPermitTypes) {
      const permitHolderTypeParam = decodeParamValue(params.permitHolderType)
      // We have to have chosen exactly one permit holder type
      if (permitHolderTypeParam && permitHolderTypeParam.length === 1) {
        const chosenPermitHolderTypeList = data.availablePermitHolderTypes.getListFilteredByIds(permitHolderTypeParam)
        // We have to have chosen a valid entry from the list of available types of permit holder
        if (chosenPermitHolderTypeList.items.length === 1) {
          data.selectedPermitHolderTypes = chosenPermitHolderTypeList
          data.availableFacilityTypes = await data.selectedPermitHolderTypes.getFacilityTypeList()
        }
      }
    }

    // If we've managed to select a valid permit holder type then check for facility types
    if (data.selectedPermitHolderTypes) {
      const facilityTypeParam = decodeParamValue(params.facilityType)
      // We have to have chosen exactly one facility type
      if (facilityTypeParam && facilityTypeParam.length === 1) {
        const chosenFacilityTypeList = data.availableFacilityTypes.getListFilteredByIds(facilityTypeParam)
        // We have to have chosen a valid entry from the list of available types of facility
        if (chosenFacilityTypeList.items.length === 1) {
          data.selectedFacilityTypes = chosenFacilityTypeList
          data.availableActivities = await data.selectedFacilityTypes.getActivityList()
        }
      }
    }

    // If we've managed to select a valid facility type then check for activities
    if (data.selectedFacilityTypes) {
      const activityParam = decodeParamValue(params.activity)
      // We have to have chosen at least one activity
      if (activityParam && activityParam.length !== 0) {
        const chosenActivityList = data.availableActivities.getListFilteredByIds(activityParam)
        // We have to have chosen valid entries from the list of available activities
        if (chosenActivityList.items.length === activityParam.length) {
          data.selectedActivities = chosenActivityList
          data.includedAssessments = await data.selectedActivities.getIncludedAssessmentList()
          data.availableOptionalAssessments = await data.selectedActivities.getOptionalAssessmentList()
        }
      }
    }

    // If we've managed to select valid activities then check for optional assessments
    if (data.selectedActivities) {
      const assessmentParam = decodeParamValue(params.assessment)
      if (assessmentParam) {
        data.selectedOptionalAssessments = { ids: [] }
        // Currently we're not handling assessments
        // const chosenOptionalAssessmentList = data.availableOptionalAssessments.getListFilteredByIds(assessmentParam)
        // // We have to have chosen valid entries from the list of available assessments
        // if (chosenOptionalAssessmentList.items.length === assessmentParam.length) {
        //   data.selectedOptionalAssessments = chosenOptionalAssessmentList
        // }
      }
    }

    return data
  }

  static decodeParamValue (param) {
    if (param) {
      if (param === '--') {
        return []
      }
      return param.split('+')
    }
  }

  static encodeParamValue (ids) {
    if (ids.length === 0) {
      return '--'
    }
    return ids.join('+')
  }

  static generatePathsFromData (data) {
    const encodeParamValue = TriageController.encodeParamValue
    const pathItems = []

    if (data.selectedPermitTypes) {
      pathItems.push(encodeParamValue(data.selectedPermitTypes.ids))
    }

    if (data.selectedPermitHolderTypes) {
      pathItems.push(encodeParamValue(data.selectedPermitHolderTypes.ids))
    }

    if (data.selectedFacilityTypes) {
      pathItems.push(encodeParamValue(data.selectedFacilityTypes.ids))
    }

    if (data.selectedActivities) {
      pathItems.push(encodeParamValue(data.selectedActivities.ids))
    }

    if (data.selectedOptionalAssessments) {
      pathItems.push(encodeParamValue(data.selectedOptionalAssessments.ids))
    }

    if (pathItems.length === 0) {
      return {
        currentStepPath: '/triage'
      }
    } else if (pathItems.length === 1) {
      return {
        currentStepPath: `/triage/${pathItems[0]}`,
        previousStepPath: '/triage'
      }
    } else {
      return {
        currentStepPath: `/triage/${pathItems.join('/')}`,
        previousStepPath: `/triage/${pathItems.slice(0, -1).join('/')}`
      }
    }
  }
}
