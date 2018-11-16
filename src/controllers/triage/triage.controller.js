'use strict'

const Routes = require('../../routes')

const BaseController = require('../base.controller')

const PermitTypeList = require('../../models/triage/permitTypeList.model')
const Application = require('../../models/triage/application.model')

const ActiveDirectoryAuthService = require('../../services/activeDirectoryAuth.service')
const authService = new ActiveDirectoryAuthService()

const { DEFRA_COOKIE_KEY, COOKIE_KEY: { APPLICATION_ID } } = require('../../constants')

module.exports = class TriageController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)

    const entityContext = { authToken: await authService.getToken() }

    const triageData = pageContext.triageData = await TriageController.initialiseDataFromParams(entityContext, request.params)
    const paths = TriageController.generatePathsFromData(pageContext.triageData)

    if (request.path !== paths.currentStepPath) {
      return this.redirect({ request, h, redirectPath: paths.currentStepPath })
    }

    pageContext.previousStepPath = paths.previousStepPath
    pageContext.previousPreviousStepPath = paths.previousPreviousStepPath

    if (!triageData.canApplyOnline) {
      return this.showViewFromRoute({ viewPropertyName: 'applyOfflineView', request, h, pageContext })
    }

    // Deal with the query string
    if (!triageData.selectedPermitTypes) {
      if (request.query && request.query['permit-type']) {
        triageData.availablePermitTypes.setSelectedByIds([request.query['permit-type']])
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
            if (data.selectedOptionalAssessments) {
              // POSTing confirmation - any POST to here constitutes confirmation
              await TriageController.saveApplication(request, entityContext, data)
              return this.redirect({ request, h, redirectPath: Routes.CONFIRM_COST.path })
            } else {
              // POSTing optional assessments
              const requestedOptionalAssessments = request.payload['assessment'] ? request.payload['assessment'].split(',') : []
              data.selectedOptionalAssessments = data.availableOptionalAssessments.getListFilteredByIds(requestedOptionalAssessments)
              data.canApplyOnline = requestedOptionalAssessments.length === 0 || data.selectedOptionalAssessments.canApplyOnline
              if (data.canApplyOnline) {
                // SAVE and DONE
                await TriageController.saveApplication(request, entityContext, data)
                return this.redirect({ request, h, redirectPath: Routes.CONFIRM_COST.path })
              }
            }
          } else {
            // POSTing activities
            const requestedActivities = request.payload['activity'] ? request.payload['activity'].split(',') : []
            const selectedActivities = data.availableActivities.getListFilteredByIds(requestedActivities)
            if (selectedActivities.items.length !== 0) {
              data.selectedActivities = selectedActivities
              data.canApplyOnline = selectedActivities.canApplyOnline
              if (data.canApplyOnline) {
                // Check to see if there are any optional additional assessments that we want to ask for, otherwise we skip that step
                const optionalAssessmentList = await data.selectedActivities.getOptionalAssessmentList()
                if (optionalAssessmentList.items.length === 0) {
                  data.selectedOptionalAssessments = optionalAssessmentList
                  // SAVE and DONE
                  await TriageController.saveApplication(request, entityContext, data)
                  return this.redirect({ request, h, redirectPath: Routes.CONFIRM_COST.path })
                }
              }
            }
          }
        } else {
          // POSTing facility type(s)
          const requestedFacilityType = request.payload['facility-type']
          const selectedFacilityTypes = data.availableFacilityTypes.getListFilteredByIds([requestedFacilityType])
          // Currently only waste facilities are supported online
          if (selectedFacilityTypes.items.length === 1) {
            data.selectedFacilityTypes = selectedFacilityTypes
            data.canApplyOnline = selectedFacilityTypes.canApplyOnline
          }
        }
      } else {
        // POSTing permit holder type(s)
        const requestedPermitHolderType = request.payload['permit-holder-type']
        const selectedPermitHolderTypes = data.availablePermitHolderTypes.getListFilteredByIds([requestedPermitHolderType])
        if (selectedPermitHolderTypes.items.length === 1) {
          data.selectedPermitHolderTypes = selectedPermitHolderTypes
          data.canApplyOnline = selectedPermitHolderTypes.canApplyOnline
        }
      }
    } else {
      // POSTing permit type(s)
      const requestedPermitType = request.payload['permit-type']
      const selectedPermitTypes = data.availablePermitTypes.getListFilteredByIds([requestedPermitType])
      if (selectedPermitTypes.items.length === 1) {
        data.selectedPermitTypes = selectedPermitTypes
        data.canApplyOnline = selectedPermitTypes.canApplyOnline

        // Currently standard rules steps out of triage - just go to the usual page
        if (requestedPermitType === 'standard-rules') {
          return this.redirect({ request, h, redirectPath: Routes.PERMIT_HOLDER_TYPE.path })
        }
      }
    }

    const paths = TriageController.generatePathsFromData(data)

    return this.redirect({ request, h, redirectPath: paths.currentStepPath })
  }

  static async saveApplication (request, entityContext, triageData) {
    const applicationId = request.state[DEFRA_COOKIE_KEY] ? request.state[DEFRA_COOKIE_KEY][APPLICATION_ID] : undefined
    const application = await Application.getApplicationForId(entityContext, applicationId)
    application.setPermitHolderType(triageData.selectedPermitHolderTypes.items[0])
    application.setActivities(triageData.selectedActivities.items)
    application.setAssessments(triageData.selectedOptionalAssessments.items)
    await application.save(entityContext)
  }

  static async initialiseDataFromParams (entityContext, params) {
    const data = { canApplyOnline: true }
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
        data.canApplyOnline = chosenPermitTypeList.canApplyOnline
        if (data.canApplyOnline) {
          data.availablePermitHolderTypes = await data.selectedPermitTypes.getPermitHolderTypeList()
        }
      }
    }

    // If we've managed to select a valid permit type then check for permit holder types
    if (data.selectedPermitTypes && data.canApplyOnline) {
      const permitHolderTypeParam = decodeParamValue(params.permitHolderType)
      // We have to have chosen exactly one permit holder type
      if (permitHolderTypeParam && permitHolderTypeParam.length === 1) {
        const chosenPermitHolderTypeList = data.availablePermitHolderTypes.getListFilteredByIds(permitHolderTypeParam)
        // We have to have chosen a valid entry from the list of available types of permit holder
        if (chosenPermitHolderTypeList.items.length === 1) {
          data.selectedPermitHolderTypes = chosenPermitHolderTypeList
          data.canApplyOnline = chosenPermitHolderTypeList.canApplyOnline
          if (data.canApplyOnline) {
            data.availableFacilityTypes = await data.selectedPermitHolderTypes.getFacilityTypeList()
          }
        }
      }
    }

    // If we've managed to select a valid permit holder type then check for facility types
    if (data.selectedPermitHolderTypes && data.canApplyOnline) {
      const facilityTypeParam = decodeParamValue(params.facilityType)
      // We have to have chosen exactly one facility type
      if (facilityTypeParam && facilityTypeParam.length === 1) {
        const chosenFacilityTypeList = data.availableFacilityTypes.getListFilteredByIds(facilityTypeParam)
        // We have to have chosen a valid entry from the list of available types of facility
        if (chosenFacilityTypeList.items.length === 1) {
          data.selectedFacilityTypes = chosenFacilityTypeList
          data.canApplyOnline = chosenFacilityTypeList.canApplyOnline
          if (data.canApplyOnline) {
            data.availableActivities = await data.selectedFacilityTypes.getActivityList()
          }
        }
      }
    }

    // If we've managed to select a valid facility type then check for activities
    if (data.selectedFacilityTypes && data.canApplyOnline) {
      const activityParam = decodeParamValue(params.activity)
      // We have to have chosen at least one activity
      if (activityParam && activityParam.length !== 0) {
        const chosenActivityList = data.availableActivities.getListFilteredByIds(activityParam)
        // We have to have chosen valid entries from the list of available activities
        if (chosenActivityList.items.length === activityParam.length) {
          data.selectedActivities = chosenActivityList
          data.canApplyOnline = chosenActivityList.canApplyOnline
          if (data.canApplyOnline) {
            data.includedAssessments = await data.selectedActivities.getIncludedAssessmentList()
            data.availableOptionalAssessments = await data.selectedActivities.getOptionalAssessmentList()
          }
        }
      }
    }

    // If we've managed to select valid activities then check for optional assessments
    if (data.selectedActivities && data.canApplyOnline) {
      const assessmentParam = decodeParamValue(params.assessment)
      if (assessmentParam) {
        const chosenOptionalAssessmentList = data.availableOptionalAssessments.getListFilteredByIds(assessmentParam)
        // We have to have chosen valid entries from the list of available assessments
        if (chosenOptionalAssessmentList.items.length === assessmentParam.length) {
          data.selectedOptionalAssessments = chosenOptionalAssessmentList
          data.canApplyOnline = chosenOptionalAssessmentList.items.length === 0 || chosenOptionalAssessmentList.canApplyOnline
        }
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

    const pathPrefix = Routes.TRIAGE_PERMIT_TYPE.path
    const currentStepPath = pathItems.join('/')
    const paths = pathItems.map((item, index, array) => array.slice(0, index).join('/'))
    paths.push(currentStepPath)
    const fullPaths = paths.map((item) => item === '' ? pathPrefix : `${pathPrefix}/${item}`).reverse()
    return {
      currentStepPath: fullPaths[0],
      previousStepPath: fullPaths[1],
      previousPreviousStepPath: fullPaths[2]
    }
  }
}
