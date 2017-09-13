'use strict'

const fs = require('fs')

const Constants = module.exports = {}

Constants.SERVICE_NAME = 'Waste Permits'
Constants.GDS_NAME = 'GOV.UK'
Constants.COOKIE_KEY = 'DefraSession'
Constants.COOKIE_PATH = { path: '/' }
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
  CHECK_YOUR_EMAIL: {
    path: '/save-and-return/check-your-email',
    pageHeading: `Search for 'standard rules permit application' in your email`
  },
  CONTACT_SEARCH: {
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
  PERMIT_CATEGORY: {
    path: '/permit-category',
    pageHeading: 'What do you want the permit for?'
  },
  SITE: {
    path: '/site',
    pageHeading: `What's the site name?`
  },
  START_OR_OPEN_SAVED: {
    path: `/start/start-or-open-saved`,
    pageHeading: 'Apply for a standard rules waste permit'
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

Constants.PermitTypes = {
  STANDARD_RULES: {
    cost: {
      lower: 720,
      upper: 1690
    }
  }
}

Constants.buildPageTitle = (pageHeading) => {
  return `${pageHeading} - ${Constants.SERVICE_NAME} - ${Constants.GDS_NAME}`
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
