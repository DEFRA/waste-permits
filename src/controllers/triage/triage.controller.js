'use strict'

const Routes = require('../../routes')

const BaseController = require('../base.controller')

const TriageList = require('../../models/triage/triageList.model')
const Application = require('../../models/triage/application.model')

const ActiveDirectoryAuthService = require('../../services/activeDirectoryAuth.service')
const authService = new ActiveDirectoryAuthService()

const { DEFRA_COOKIE_KEY, COOKIE_KEY: { APPLICATION_ID } } = require('../../constants')

module.exports = class TriageController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    const entityContext = { authToken: await authService.getToken() }

    const triageData = pageContext.triageData = await TriageController.initialiseDataFromParams(entityContext, request.params)
    const paths = TriageController.generatePathsFromData(pageContext.triageData)

    if (request.path !== paths.currentStepPath) {
      return this.redirect({ h, path: paths.currentStepPath })
    }

    pageContext.previousStepPath = paths.previousStepPath
    pageContext.previousPreviousStepPath = paths.previousPreviousStepPath

    if (!triageData.canApplyOnline) {
      return this.showViewFromRoute({ viewPropertyName: 'applyOfflineView', h, pageContext })
    }

    // Deal with the query string
    if (!triageData.selectedPermitTypes) {
      if (request.query && request.query['permit-type']) {
        triageData.availablePermitTypes.setSelectedByIds([request.query['permit-type']])
      }
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const entityContext = {}
    entityContext.authToken = await authService.getToken()
    entityContext.applicationId = request.state && request.state[DEFRA_COOKIE_KEY] ? request.state[DEFRA_COOKIE_KEY][APPLICATION_ID] : undefined
    const data = await TriageController.initialiseDataFromParams(entityContext, request.params)

    if (data.selectedOptionalWasteAssessments) {
      // POSTing confirmation - any POST to here constitutes confirmation
      await TriageController.saveApplication(request, entityContext, data)
      return this.redirect({ h, route: Routes.CONFIRM_COST })
    }

    if (data.selectedWasteActivities) {
      // POSTing optional waste assessments
      const requestedOptionalWasteAssessments = request.payload['assessment'] ? request.payload['assessment'].split(',') : []
      data.selectedOptionalWasteAssessments = data.availableOptionalWasteAssessments.getListFilteredByIds(requestedOptionalWasteAssessments)
      data.canApplyOnline = requestedOptionalWasteAssessments.length === 0 || data.selectedOptionalWasteAssessments.canApplyOnline
      if (data.canApplyOnline) {
        // SAVE and DONE
        await TriageController.saveApplication(request, entityContext, data)
        return this.redirect({ h, route: Routes.CONFIRM_COST })
      }
      const paths = TriageController.generatePathsFromData(data)
      return this.redirect({ h, path: paths.currentStepPath })
    }

    if (data.selectedMcpTypes) {
      // POSTing waste activities
      const requestedWasteActivities = request.payload['activity'] ? request.payload['activity'].split(',') : []
      const selectedWasteActivities = data.availableWasteActivities.getListFilteredByIds(requestedWasteActivities)
      if (selectedWasteActivities.items.length !== 0) {
        data.selectedWasteActivities = selectedWasteActivities
        data.canApplyOnline = selectedWasteActivities.canApplyOnline
        if (data.canApplyOnline) {
          // Check to see if there are any optional additional waste assessments that we want to ask for, otherwise we skip that step
          const { selectedWasteActivities } = data
          const optionalWasteAssessmentList = await TriageList.createOptionalWasteAssessmentsList(entityContext, { selectedWasteActivities })
          if (optionalWasteAssessmentList.items.length === 0) {
            data.selectedOptionalWasteAssessments = optionalWasteAssessmentList
            // SAVE and DONE
            await TriageController.saveApplication(request, entityContext, data)
            return this.redirect({ h, route: Routes.CONFIRM_COST })
          }
        }
      }
      const paths = TriageController.generatePathsFromData(data)
      return this.redirect({ h, path: paths.currentStepPath })
    }

    if (data.selectedFacilityTypes) {
      // POSTING MCP types
      const requestedMcpType = request.payload['mcp-type']
      const selectedMcpTypes = data.availableMcpTypes.getListFilteredByIds([requestedMcpType])
      // Only one mcp type is allowed
      if (selectedMcpTypes.items.length === 1) {
        data.selectedMcpTypes = selectedMcpTypes
        data.canApplyOnline = selectedMcpTypes.canApplyOnline
        if (data.canApplyOnline) {
          // Check to see if there are any waste activities available, otherwise we skip the next steps
          const { selectedPermitTypes, selectedFacilityTypes } = data
          const availableWasteActivitiesList = await TriageList.createWasteActivitiesList(entityContext, { selectedPermitTypes, selectedFacilityTypes })
          if (availableWasteActivitiesList.items.length === 0) {
            data.selectedWasteActivities = availableWasteActivitiesList
            data.selectedOptionalWasteAssessments = new TriageList([])
            // SAVE and DONE
            await TriageController.saveApplication(request, entityContext, data)
            return this.redirect({ h, route: Routes.MCP_EXISTING_PERMIT })
          }
        }
      }
      const paths = TriageController.generatePathsFromData(data)
      return this.redirect({ h, path: paths.currentStepPath })
    }

    if (data.selectedPermitHolderTypes) {
      // POSTing facility type(s)
      const requestedFacilityType = request.payload['facility-type']
      const selectedFacilityTypes = data.availableFacilityTypes.getListFilteredByIds([requestedFacilityType])
      // Currently only a single type of facility is allowed
      if (selectedFacilityTypes.items.length === 1) {
        data.selectedFacilityTypes = selectedFacilityTypes
        data.canApplyOnline = selectedFacilityTypes.canApplyOnline
        if (data.canApplyOnline) {
          // Check to see if there are any MCP types available, otherwise we skip that step
          const { selectedPermitTypes, selectedFacilityTypes } = data
          const availableMcpTypeList = await TriageList.createMcpTypesList(entityContext, { selectedPermitTypes, selectedFacilityTypes })
          if (availableMcpTypeList.items.length === 0) {
            data.selectedMcpTypes = availableMcpTypeList
            // Check to see if there are any waste activities available, otherwise we skip the next steps
            const availableWasteActivitiesList = await TriageList.createWasteActivitiesList(entityContext, { selectedPermitTypes, selectedFacilityTypes })
            if (availableWasteActivitiesList.items.length === 0) {
              data.selectedWasteActivities = availableWasteActivitiesList
              data.selectedOptionalWasteAssessments = new TriageList([])
              // SAVE and DONE
              await TriageController.saveApplication(request, entityContext, data)
              return this.redirect({ h, route: Routes.CONFIRM_COST })
            }
          }
        }
      }
      const paths = TriageController.generatePathsFromData(data)
      return this.redirect({ h, path: paths.currentStepPath })
    }

    if (data.selectedPermitTypes) {
      // POSTing permit holder type(s)
      const requestedPermitHolderType = request.payload['permit-holder-type']
      const selectedPermitHolderTypes = data.availablePermitHolderTypes.getListFilteredByIds([requestedPermitHolderType])
      if (selectedPermitHolderTypes.items.length === 1) {
        data.selectedPermitHolderTypes = selectedPermitHolderTypes
        data.canApplyOnline = selectedPermitHolderTypes.canApplyOnline
      }
      const paths = TriageController.generatePathsFromData(data)
      return this.redirect({ h, path: paths.currentStepPath })
    }

    // POSTing permit type(s)
    const requestedPermitType = request.payload['permit-type']
    const selectedPermitTypes = data.availablePermitTypes.getListFilteredByIds([requestedPermitType])
    if (selectedPermitTypes.items.length === 1) {
      data.selectedPermitTypes = selectedPermitTypes
      data.canApplyOnline = selectedPermitTypes.canApplyOnline

      // Currently standard rules steps out of triage - just go to the usual page
      if (requestedPermitType === 'standard-rules') {
        return this.redirect({ h, route: Routes.PERMIT_HOLDER_TYPE })
      }
    }
    const paths = TriageController.generatePathsFromData(data)
    return this.redirect({ h, path: paths.currentStepPath })
  }

  static async saveApplication (request, entityContext, triageData) {
    const application = await Application.getApplicationForId(entityContext)
    application.setPermitHolderType(triageData.selectedPermitHolderTypes.items[0])
    application.setMcpType(triageData.selectedMcpTypes.items[0])
    application.setWasteActivities(triageData.selectedWasteActivities.items)
    application.setWasteAssessments(triageData.selectedOptionalWasteAssessments.items)
    await application.save(entityContext)
  }

  static async initialiseDataFromParams (entityContext, params) {
    const data = { canApplyOnline: true }
    const decodeParamValue = TriageController.decodeParamValue

    data.availablePermitTypes = await TriageList.createPermitTypesList(entityContext)

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
          data.availablePermitHolderTypes = await TriageList.createPermitHolderTypesList(entityContext)
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
            const { selectedPermitTypes } = data
            data.availableFacilityTypes = await TriageList.createFacilityTypesList(entityContext, { selectedPermitTypes })
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
            const { selectedPermitTypes, selectedFacilityTypes } = data
            data.availableMcpTypes = await TriageList.createMcpTypesList(entityContext, { selectedPermitTypes, selectedFacilityTypes })
            if (data.availableMcpTypes.items.length === 0) {
              data.selectedMcpTypes = new TriageList([])
              data.availableWasteActivities = await TriageList.createWasteActivitiesList(entityContext, { selectedPermitTypes, selectedFacilityTypes })
              if (data.availableWasteActivities.items.length === 0) {
                data.selectedWasteActivities = new TriageList([])
                data.includedWasteAssessments = new TriageList([])
                data.availableOptionalWasteAssessments = new TriageList([])
                data.selectedOptionalWasteAssessments = new TriageList([])
                return data
              }
            }
          }
        }
      }
    }

    // If we've managed to select a valid facility type then check for MCP types
    if (data.selectedFacilityTypes && data.canApplyOnline) {
      const mcpTypeParam = decodeParamValue(params.mcpType)
      if (mcpTypeParam) {
        const chosenMcpTypeList = data.availableMcpTypes.getListFilteredByIds(mcpTypeParam)
        if (data.availableMcpTypes.items.length === 0) {
          // If there are no MCP types available we must have chosen none
          if (mcpTypeParam.length === 0) {
            data.selectedMcpTypes = chosenMcpTypeList
            const { selectedPermitTypes, selectedFacilityTypes } = data
            data.availableWasteActivities = await TriageList.createWasteActivitiesList(entityContext, { selectedPermitTypes, selectedFacilityTypes })
          }
        } else {
          // We have to have chosen valid entries from the list of available MCP types
          if (chosenMcpTypeList.items.length === mcpTypeParam.length) {
            data.selectedMcpTypes = chosenMcpTypeList
            data.canApplyOnline = chosenMcpTypeList.canApplyOnline
            if (data.canApplyOnline) {
              const { selectedPermitTypes, selectedFacilityTypes } = data
              data.availableWasteActivities = await TriageList.createWasteActivitiesList(entityContext, { selectedPermitTypes, selectedFacilityTypes })
              if (data.availableWasteActivities.items.length === 0) {
                data.selectedWasteActivities = new TriageList([])
                data.includedWasteAssessments = new TriageList([])
                data.availableOptionalWasteAssessments = new TriageList([])
                data.selectedOptionalWasteAssessments = new TriageList([])
                return data
              }
            }
          }
        }
      }
    }

    // If we've managed to select a valid MCP type then check for waste activities
    if (data.selectedMcpTypes && data.canApplyOnline) {
      const wasteActivityParam = decodeParamValue(params.wasteActivity)
      if (wasteActivityParam) {
        const chosenWasteActivityList = data.availableWasteActivities.getListFilteredByIds(wasteActivityParam)
        if (data.availableWasteActivities.items.length === 0) {
          // If there are no waste activities available we must have chosen none
          if (wasteActivityParam.length === 0) {
            data.selectedWasteActivities = chosenWasteActivityList
            data.includedWasteAssessments = new TriageList([])
            data.availableOptionalWasteAssessments = new TriageList([])
            data.selectedOptionalWasteAssessments = new TriageList([])
            return data
          }
        } else {
          // We have to have chosen valid entries from the list of available waste activities
          if (chosenWasteActivityList.items.length === wasteActivityParam.length) {
            data.selectedWasteActivities = chosenWasteActivityList
            data.canApplyOnline = chosenWasteActivityList.canApplyOnline
            if (data.canApplyOnline) {
              const { selectedWasteActivities } = data
              data.includedWasteAssessments = await TriageList.createIncludedWasteAssessmentsList(entityContext, { selectedWasteActivities })
              data.availableOptionalWasteAssessments = await TriageList.createOptionalWasteAssessmentsList(entityContext, { selectedWasteActivities })
            }
          }
        }
      }
    }

    // If we've managed to select valid waste activities then check for optional waste assessments
    if (data.selectedWasteActivities && data.canApplyOnline) {
      const wasteAssessmentParam = decodeParamValue(params.wasteAssessment)
      if (wasteAssessmentParam) {
        const chosenOptionalWasteAssessmentList = data.availableOptionalWasteAssessments.getListFilteredByIds(wasteAssessmentParam)
        // We have to have chosen valid entries from the list of available waste assessments
        if (chosenOptionalWasteAssessmentList.items.length === wasteAssessmentParam.length) {
          data.selectedOptionalWasteAssessments = chosenOptionalWasteAssessmentList
          data.canApplyOnline = chosenOptionalWasteAssessmentList.items.length === 0 || chosenOptionalWasteAssessmentList.canApplyOnline
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

    if (data.selectedMcpTypes) {
      pathItems.push(encodeParamValue(data.selectedMcpTypes.ids))
    }

    if (data.selectedWasteActivities) {
      pathItems.push(encodeParamValue(data.selectedWasteActivities.ids))
    }

    if (data.selectedOptionalWasteAssessments) {
      pathItems.push(encodeParamValue(data.selectedOptionalWasteAssessments.ids))
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
