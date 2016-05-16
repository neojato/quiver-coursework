var firebase = require('firebase');

firebase.initializeApp({
  "serviceAccount": "./service-account.json",
  "databaseURL": "https://quiver-two.firebaseio.com/"
});

var ref = firebase.app().database().ref();
var usersRef = ref.child('users');


// Create a new ref and log it's push key
var userRef = usersRef.push();
console.log('user key', userRef.getKey());

// Save some data to the new ref
var setPromise = userRef.set({
  name: 'Chris One',
  description: "I was created using ref.push() to create a new ref with it's own push key and then newRef.set() to set data to that new ref."
});

// Create a new ref and save data to it in one step
var pushPromise = usersRef.push({
  name: 'Chris Two',
  description: "I was created using ref.push() save data to a new push key in a single step."
});

Promise.all([setPromise, pushPromise])
  .then(function () {
    return usersRef.once('value');
  })
  .then(function (snap) {
    console.log('usersRef value', snap.val());
  })
  .catch(function (err) {
    console.log('error 😡', err);
  });

