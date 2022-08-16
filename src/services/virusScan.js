
const LoggingService = require('../services/logging.service')
const NodeClam = require('clamscan')
const fs = require('fs')

const config = {
  clamdscan: {
    config_file: '/etc/clamav/clamd.conf',
    multiscan: true,
    reload_db: false,
    active: true
  }
}

module.exports = class VirusScan {
  static async isInfected (path) {
    const clamscan = await new NodeClam().init(config)

    // Scan the file
    const { file, isInfected, viruses } = await clamscan.isInfected(path)

    // If `is_infected` is TRUE, file is a virus!
    if (isInfected === false) {
      LoggingService.logDebug(`The file (${file}) you downloaded was just fine... Carry on...`)
    } else {
      if (isInfected === null) {
        LoggingService.logError('Virus scan failed')
      } else if (isInfected === true) {
        LoggingService.logError(`You've downloaded a virus (${viruses.join('')})!`)
      }

      // Remove the file (for good measure)
      if (fs.existsSync(path)) {
        fs.unlinkSync(path)
      }
    }

    return isInfected
  }
}
