'use strict'

const childProcess = require('child_process')
const fs = require('fs')

// There are a number of ways the app can be started, and environments it runs
// in which makes getting the latest git commit sha not a straight forward task.
module.exports = class CommitHashService {
  // commitHash() will first look for an env var called `GIT_SHA` for the
  // reference. If that doesn't exist it will next look for a file called
  // `GIT_SHA`. Finally if that fails it will attempt to make a call to git
  // directly.
  //
  // Whatever the result, the end result is an env var called `GIT_SHA` will be
  // set with the reference, so subsequent calls just read from the env var.
  //
  // Scenarios:
  // When deployed to heroku we are able set during the build the `GIT_SHA` env
  // var using a custom build pack
  // https://github.com/dive-networks/heroku-buildpack-git-sha.
  //
  // When we run the app using either gulp or directly via `node server.js` we
  // rely on the logic to make a call to git, and then set an env var.
  //
  // When we deploy the app, our scripts will create a file containing the sha
  // called GIT_SHA. This is because the we won't have the env var GIT_SHA
  // available, nor will we even have the .git folder in order to query it using
  // the git cli.
  static commitHash () {
    // If the env var is set immediately return the value we read from it here
    let commitReference = process.env.GIT_SHA
    if (commitReference) {
      return commitReference
    }

    // If the env var was not set then we next prioritise reading from a file
    // called GIT_SHA. This is to fit in with our deployment process
    // (non-heroku) which will create this file and add the current commit hash
    // to it
    commitReference = this._queryFile()

    // If we still don't have the commit hash then we call git to get it. The
    // most likely scenario in this case is that someone has run the project
    // locally using `node server.js`
    if (!commitReference) {
      commitReference = this._queryGit()
    }

    // At this point we accept we don't have it and go with Unknown
    if (!commitReference) {
      commitReference = 'Unknown'
    }

    // Whatever the result by now, we set the env var to the value we have. This
    // means after the first call to commitHash() subsequent calls should return
    // immediately after reading GIT_SHAs
    process.env['GIT_SHA'] = commitReference

    return commitReference
  }

  static _queryFile () {
    let result
    try {
      // Read the latest Git commit reference from a file
      result = fs.readFileSync('GIT_SHA', 'utf8')
    } catch (err) {
      result = undefined
    }
    return result
  }

  static _queryGit () {
    let result
    try {
      // Call git and ask it what the latest commit reference is
      result = childProcess.execSync('git rev-parse HEAD').toString('utf8').trim()
    } catch (err) {
      result = undefined
    }
    return result
  }
}
