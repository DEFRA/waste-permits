module.exports = class controller {
  static getTemplate (options) {
    const { controllerName, hasView, hasSubmitButton } = options
    return `
'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')

module.exports = class ${controllerName}Controller extends BaseController {
  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h)
    ${hasView ? `
    const pageContext = this.createPageContext(h, errors)
    
    ${hasSubmitButton ? `
    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {
        'some-field': 'invalid'
      }    
    }` : ''}
    
    // ToDo: Add code here
    
    return this.showView({ h, pageContext })`
    : `
    // ToDo: Add code here
    
    return this.redirect({ h })`}
  }
  ${hasSubmitButton ? `
  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)

    const {
      'some-field': someField
    } = request.payload
    
    // ToDo: Add code here
    
    return this.redirect({ h })
  }` : ''}
}
            
`
  }
}
