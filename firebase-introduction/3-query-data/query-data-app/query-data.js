var firebase = require('firebase');

firebase.initializeApp({
  "serviceAccount": "./service-account.json",
  "databaseURL": "https://quiver-two.firebaseio.com/"
});

var ref = firebase.app().database().ref();
var swapiPeople = ref.child('swapi/people');

swapiPeople.on('child_added', function (snap) {
  console.log(snap.getKey());
});

swapiPeople.once('value')
  .then(function (snap) {
    console.log('child', snap.child('1').val());
    console.log('numChildren', snap.numChildren());
    snap.forEach(function(childSnap) {
      console.log('child key', childSnap.getKey());
    });
  });
