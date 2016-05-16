var axios = require('axios');
var getSwapiPerson = function (i) {
  return axios.get('http://swapi.co/api/people/' + i + '?format=json')
    .then(function (res) {
      return Promise.resolve({
        id: i,
        person: res.data
      });
    });
};

var firebase = require('firebase');
firebase.initializeApp({
  "serviceAccount": "./service-account.json",
  "databaseURL": "https://quiver-two.firebaseio.com/"
});

var ref = firebase.app().database().ref();
var peopleRef = ref.child('/swapi/people');
var promises = [];
var i = 10;
while (i--) {
  promises.push(getSwapiPerson(i + 1) //  i will be 9...0, so add 1 to match the SWAPI api
    .then(function(res) {
      return peopleRef.child(res.id).set(res.person);
    }));
}

Promise.all(promises)
  .then(function() {
    console.log('Swapi data loaded');
    process.exit();
  })
  .catch(function(err) {
    console.log('Swapi data load error', err);
    process.exit();
  })