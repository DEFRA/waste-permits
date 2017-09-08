'use strict'

const gulp = require('gulp')
const htmlhint = require('gulp-htmlhint')
const sass = require('gulp-sass')
const sourcemaps = require('gulp-sourcemaps')
const contains = require('gulp-contains')
const standard = require('gulp-standard')
const lab = require('gulp-lab')
const runSequence = require('run-sequence')
const del = require('del')
const fs = require('fs')
const git = require('git-rev')
const nodemon = require('gulp-nodemon')
const browserSync = require('browser-sync')
const reload = browserSync.reload

const paths = {
  assets: 'src/assets/',
  govukModules: 'govuk_modules/',
  nodeModules: 'node_modules/',
  public: 'public/',
  src: 'src/',
  views: 'src/views/'
}

gulp.task('clean', () => {
  return del([paths.public, paths.govukModules])
})

// Copy govuk files

gulp.task('copy-govuk-toolkit', () => {
  return gulp.src([paths.nodeModules + 'govuk_frontend_toolkit/**/*.*'])
    .pipe(gulp.dest(paths.govukModules + 'govuk_frontend_toolkit/'))
})

gulp.task('copy-govuk-template', () => {
  return gulp.src([paths.nodeModules + 'govuk_template_mustache/**/*.*'])
    .pipe(gulp.dest(paths.govukModules + 'govuk_template_mustache/'))
})

gulp.task('copy-govuk-elements-sass', () => {
  return gulp.src([paths.nodeModules + 'govuk-elements-sass/public/sass/**'])
    .pipe(gulp.dest(paths.govukModules + '/govuk-elements-sass/'))
})

gulp.task('copy-govuk-files', [], (done) => {
  runSequence(
    'copy-govuk-toolkit',
    'copy-govuk-template',
    'copy-govuk-elements-sass',
    done)
})

// Install the govuk files into our application

gulp.task('copy-template-assets', () => {
  gulp.src(paths.govukModules + '/govuk_template_mustache/assets/{images/**/*.*,javascripts/**/*.*,stylesheets/**/*.*}')
    .pipe(gulp.dest(paths.public))
})

gulp.task('copy-template-view', () => {
  gulp.src(paths.nodeModules + 'govuk_template_mustache/views/layouts/govuk_template.html')
    .pipe(gulp.dest(paths.views + 'govuk_template_mustache/'))
})

gulp.task('install-govuk-files', [], (done) => {
  runSequence(
    'copy-template-assets',
    'copy-template-view',
    done)
})

// Query Git for the latest commit reference and store it locally in latestCommit.json
gulp.task('git-commit-reference', [], (done) => {
  git.long((commitReference) => {
    process.env['GIT_SHA'] = commitReference
    // fs.writeFile('latestCommit.json', commitReference, (err) => {
    //   if (err) {
    //     throw err
    //   }
    // })
  })
})

// Copy the javascript
gulp.task('scripts', () => {
  return gulp.src(paths.assets + 'javascripts/*.js')
    .pipe(gulp.dest(paths.public + 'javascripts/'))
    .pipe(reload({
      stream: true
    }))
})

// Build the sass
gulp.task('sass', () => {
  return gulp.src(paths.assets + 'sass/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'expanded',
      includePaths: [
        paths.govukModules + 'govuk_frontend_toolkit/stylesheets',
        paths.govukModules + 'govuk_template_mustache/assets/stylesheets',
        paths.govukModules + 'govuk-elements-sass/'
      ]
    }).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.public + 'stylesheets/'))
    .pipe(reload({
      stream: true
    }))
})

// Run StardardJS checks
gulp.task('standard', () => {
  return gulp.src([paths.src + '**/*.js'])
    .pipe(standard())
    .pipe(standard.reporter('default', {
      breakOnError: true,
      quiet: true
    }))
})

// Check the code to make sure we are not using Handlebars triple braces {{{ anywhere
gulp.task('check-handlebars', function () {
  gulp.src(['./src/**/*.html', '!./src/**/govuk_template.html'])
    .pipe(contains({
      search: '{{{',
      onFound: function (string, file, cb) {
        console.error('Validation check failed: Suspected non-escapted Handlebars code found in the following file:')
        console.error(file.path)
        process.exit(1)
      }
    }))
})

// Run HTML Hint checks
gulp.task('html-hint', () => {
  return gulp.src('./src/views/{partials/{common/,},}*.html')
    .pipe(htmlhint('.htmlhintrc'))
    .pipe(htmlhint.failReporter())
})

// Test task
gulp.task('test', ['check-handlebars', 'standard', 'html-hint'], () => {
  return gulp.src('test')
    .pipe(lab('--coverage --reporter console --output stdout --reporter html --output coverage.html --verbose'))
})

// Test task
gulp.task('test-ci', () => {
  return gulp.src('test')
    .pipe(lab({
      args: '--coverage --reporter console --output stdout --reporter lcov --output lcov.info --verbose --bail',
      opts: {
        emitLabError: true
      }}))
})

// Build task
gulp.task('build', ['clean'], (done) => {
  runSequence(
    'copy-govuk-files',
    'install-govuk-files',
    'sass',
    'scripts',
    done)
})

gulp.task('browser-sync', ['nodemon'], () => {
  browserSync.init({
    proxy: 'http://localhost:8000',
    browser: 'google chrome',
    port: 3000,
    reloadDelay: 1000
  })
})

gulp.task('nodemon', (done) => {
  let started = false

  return nodemon({
    script: 'index.js',
    ext: 'js html'
  }).once('start', () => {
    // To avoid nodemon being started multiple times
    if (!started) {
      started = true
      done()
    }
  })
})

gulp.task('watch', () => {
  gulp.watch(paths.assets + 'javascripts/**/*.js', ['scripts'])
  gulp.watch(paths.assets + 'sass/**/*.scss', ['sass'])
  gulp.watch(paths.public + '**/*.*').on('change', reload)
  gulp.watch(paths.src + '**/*.*').on('change', reload)
})

// The default Gulp task starts the app in development mode
gulp.task('default', ['git-commit-reference', 'watch', 'sass', 'scripts', 'browser-sync'])
