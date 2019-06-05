'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')

const childProcess = require('child_process')
const fs = require('fs')

const CommitHashService = require('../../src/services/commitHash.service')

let processEnvStub
let readFileSyncStub
let execSyncStub

lab.beforeEach(() => {
  // Object.assign() is used to copy the values of all enumerable own properties
  // from one or more source objects to a target object. It returns the target
  // object.
  // Properties in the target object will be overwritten by properties in the
  // sources if they have the same key.
  // Specifically in this case, if we don't clone process.env in this way
  // GIT_SHA does not get reset after each test.
  process.env.GIT_SHA = undefined
  processEnvStub = Object.assign({}, process.env)
  readFileSyncStub = fs.readFileSync
  execSyncStub = fs.readFileSync
})

lab.afterEach(() => {
  process.env = processEnvStub
  fs.readFileSync = readFileSyncStub
  childProcess.execSync = execSyncStub
})

lab.experiment('Commit hash service tests:', () => {
  lab.test('commitHash() returns the value of GIT_SHA env var when set', () => {
    process.env.GIT_SHA = 'foobar-foobar-foobar'
    Code.expect(CommitHashService.commitHash()).to.equal('foobar-foobar-foobar')
  })

  lab.test('commitHash() returns contents of REVISION file when env var not set', () => {
    fs.readFileSync = (file, encoding) => {
      return 'fromfile-fromfile-fromfile'
    }
    Code.expect(CommitHashService.commitHash()).to.equal('fromfile-fromfile-fromfile')
  })

  lab.test('commitHash() returns the result of quering git directly when both the GIT_SHA env var and file are not set', () => {
    childProcess.execSync = (command) => {
      return 'fromgit-fromgit-fromgit'
    }
    Code.expect(CommitHashService.commitHash()).to.equal('fromgit-fromgit-fromgit')
  })

  lab.test('commitHash() sets the env var GIT_SHA after having read the reference from the REVISION file', () => {
    fs.readFileSync = (file, encoding) => {
      return 'setfileenv-setfileenv-setfileenv'
    }
    Code.expect(CommitHashService.commitHash()).to.equal('setfileenv-setfileenv-setfileenv')
    Code.expect(process.env.GIT_SHA).to.equal('setfileenv-setfileenv-setfileenv')
  })

  lab.test('commitHash() sets the env var GIT_SHA after having queried git for the reference', () => {
    childProcess.execSync = (command) => {
      return 'setgitenv-setgitenv-setgitenv'
    }
    Code.expect(CommitHashService.commitHash()).to.equal('setgitenv-setgitenv-setgitenv')
    Code.expect(process.env.GIT_SHA).to.equal('setgitenv-setgitenv-setgitenv')
  })
})
