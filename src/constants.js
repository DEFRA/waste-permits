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
  CONFIDENTIALITY: {
    path: '/confidentiality',
    pageHeading: 'Is part of your application commercially confidential?'
  },
  CONTACT_DETAILS: {
    path: '/contact-details',
    pageHeading: 'Who should we contact about this application?'
  },
  CONTACTSEARCH: {
    path: '/contact-search',
    pageHeading: 'Contact search'
  },
  COST_TIME: {
    path: '/cost-time',
    pageHeading: 'Cost and time for this permit'
  },
  DRAINAGE_TYPE_DRAIN: {
    path: '/drainage-type/drain',
    pageHeading: 'Where does the vehicle storage area drain to?'
  },
  ERROR: {
    path: '/error',
    pageHeading: 'Something went wrong'
  },
  FIRE_PREVENTION_PLAN: {
    path: '/fire-prevention-plan',
    pageHeading: 'Upload the fire prevention plan'
  },
  HEALTH: {
    path: '/health',
    pageHeading: 'Health'
  },
  MANAGEMENT_SYSTEM: {
    path: '/management-system',
    pageHeading: 'Which management system will you use?'
  },
  PERMIT_HOLDER_TYPE: {
    path: '/permit-holder/type',
    pageHeading: 'Who will be the permit holder?'
  },
  PRE_APPLICATION: {
    path: '/pre-application',
    pageHeading: 'Have you discussed this application with us?'
  },
  SITE_PLAN: {
    path: '/site-plan',
    pageHeading: 'Upload the site plan'
  },
  SITE_SITE_NAME: {
    path: '/site/site-name',
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
  TECHNICAL_QUALIFICATION: {
    path: '/technical-qualification',
    pageHeading: 'Which qualification does the person providing technical management have?'
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
