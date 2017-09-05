'use strict'

const fs = require('fs')

const Constants = module.exports = {}

Constants.SERVICE_NAME = 'Waste Permits'
Constants.GDS_NAME = 'GOV.UK'
Constants.COOKIE_KEY = 'DefraSession'
Constants.GITHUB_LOCATION = 'https://github.com/DEFRA/waste-permits'
Constants.TIMESTAMP_FORMAT = 'DD/MM/YYYY HH:mm:ss'
Constants.PAGE_TITLE_ERROR_PREFIX = 'Problem: '

Constants.Routes = {
  ROOT: {
    path: '/',
    pageHeading: 'Waste Permits Home Page'
  },
  CONTACT: {
    path: '/contact',
    pageHeading: 'Who should we contact about this application?'
  },
  CONTACTSEARCH: {
    path: '/contact-search',
    pageHeading: 'Contact search'
  },
  ERROR: {
    path: '/error',
    pageHeading: 'Something went wrong'
  },
  HEALTH: {
    path: '/health',
    pageHeading: 'Health'
  },
  SITE: {
    path: '/site',
    pageHeading: `What's the site name?`
  },
  TASK_LIST: {
    path: '/task-list',
    pageHeading: 'Task List'
  },
  VERSION: {
    path: '/version',
    pageHeading: 'Waste Permits'
  }
}

Constants.buildPageTitle = (pageHeading) => {
  return `${pageHeading} - ${Constants.SERVICE_NAME} - ${Constants.GDS_NAME}`
}

Constants.getLatestCommit = () => {
  let latestCommit
  try {
    // Read the latest Git commit reference
    latestCommit = fs.readFileSync('latestCommit.json', 'utf8')
  } catch (err) {
    latestCommit = 'Unknown'
  }
  return latestCommit
}

Constants.getVersion = () => {
  let version
  try {
    // Read the application version number
    let json = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    if (json) {
      version = json.version
    } else {
      throw new Error('Application version not found')
    }
  } catch (err) {
    version = 'Unknown'
  }
  return version
}
