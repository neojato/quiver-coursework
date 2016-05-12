var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var superstatic = require('superstatic');
var vulcanize = require('gulp-vulcanize');
var minifyInline = require('gulp-minify-inline');
var exec = require('gulp-exec');
var merge = require('merge-stream');
var Firebase = require('firebase');
var secret = process.env.IMAGE_VIEWER_FIREBASE_SECRET;
var env = require('./functions/env.json');

gulp.task('serve', function () {
  browserSync.init({
    server: {
      baseDir: ['app'],
      middleware: [superstatic()],
      // routes: {
      //   '/bower_components': 'bower_components'
      // }
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

// Reference: https://github.com/PolymerElements/polymer-starter-kit/blob/master/gulpfile.js
gulp.task('vulcanize', function() {
  
  var index = gulp.src([
    'app/index.html'
  ])
    .pipe(gulp.dest('dist'));
  
  var webcomponentsjs = gulp.src([
    'app/bower_components/webcomponentsjs/webcomponents-lite.min.js'
  ])
    .pipe(gulp.dest('dist/bower_components/webcomponentsjs'));
  
  var lodash = gulp.src([
    'app/bower_components/lodash/dist/lodash.min.js'
  ])
    .pipe(gulp.dest('dist/bower_components/lodash/dist'));
  
  var elements = gulp.src('app/elements/elements.html')
    .pipe(vulcanize({
      stripComments: true,
      inlineScripts: true,
      inlineCss: true
    }))
    .pipe(minifyInline())
    .pipe(gulp.dest('dist/elements'));
  
  return merge(index, webcomponentsjs, lodash, elements);
});

gulp.task('build', ['env', 'vulcanize']);

gulp.task('deploy', function(done) {
  console.log('running firebase deploy');
  exec('firebase deploy', function(err, stdout, stderr) {
    console.log(err, stdout, stderr);
    done(err);
  });
});

