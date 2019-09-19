'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const NeedToConsultModel = require('../models/needToConsult.model')

module.exports = class NeedToConsultController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const context = await RecoveryService.createApplicationContext(h)
      const consult = await NeedToConsultModel.get(context)
      pageContext.formValues = {
        'consult-sewer-required': consult.sewer,
        'consult-sewerage-undertaker': consult.sewer ? consult.sewerageUndertaker : '',
        'consult-harbour-required': consult.harbour,
        'consult-harbour-authority': consult.harbour ? consult.harbourAuthority : '',
        'consult-fisheries-required': consult.fisheries,
        'consult-fisheries-committee': consult.fisheries ? consult.fisheriesCommittee : '',
        'consult-none-required': consult.none
      }
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)

    const {
      'consult-sewer-required': consultSewerRequired,
      'consult-sewerage-undertaker': consultSewerageUndertaker,
      'consult-harbour-required': consultHarbourRequired,
      'consult-harbour-authority': consultHarbourAuthority,
      'consult-fisheries-required': consultFisheriesRequired,
      'consult-fisheries-committee': consultFisheriesCommittee,
      'consult-none-required': consultNoneRequired
    } = request.payload

    const consult = {
      sewer: false,
      sewerageUndertaker: undefined,
      harbour: false,
      harbourAuthority: undefined,
      fisheries: false,
      fisheriesCommittee: undefined,
      none: false
    }

    if (consultNoneRequired === 'yes') {
      consult.none = true
    } else {
      if (consultSewerRequired === 'yes') {
        consult.sewer = true
        consult.sewerageUndertaker = consultSewerageUndertaker
      }
      if (consultHarbourRequired === 'yes') {
        consult.harbour = true
        consult.harbourAuthority = consultHarbourAuthority
      }
      if (consultFisheriesRequired === 'yes') {
        consult.fisheries = true
        consult.fisheriesCommittee = consultFisheriesCommittee
      }
    }

    const consultModel = new NeedToConsultModel(consult)
    await consultModel.save(context)

    return this.redirect({ h })
  }
}
