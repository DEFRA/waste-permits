// Instantiates ClamAV and wraps it in promisify

const clamscan = require('clamscan')
const clam = clamscan({clamdscan: {config_file: '/etc/clamav/clamd.conf', reload_db: false, active: true}})

const {promisify} = require('es6-promisify')

const isInfectedFunction = clam.is_infected.bind(clam)
isInfectedFunction[promisify.argumentNames] = ['file', 'isInfected']
const isInfected = promisify(isInfectedFunction)

module.exports = class ClamWrapper {
  static async isInfected (path) {
    return isInfected(path)
  }
}
