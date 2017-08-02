const handlebars = require('handlebars')
const Path = require('path')
const fs = require('fs')

const loadCommonPartial = (partialName) => {
  return String(fs.readFileSync((Path.join(__dirname, 'partials', 'common', partialName + '.html'))))
}

const defaultContext = {
  assetPath: '/public/',
  topOfPage: '',
  head: loadCommonPartial('head'),
  pageTitle: 'Generic Page',
  htmlLang: 'en',
  bodyClasses: '',
  bodyStart: '',
  skipLinkMessage: '',
  cookieMessage: '',
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
  context: defaultContext
}
