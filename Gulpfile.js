const gulp = require('gulp')
const sass = require('gulp-sass')
const sourcemaps = require('gulp-sourcemaps')
const standard = require('gulp-standard')
const lab = require('gulp-lab')
const runSequence = require('run-sequence')
const del = require('del')
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

// Test task
gulp.task('test', ['standard'], () => {
  return gulp.src('test')
    .pipe(lab('--coverage --reporter console --output stdout --reporter html --output coverage.html --verbose'))
})

// Build task
gulp.task('build', ['clean'], (done) => {
  runSequence(
    'copy-govuk-files',
    'install-govuk-files',
    'sass',
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
  gulp.watch(paths.assets + 'sass/**/*.scss', ['sass'])
  gulp.watch(paths.public + '**/*.*').on('change', reload)
  gulp.watch(paths.src + '**/*.*').on('change', reload)
})

gulp.task('default', ['watch', 'sass', 'browser-sync'])
