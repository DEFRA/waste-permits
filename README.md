# Waste Permits Service

[![Build Status](https://travis-ci.org/DEFRA/waste-permits.svg?branch=master)](https://travis-ci.org/DEFRA/waste-permits)
[![NSP Status](https://nodesecurity.io/orgs/cruikshanks/projects/fb915ae3-9c10-485d-bfc8-38c5c53316cc/badge)](https://nodesecurity.io/orgs/cruikshanks/projects/fb915ae3-9c10-485d-bfc8-38c5c53316cc)
[![Known Vulnerabilities](https://snyk.io/test/github/defra/waste-permits/badge.svg)](https://snyk.io/test/github/defra/waste-permits)
[![dependencies Status](https://david-dm.org/defra/waste-permits/status.svg)](https://david-dm.org/defra/waste-permits)
[![Code Climate](https://codeclimate.com/github/DEFRA/waste-permits/badges/gpa.svg)](https://codeclimate.com/github/DEFRA/waste-permits)
[![Test Coverage](https://codeclimate.com/github/DEFRA/waste-permits/badges/coverage.svg)](https://codeclimate.com/github/DEFRA/waste-permits/coverage)
[![Dependency Status](https://dependencyci.com/github/DEFRA/waste-permits/badge)](https://dependencyci.com/github/DEFRA/waste-permits)
[![Greenkeeper badge](https://badges.greenkeeper.io/DEFRA/waste-permits.svg)](https://greenkeeper.io/)

You may need to apply to the
[Environment Agency](https://www.gov.uk/government/organisations/environment-agency)
for an environmental permit if your business uses, recycles,
treats, stores or disposes of waste or mining waste. This permit
can be for activities at one site or for mobile plant that can be
used at many sites.

The Waste Permits service will be a new, online way to apply for a
waste permit.

This service is currently beta and has been developed in accordance
with the
[Digital by Default service standard](https://www.gov.uk/service-manual/digital-by-default),
putting user needs first and delivered iteratively.

## Prerequisites

Please make sure the following are installed:

- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Node.js v10/Dubnuim](https://nodejs.org/en/) recommend
  installing nvm and using `nvm install --lts`
- [Gulp](https://gulpjs.com/) using `npm install -g gulp`
- [StandardJS](https://standardjs.com/) using `npm install -g standard`
- [Chrome](https://www.google.com/chrome/index.html) our default `gulp` task assumes **Chrome** is installed
- ClamAV Daemon. You will need to install clamdscan and clamav-daemon then run clamav-daemon as a service

## Installation

Clone the repository and install its package
dependencies:

```bash
git clone https://github.com/DEFRA/waste-permits.git && cd waste-permits
npm install
```

# Setting up .env

Copy the `.env.example` file to `.env` and set it up for your
environment

```bash
cp .env.example .env
```

## Building the app

Once you have the repo cloned you'll need to build it.

```bash
gulp clean build
```

## Running the app

Run the app in **Google Chrome** using
[Browsersync](https://browsersync.io/docs/gulp). This will first
launch/create a new tab in Chrome set to the app's start page. Any
changes to the project's SCSS, JS and HTML files will cause the
browser to automatically reload.

```bash
gulp
```

## Testing the app

Use the following **Gulp** task. This runs the **StandardJS**
linting as well as the unit tests to produce a `coverage.html`
report

```bash
gulp test
```

## Setting up ClamAV

Setting up ClamAV can be a little challenging. We've done it on
Debian and if you use the following instructions it should work.

```bash
sudo apt-get install clamdscan clamav-daemon
usermod -a -G clamav <currentuser>
sudo service clamav-daemon start
```

## Adding new routes

Use the following command line interface to add any new routes.
This will create placeholder controller, view and validator files
that can then be edited.
```bash
npm run add-route
```
## Contributing to this project

If you have an idea you'd like to contribute please log an issue.

All contributions should be submitted via a pull request.

## License

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN
GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products
and applications when using this information.

>Contains public sector information licensed under the Open
>Government license v3

### About the license

The Open Government Licence (OGL) was developed by the Controller
of Her Majesty's Stationery Office (HMSO) to enable information
providers in the public sector to license the use and re-use of
their information under a common open licence.

It is designed to encourage use and re-use of information freely
and flexibly, with only a few conditions.
