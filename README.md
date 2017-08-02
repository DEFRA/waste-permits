
# Waste Permits

The Waste Permits project - a GOV.UK digital service written in Node.js using Hapi and Mustache

The following Gulp tasks are supported:

## Setting up the development environment
Install Node and the following global npm packages:
```sh
$ npm install -g gulp
$ npm install -g standard
```

## Building and running the project

Building the project:
```sh
$ gulp clean build
```

Run the project in Google Chrome using Browser Sync (automatically reloads the browser on SCSS and JS/HTML changes):
```sh
$ gulp
```

## Testing the project
Use the following Gulp task. This runs the StandardJS linting and the unit tests and produces a coverage.html report
```sh
$ gulp test
```

## Contributing to this project

Please read the [contribution guidelines](/CONTRIBUTING.md) before submitting a pull request.

## License

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

>Contains public sector information licensed under the Open Government license v3

### About the license

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
