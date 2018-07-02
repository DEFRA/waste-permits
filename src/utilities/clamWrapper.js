// Instantiates ClamAV and wraps it in promisify

const clamscan = require('clamscan')
let isInfected

module.exports = class ClamWrapper {
  static async isInfected (path) {
    this._init()
    return isInfected(path)
  }

  // Lazily instantiate clam so that the tests work without ClamAV installed
  static _init () {
    if (!isInfected) {
      const clam = clamscan({clamdscan: {config_file: '/etc/clamav/clamd.conf', multiscan: true, reload_db: false, active: true}})

      const {promisify} = require('es6-promisify')

      const isInfectedFunction = clam.is_infected.bind(clam)
      isInfectedFunction[promisify.argumentNames] = ['file', 'isInfected']
      isInfected = promisify(isInfectedFunction)
    }
  }
}
