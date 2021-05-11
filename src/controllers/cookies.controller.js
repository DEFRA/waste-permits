'use strict'

const BaseController = require('./base.controller')

const sections = [
  {
    heading: 'Session cookie',
    intro: ['We store session cookies on your computer to help keep your information secure while you use the service.'],
    id: 'session-cookies',
    cookies: [
      {
        id: 'defra-session-cookie',
        name: 'DefraSession',
        purpose: `Used to store encrypted information that we need to help you complete your application. For example, to link securely to the data you have already entered.`,
        expires: 'After 3 hours of inactivity or when you close your browser' },
      {
        id: 'defra-csrf-token-cookie',
        name: 'DefraCsrfToken',
        purpose: 'A randomly generated reference number used to make the service more secure.',
        expires: 'After 3 hours of inactivity or when you close your browser'
      }
    ]
  },
  {
    heading: 'Introductory message cookie',
    intro: [`You may see a pop-up welcome message when you first visit this service. We will store a cookie so that your computer knows you have seen it and knows not to show it again.`],
    id: 'introductory-message-cookie',
    cookies: [
      {
        id: 'seen-message-cookie',
        name: 'seen_cookie_message',
        purpose: 'Saves a message to let us know that you have seen our cookie message',
        expires: '1 month'
      }
    ]
  }
]

module.exports = class CookiesController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    pageContext.sections = sections
    return this.showView({ h, pageContext })
  }
}
