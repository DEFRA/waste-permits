const handlebars = require('handlebars')
const Path = require('path')
const fs = require('fs')

const cacheBust = (source) => {
  // Get the application version number
  let version = require(Path.join(__dirname, '..', '..', 'package.json')).version

  // Replace the token in the source string with the application version number to bust the browser cache
  return source.replace(/APP_VERSION/g, version)
}

const loadCommonPartial = (partialName) => {
  return String(fs.readFileSync((Path.join(__dirname, 'partials', 'common', partialName + '.html'))))
}

const defaultContext = {
  assetPath: '/public/',
  topOfPage: '',
  head: cacheBust(loadCommonPartial('head')),
  pageTitle: 'Generic Page',
  htmlLang: 'en',
  bodyClasses: '',
  bodyStart: loadCommonPartial('bodyStart'),
  skipLinkMessage: '',
  cookieMessage: '<p>We use cookies to store information about your actions on this site and to count visits. <a href="/information/cookies">Find out more about these cookies</a>.</p>',
  headerClass: 'with-proposition',
  homepageUrl: 'https://www.gov.uk',
  logoLinkTitle: 'Go to the GOV.UK homepage',
  globalHeaderText: 'GOV.UK',
  insideHeader: '',
  propositionHeader: loadCommonPartial('propositionHeader'),
  afterHeader: '',
  footerTop: loadCommonPartial('footerTop'),
  footerSupportLinks: '',
  licenceMessage: loadCommonPartial('licenceMessage'),
  crownCopyrightMessage: '© Crown copyright',
  bodyEnd: ''
}

module.exports = {
  engines: {
    html: handlebars
  },
  relativeTo: __dirname,
  path: Path.join(__dirname, ''),
  layoutPath: Path.join(__dirname, 'govuk_template_mustache'),
  layout: 'govuk_template',
  partialsPath: Path.join(__dirname, 'partials/'),
  helpersPath: Path.join(__dirname, 'helpers'),
  context: defaultContext
}
