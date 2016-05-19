var firebase = require('firebase');
var axios = require('axios');

firebase.initializeApp({
  "serviceAccount": "../../../service-account.json",
  "databaseURL": "https://quiver-two.firebaseio.com/"
});

var ref = firebase.app().database().ref();
var peopleRef = ref.child('swapi/people');
var peopleUrl = peopleRef.toString() + '.json?shallow=true';
var pageLength = 2;

console.log('here');
peopleRef.orderByKey().startAt("5").limitToLast(10).on('child_added', function (snap) {
  console.log(snap.getKey());
});

// var getPages = function (accumulator, cursor) {
//   var pages = accumulator || [];
//   var query = peopleRef.orderByKey().limitToFirst(pageLength + 1);
//   if (cursor) {
//     query = query.startAt(cursor); // If no cursor, start at beginning of collection
//   }

//   return query.once('value')
//     .then(function (snaps) {
//       var page = [];
//       var extraRecord;
//       snaps.forEach(function (childSnap) {
//         page.push({
//           id: childSnap.getKey(),
//           name: childSnap.val().name
//         });
//       });
//       console.log('page.length', page.length, pageLength);
//       if (page.length > pageLength) {
//         extraRecord = page.pop();
//         pages.push(page);
//         console.log(pages, extraRecord.id);
//         return getPages(pages, extraRecord.id);
//       } else {
//         pages.push(page);
//         return Promise.resolve(pages);
//       }
//     });
// };
// getPages()
//   .then(function (pages) {
//     console.log('pages', JSON.stringify(pages));
//   });

// axios.get(peopleUrl)
//   .then(function (res) {
//     var keys = Object.keys(res.data).sort(function (a) {
//       return parseInt(a);
//     }).reverse(); // must manually sort keys to guarantee order!!!
//     var keysLength = keys.length;
//     var promises = [];

//     for (var i = pageLength; i <= keysLength; i += pageLength) {
//       var key = keys[i - 1]; // i =  2, 4, 6, 8, 10... so subtract 1 to get array key
//       var query = peopleRef.orderByKey().endAt(key).limitToLast(pageLength);
//       promises.push(query.once('value'));
//     }

//     Promise.all(promises)
//       .then(function (snaps) {
//         var pages = [];
//         snaps.forEach(function (snap) {
//           var page = [];
//           snap.forEach(function (childSnap) {
//             page.push({
//               id: childSnap.getKey(),
//               name: childSnap.val().name
//             });
//           });
//           pages.push(page);
//         });
//         pages.forEach(function (page, key) {
//           console.log('page %s: %s', key, JSON.stringify(page));
//         });
//         process.exit();
//       })
//       .catch(function (err) {
//         console.log('error', err);
//       });
//   });