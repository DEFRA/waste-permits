'use strict'

const fs = require('fs')

const Constants = module.exports = {}

Constants.APP = 'Waste Permits'
Constants.COOKIE_KEY = 'DefraSession'
Constants.GITHUB_LOCATION = 'https://github.com/DEFRA/waste-permits'

Constants.getLatestCommit = () => {
  // Read the latest Git commit reference
  return fs.readFileSync('latestCommit.json', 'utf8')
}

Constants.getVersion = () => {
  // Read the application version number
  let json = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  return json.version
}
