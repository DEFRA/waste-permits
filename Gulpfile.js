'use strict'

const gulp = require('gulp')
const htmlhint = require('gulp-htmlhint')
const sass = require('gulp-sass')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const sourcemaps = require('gulp-sourcemaps')
const imagemin = require('gulp-imagemin')
const autoprefixer = require('gulp-autoprefixer')
const contains = require('gulp-contains')
const standard = require('gulp-standard')
const lab = require('gulp-lab')
const del = require('del')
const nodemon = require('gulp-nodemon')
const browserSync = require('browser-sync')
const browserSyncServer = browserSync.create()
const reload = browserSync.reload
require('dotenv').config()

const paths = {
  assets: 'src/assets/',
  govukModules: 'govuk_modules/',
  nodeModules: 'node_modules/',
  public: 'public/',
  src: 'src/',
  views: 'src/views/'
}

gulp.task('clean', async (done) => {
  await del([paths.public, paths.govukModules])
  done()
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

gulp.task('copy-govuk-files', gulp.series(
  'copy-govuk-toolkit',
  'copy-govuk-template',
  'copy-govuk-elements-sass'
))

// Install the govuk files into our application

gulp.task('copy-toolkit-assets', () => {
  return gulp.src(paths.govukModules + '/govuk_frontend_toolkit/{images/**/*.*,javascripts/**/*.*,stylesheets/**/*.*}')
    .pipe(gulp.dest(paths.public))
})

gulp.task('copy-template-assets', () => {
  return gulp.src(paths.govukModules + '/govuk_template_mustache/assets/{images/**/*.*,javascripts/**/*.*,stylesheets/**/*.*}')
    .pipe(gulp.dest(paths.public))
})

gulp.task('copy-template-view', () => {
  return gulp.src(paths.nodeModules + 'govuk_template_mustache/views/layouts/govuk_template.html')
    .pipe(gulp.dest(paths.views + 'govuk_template_mustache/'))
})

gulp.task('install-govuk-files', gulp.series(
  'copy-toolkit-assets',
  'copy-template-assets',
  'copy-template-view'
))

// Copy and unglify the javascript
gulp.task('copy-scripts', () => {
  return gulp
    .src([paths.govukModules + 'govuk_frontend_toolkit/javascripts/govuk/show-hide-content.js', paths.govukModules + 'govuk_frontend_toolkit/javascripts/govuk/details.polyfill.js'])
    .pipe(gulp.dest(paths.assets + 'javascripts/govuk'))
})

gulp.task('scripts', gulp.series('copy-scripts', (done) => {
  return gulp.src([paths.assets + 'javascripts/govuk/*.js', paths.assets + 'javascripts/application.js'])
    .pipe(concat('application.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.public + 'javascripts/'))
    .pipe(reload({
      stream: true
    }))
}))

// Copy and minify the images
gulp.task('images', () =>
  gulp.src(paths.assets + 'images/**/*.*')
    .pipe(imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [ { removeViewBox: false }, { removeUselessStrokeAndFill: false } ]
    }))
    .pipe(gulp.dest(paths.public + 'images/'))
)

// Build the sass
gulp.task('sass', () => {
  return gulp.src(paths.assets + 'sass/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compressed',
      includePaths: [
        paths.govukModules + 'govuk_frontend_toolkit/stylesheets',
        paths.govukModules + 'govuk_template_mustache/assets/stylesheets',
        paths.govukModules + 'govuk-elements-sass/'
      ]
    }).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer('last 2 versions'))
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
gulp.task('check-handlebars', async (done) => {
  await gulp.src(['./src/**/*.html', '!./src/**/govuk_template.html'])
    .pipe(contains({
      search: '{{{',
      onFound: function (string, file, cb) {
        console.warn('Validation check failed: Suspected non-escapted Handlebars code found in the following file:')
        console.warn(file.path)
        // process.exit(1)
      }
    }))
  done()
})

// Run HTML Hint checks
gulp.task('html-hint', () => {
  return gulp.src('./src/views/{partials/{common/,},}*.html')
    .pipe(htmlhint('.htmlhintrc'))
    .pipe(htmlhint.failReporter())
})

// Test task
gulp.task('test', gulp.series('check-handlebars', 'standard', 'html-hint', () => {
  const port = parseInt(process.env.PORT) + 2
  process.env.PORT = port
  console.log(`Running tests on port: ${port}`)
  return gulp.src('test')
    .pipe(lab('--coverage --reporter console --output stdout --reporter html --output coverage.html --verbose'))
}))

// Test task
gulp.task('test-ci', () => {
  return gulp.src('test')
    .pipe(lab({
      args: '--coverage --reporter console --output stdout --reporter lcov --output lcov.info --verbose --bail',
      opts: {
        emitLabError: true
      } }))
})

// Build task
gulp.task('build', gulp.series('clean', 'copy-govuk-files',
  'install-govuk-files',
  'sass',
  'scripts',
  'images'
))

gulp.task('nodemon', (done) => {
  let started = false

  return nodemon({
    script: 'server.js',
    ext: 'js html'
  }).once('start', () => {
    // To avoid nodemon being started multiple times
    if (!started) {
      started = true
      done()
    }
  })
})

gulp.task('browser-sync', gulp.series('nodemon', (done) => {
  browserSyncServer.init({
    proxy: 'http://localhost:' + process.env.PORT,
    browser: 'google chrome',
    port: 8000,
    reloadDelay: 1000
  })
  done()
}))

gulp.task('watch', () => {
  gulp.watch(paths.assets + 'javascripts/**/*.js', gulp.parallel(['scripts']))
  gulp.watch(paths.assets + 'images/**/*.*', gulp.parallel(['images']))
  gulp.watch(paths.assets + 'sass/**/*.scss', gulp.parallel(['sass']))
  gulp.watch(paths.public + '**/*.*')
    .on('change', gulp.parallel(() => {
      console.log('REEEEEEEELOAD!!!!!')
      browserSyncServer.reload()
    }))
  gulp.watch(paths.src + '**/*.*')
    .on('change', gulp.parallel(browserSyncServer.reload))
})

// The default Gulp task starts the app in development mode
gulp.task('default', gulp.series('sass', 'scripts', 'images', 'browser-sync', 'watch'))
