const BaseCheck = require('./base.check')
const Constants = require('../../constants')

const { WASTE_TYPES_LIST } = require('../../tasks').tasks
const { WASTE_TYPES_LIST: { path } } = require('../../routes')

module.exports = class WasteTypesListCheck extends BaseCheck {
  static get task () {
    return WASTE_TYPES_LIST
  }

  get prefix () {
    return `${super.prefix}-waste-types-list`
  }

  async buildLines () {
    return Promise.all([this.getWasteTypesListLine()])
  }

  async getWasteTypesListLine () {
    const evidence = await this.getUploadedFileDetails(Constants.UploadSubject.WASTE_TYPES_LIST, 'wasteTypesList')
    return this.buildLine({
      heading: 'Types of waste list',
      answers: evidence.map((file) => file.filename),
      links: [
        { path, type: 'type of waste' }
      ]
    })
  }
}
