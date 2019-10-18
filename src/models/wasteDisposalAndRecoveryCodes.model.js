'use strict'

const DataStore = require('../models/dataStore.model')
const ApplicationLine = require('../persistence/entities/applicationLine.entity')
const Item = require('../persistence/entities/item.entity')
const ApplicationAnswer = require('../persistence/entities/applicationAnswer.entity')

const DISPOSAL_CODES_APPLICATION_ANSWER = 'waste-disposal-codes'
const RECOVERY_CODES_APPLICATION_ANSWER = 'waste-recovery-codes'

const WASTE_DISPOSAL_CODE_LIST = [
  { id: 'd01', code: 'D01', description: 'Deposit into or onto land (for example, landfill, mining waste)' },
  { id: 'd02', code: 'D02', description: 'Land treatment (for example, biodegradation of liquid or sludgy discards in soils)' },
  { id: 'd03', code: 'D03', description: 'Deep injection (for example, injection of pumpable discards into wells, salt domes)' },
  { id: 'd04', code: 'D04', description: 'Surface impoundment (for example, placing liquid or sludgy discards into pits, ponds or lagoons)' },
  { id: 'd05', code: 'D05', description: 'Specially engineered landfill' },
  { id: 'd06', code: 'D06', description: 'Release into a water body except seas or oceans' },
  { id: 'd07', code: 'D07', description: 'Release to seas or oceans including sea-bed insertion' },
  { id: 'd08', code: 'D08', description: 'Biological treatment which results in final compounds or mixtures which are discarded by means of any of the operations numbered D1 to D12' },
  { id: 'd09', code: 'D09', description: 'Physico-chemical treatment which results in final compounds or mixtures which are discarded by means of any of the operations numbered D1 to D12' },
  { id: 'd10', code: 'D10', description: 'Incineration on land' },
  { id: 'd11', code: 'D11', description: 'Incineration at sea' },
  { id: 'd12', code: 'D12', description: 'Permanent storage (for example, emplacement of containers in a mine)' },
  { id: 'd13', code: 'D13', description: 'Blending or mixing prior to submission to any of the operations numbered D1 to D12' },
  { id: 'd14', code: 'D14', description: 'Repackaging prior to submission to any of the operations numbered D1 to D13' },
  { id: 'd15', code: 'D15', description: 'Storage pending any of the operations numbered D1 to D14 (excluding temporary storage, pending collection, on the site where the waste is produced)' }
]
const WASTE_DISPOSAL_ID_LIST = WASTE_DISPOSAL_CODE_LIST.map(({ id }) => id)

const WASTE_RECOVERY_CODE_LIST = [
  { id: 'r01', code: 'R01', description: 'Use principally as a fuel or other means to generate energy' },
  { id: 'r02', code: 'R02', description: 'Solvent reclamation or regeneration' },
  { id: 'r03', code: 'R03', description: 'Recycling or reclamation of organic substances which are not used as solvents' },
  { id: 'r04', code: 'R04', description: 'Recycling or reclamation of metals and metal compounds' },
  { id: 'r05', code: 'R05', description: 'Recycling or reclamation of other inorganic materials' },
  { id: 'r06', code: 'R06', description: 'Regeneration of acids or bases' },
  { id: 'r07', code: 'R07', description: 'Recovery of components used for pollution abatement' },
  { id: 'r08', code: 'R08', description: 'Recovery of components from catalysts' },
  { id: 'r09', code: 'R09', description: 'Oil re-refining or other reuses of oil' },
  { id: 'r10', code: 'R10', description: 'Land treatment resulting in benefit to agriculture or ecological improvement' },
  { id: 'r11', code: 'R11', description: 'Use of waste obtained from any of the operations numbered R1 to R10' },
  { id: 'r12', code: 'R12', description: 'Exchange of waste for submission to any of the operations numbered R1 to R11' },
  { id: 'r13', code: 'R13', description: 'Storage of waste pending any of the operations numbered R1 to R12' }
]
const WASTE_RECOVERY_ID_LIST = WASTE_RECOVERY_CODE_LIST.map(({ id }) => id)

const codesForSelection = (list, selection) => list.filter(({ id }) => selection.includes(id)).map(({ code }) => code)

const codesHaveBeenSelected = (codes) => {
  return Boolean(codes && (
    (codes.selectedWasteDisposalCodes && codes.selectedWasteDisposalCodes.length) ||
    (codes.selectedWasteRecoveryCodes && codes.selectedWasteRecoveryCodes.length)
  ))
}

module.exports = class WasteDisposalAndRecoveryCodes {
  constructor ({ forActivityIndex = 0, activityDisplayName = '', hasNext = false, selectedWasteDisposalCodes = [], selectedWasteRecoveryCodes = [] } = {}) {
    Object.assign(this, {
      forActivityIndex,
      activityDisplayName,
      hasNext,
      selectedWasteDisposalCodes: selectedWasteDisposalCodes.map((id) => id),
      selectedWasteRecoveryCodes: selectedWasteRecoveryCodes.map((id) => id)
    })
  }

  static async getForActivity (context, activityIndex) {
    const wasteActivityApplicationLines = await ApplicationLine.listForWasteActivities(context)
    const wasteActivityApplicationLine = wasteActivityApplicationLines[activityIndex]
    if (wasteActivityApplicationLine) {
      const hasNext = Boolean(wasteActivityApplicationLines[activityIndex + 1])
      const item = await Item.getById(context, wasteActivityApplicationLine.itemId)
      const itemName = item.itemName || ''
      const definedName = wasteActivityApplicationLine.lineName || ''
      const activityDisplayName = `${itemName} ${definedName}`.trim()
      const dataStore = await DataStore.get(context)
      const { applicationWasteDisposalAndRecoveryCodes = {} } = dataStore.data
      const codesForApplicationLine = applicationWasteDisposalAndRecoveryCodes[wasteActivityApplicationLine.id] || {}
      const { selectedWasteDisposalCodes, selectedWasteRecoveryCodes } = codesForApplicationLine

      return new WasteDisposalAndRecoveryCodes({ forActivityIndex: activityIndex, activityDisplayName, hasNext, selectedWasteDisposalCodes, selectedWasteRecoveryCodes })
    }
  }

  get wasteDisposalCodeList () {
    return WASTE_DISPOSAL_CODE_LIST.map(({ id, code, description }) => ({ id, code, description, selected: Boolean(this.selectedWasteDisposalCodes.includes(id)) }))
  }

  get wasteRecoveryCodeList () {
    return WASTE_RECOVERY_CODE_LIST.map(({ id, code, description }) => ({ id, code, description, selected: Boolean(this.selectedWasteRecoveryCodes.includes(id)) }))
  }

  setWasteDisposalCodes (wasteDisposalCodes) {
    this.selectedWasteDisposalCodes = WASTE_DISPOSAL_ID_LIST.filter((id) => wasteDisposalCodes.includes(id))
  }

  setWasteRecoveryCodes (wasteRecoveryCodes) {
    this.selectedWasteRecoveryCodes = WASTE_RECOVERY_ID_LIST.filter((id) => wasteRecoveryCodes.includes(id))
  }

  async save (context) {
    const wasteActivityApplicationLines = await ApplicationLine.listForWasteActivities(context)
    const wasteActivityApplicationLine = wasteActivityApplicationLines[this.forActivityIndex]
    if (wasteActivityApplicationLine) {
      const dataStore = await DataStore.get(context)
      const applicationWasteDisposalAndRecoveryCodes = dataStore.data.applicationWasteDisposalAndRecoveryCodes = dataStore.data.applicationWasteDisposalAndRecoveryCodes || {}
      applicationWasteDisposalAndRecoveryCodes[wasteActivityApplicationLine.id] = {
        selectedWasteDisposalCodes: this.selectedWasteDisposalCodes,
        selectedWasteRecoveryCodes: this.selectedWasteRecoveryCodes
      }
      await dataStore.save(context)

      // Also write a simplified list of codes for downstream use
      const applicationAnswer = new ApplicationAnswer({ applicationLineId: wasteActivityApplicationLine.id })
      applicationAnswer.questionCode = DISPOSAL_CODES_APPLICATION_ANSWER
      applicationAnswer.answerText = codesForSelection(WASTE_DISPOSAL_CODE_LIST, this.selectedWasteDisposalCodes).join(', ')
      await applicationAnswer.save(context)
      applicationAnswer.questionCode = RECOVERY_CODES_APPLICATION_ANSWER
      applicationAnswer.answerText = codesForSelection(WASTE_RECOVERY_CODE_LIST, this.selectedWasteRecoveryCodes).join(', ')
      await applicationAnswer.save(context)
    }
  }

  get codesHaveBeenSelected () {
    return codesHaveBeenSelected(this)
  }

  static async getAllCodesHaveBeenSelectedForApplication (context) {
    const dataStore = await DataStore.get(context)
    const wasteActivityApplicationLines = await ApplicationLine.listForWasteActivities(context)
    const { applicationWasteDisposalAndRecoveryCodes = {} } = dataStore.data

    return wasteActivityApplicationLines.every(({ id }) => codesHaveBeenSelected(applicationWasteDisposalAndRecoveryCodes[id]))
  }
}
