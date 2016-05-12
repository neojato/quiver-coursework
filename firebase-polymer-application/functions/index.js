var functions = require('firebase-functions');

exports.userLogin = functions.database().path('/imageViewer/development/users/{userId}').on('write', function(e) {
  var userRef = e.data.ref();
  console.log('Reading firebase object at path: ' + userRef.toString());
  return userRef.update({
    '/login': (new Date()).toString()
  });
});