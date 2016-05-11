var gcs = require('gcloud').storage({
  projectId: 'quiver-one',
  keyFilename: './quiver-one-9992bd5ae4ee.json'
});
var bucket = gcs.bucket('quiver-one-assets');
var _ = require('lodash');
var axios = require('axios');
var Firebase = require('firebase');
var secret = process.env.IMAGE_VIEWER_FIREBASE_SECRET;
var rawEnv = require('./env.json').private;
var env = _.merge(rawEnv.default, rawEnv[process.env.NODE_ENV]);
var ref = new Firebase(env.firebase.databaseURL + env.firebase.nesting);

var existingKeys = [];
ref.authWithCustomToken(secret)
  .then(function () {
    var imagesRef = ref.child('images');
    var monthInSeconds = 60 * 60 * 24 * 30;
    
    return axios.get(imagesRef.toString() + '.json?shallow=true')
      .then(function (res) {
        if (res.data) {
          existingKeys = Object.keys(res.data);
        }
        return Promise.resolve();
      })
      .then(function () {
        return new Promise(function (resolve, reject) {
          bucket.getFiles(function (err, files) {
            return err ? reject(err) : resolve(files);
          });
        });
      })
      // .then(function (files) {
      //   var promises = [];
      //   _.forEach(files, function (file) {
      //     promises.push(new Promise(function (resolve, reject) {
      //       file.setMetadata({
      //         cacheControl: "max-age=" + monthInSeconds
      //       }, function (err, res) {
      //         return err ? reject(err) : resolve(res);
      //       });
      //     }));
      //   });
      //   return Promise.all(promises)
      //     .then(function () {
      //       console.log('metaData promises', arguments);
      //       return Promise.resolve(files);
      //     });
      // })
      .then(function (files) {
        return Promise.resolve(_.map(files, 'metadata'));
      })
      .then(function (filesMetadata) {
        var promises = [];
        var NO_SLASHED_REGEX = /\//g;
        filesMetadata.forEach(function (metadata) {
          metadata.cleanMd5Hash = metadata.md5Hash.replace(NO_SLASHED_REGEX, ':');
          promises.push(imagesRef.child(metadata.cleanMd5Hash).update(metadata));
        });
        return Promise.all(promises)
          .then(function() {
            return Promise.resolve(filesMetadata);
          });
      });
  })
  .then(function (filesMetadata) {
    var validKeys = _.map(filesMetadata, 'cleanMd5Hash');
    var badKeys = _.difference(existingKeys, validKeys);
    var updates = {};
    badKeys.forEach(function(key) {
      updates['/' + key] = null
    });
    return ref.child('images').update(updates);
  })
  .then(function () {
    console.log('Finished! 😇');
    process.exit();
  }, function (err) {
    console.log('Error 😡', err);
    process.exit();
  });



