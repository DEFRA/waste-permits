const BaseCheck = require('./base.check')
const { UploadSubject } = require('../../constants')

const { NOISE_VIBRATION_DOCUMENTS } = require('../../tasks').tasks
const { NOISE_VIBRATION_DOCUMENTS: { path } } = require('../../routes')

module.exports = class NoiseVibrationDocumentsCheck extends BaseCheck {
  static get task () {
    return NOISE_VIBRATION_DOCUMENTS
  }

  get prefix () {
    return `${super.prefix}-noise-vibration-documents`
  }

  async buildLines () {
    return Promise.all([this.getNoiseVibrationDocumentsLine()])
  }

  async getNoiseVibrationDocumentsLine () {
    const evidence = await this.getUploadedFileDetails(UploadSubject.NOISE_VIBRATION_DOCUMENTS, 'noiseVibrationDocuments')
    return this.buildLine({
      heading: 'Noise and vibration emissions documents',
      answers: evidence.map((file) => file.filename),
      links: [
        { path, type: 'noise and vibration emissions documents' }
      ]
    })
  }
}
