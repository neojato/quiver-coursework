var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var superstatic = require('superstatic');
var vulcanize = require('gulp-vulcanize');
var minifyInline = require('gulp-minify-inline');
var Firebase = require('firebase');
var secret = process.env.IMAGE_VIEWER_FIREBASE_SECRET;
var env = require('./env.json');

gulp.task('serve', function () {
  browserSync.init({
    server: {
      baseDir: ['app'],
      middleware: [superstatic()],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });
  gulp.watch(['app/**/*.html'], browserSync.reload);
});

gulp.task('env', function(done) {
  var environmentRef = new Firebase(env.environmentLocation);
  environmentRef.authWithCustomToken(secret)
    .then(function() {
      return environmentRef.set(env).then(done);
    })
    .catch(function(err) {
      console.log('firebase error', err);
    });
});

gulp.task('vulcanize', function(done) {
  gulp.src([
    'app/index.html'
  ])
    .pipe(gulp.dest('dist'));
  
  gulp.src([
    'app/styles/**/*'
  ])
    .pipe(gulp.dest('dist/styles'));
  
  gulp.src([
    'bower_components/webcomponentsjs/webcomponents-lite.min.js'
  ])
    .pipe(gulp.dest('dist/bower_components/webcomponentsjs'));
  
  gulp.src([
    'bower_components/lodash/dist/lodash.min.js'
  ])
    .pipe(gulp.dest('dist/bower_components/lodash'));
  
  gulp.src('app/elements/elements.html')
    .pipe(vulcanize({
      abspath: '',
      excludes: [],
      redirects: [
        __dirname + '/app/bower_components|./bower_components',
        // '/elements|./app/elements',
        // '/styles|./app/styles',
      ],
      stripComments: true,
      stripExcludes: false,
      inlineScripts: true,
      inlineCss: true
    }))
    // .pipe(minifyInline({
    //   js: false
    // }))
    .pipe(gulp.dest('dist/elements'));
});

