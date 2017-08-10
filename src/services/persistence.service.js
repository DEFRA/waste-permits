'use strict'

const config = require('../config/config')

module.exports = class PersistenceService {
  constructor (name) {
    console.log('PersistenceService constructor: ' + name + ' ' + config.crmWebApiHost)
    // console.log('constructor: ' + name)
    this._name = name
  }

  print () {
    console.log('print: ' + this._name)
  }

  createContact (contact, crmToken) {
    console.log('createContact: ' + crmToken)
    if (!crmToken) {
      // TODO

    }

    // Create the contact
  }
}

// module.exports = PersistenceService
