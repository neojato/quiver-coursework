# Walkthrough

## Configure Bower, NPM and directory structure
- Run ```bower init``` and ```npm init```. Choose whatever values you like... they just need to be initialized.
- Create an ```/app``` and a ```/dist``` folder. 
- Create an ```/app/elements``` folder.
- Create ```/app/index.html``` and drop in some initial html tags, i.e., ```<html>```, ```<head>``` and ```<body>```.
- Create ```/app/elements.html``` to use as a common place to import your Polymer components.

Your file tree should look like this:

```
├── app
│   ├── elements
│   ├── elements.html
│   └── index.html
├── bower.json
├── dist
└── package.json
```

## Set up local server
- Run ```npm install --save-dev gulp browser-sync superstatic```
- Create a file named ```/gulpfile.js``` and follow the instructions on [Firebase Hosting Improvements](https://www.firebase.com/blog/2015-12-16-hosting-improvements.html) to listen to file changes and reload the server. It could look something like this, but feel free to play with the configuration if you're familiar with the tooling.

### A note on tooling
Gulp is a popular node.js task runner. In this example we're using it to run browser-sync, which is an automatic browser-reloading server. We're adding superstatic as browser-sync middleware to pass all requests through superstatic, which will imitate Firebase hosting and use the configurations in ```/firebase.json```. 

```
var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var superstatic = require('superstatic');
var historyApiFallback = require('connect-history-api-fallback');

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

```
- Run ```gulp serve```—or whatever task name you used—to preview your ```/app/index.html``` file. This should automtically open up a browser window displaying ```/app/index.html``` with the browser-sync plugin injected on the page.