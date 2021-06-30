module.exports = class controller {
  static getBaseTemplate (options) {
    const { controllerName, hasView, hasSubmitButton } = options
    return `
'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')

module.exports = class ${controllerName}Controller extends BaseController {
  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h)
    ${hasView
      ? `
    const pageContext = this.createPageContext(h, errors)
    
    ${hasSubmitButton
      ? `
    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {
        'some-data': 'valid'
      }    
    }`
      : ''}
    
    // ToDo: Add code here
    
    return this.showView({ h, pageContext })`
      : `
    // ToDo: Add code here
    
    return this.redirect({ h })`}
  }
  ${hasSubmitButton
    ? `
  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)

    const {
      'some-data': someData
    } = request.payload
    
    // ToDo: Add code here
    
    return this.redirect({ h })
  }`
    : ''}
}            
`
  }

  static getUploadTemplate (options) {
    const { controllerName } = options
    return `
'use strict'

const UploadController = require('./upload.controller')
const RecoveryService = require('../services/recovery.service')
    
module.exports = class ${controllerName}Controller extends UploadController {
  async getSpecificPageContext (h, pageContext) {
    return {
      example: 'example page content'
    }
  }
}
`
  }
}
