var firebase = require('firebase');

firebase.initializeApp({
  "serviceAccount": "./service-account.json",
  "databaseURL": "https://quiver-two.firebaseio.com/"
});

var ref = firebase.app().database().ref();

ref.once('value')
  .then(function (snap) {
    console.log(snap.val());
  })
  .catch(function (err) {
    console.log('error', err);
  });
