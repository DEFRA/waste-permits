'use strict'

const Constants = require('../../constants')
const BaseTask = require('./base.task')
const Annotation = require('../../persistence/entities/annotation.entity')
const DataStore = require('../dataStore.model')

module.exports = class EmissionsAndMonitoring extends BaseTask {
  static async checkComplete (context) {
    const evidence = await Annotation.listByApplicationIdAndSubject(context, Constants.UploadSubject.EMISSIONS_AND_MONITORING_DETAILS)
    const { data: { emissionsAndMonitoringDetailsRequired } } = await DataStore.get(context)

    return emissionsAndMonitoringDetailsRequired === false || (emissionsAndMonitoringDetailsRequired === true && Boolean(evidence.length))
  }
}
