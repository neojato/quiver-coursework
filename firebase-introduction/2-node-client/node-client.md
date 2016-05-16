## Edit data from the Console
Firebase has a built in console that you can use to edit your data.
1. Visit [https://console.firebase.google.com/project/](https://console.firebase.google.com/project/) and either create a new project or access a project that you've already created.
2. Navigate to your ***Database*** and add some arbitrary data by clicking on the green + buttons and building out nodes.

See the video below for a walkthrough. Make sure to install the [Vimeo repeat & speed](https://chrome.google.com/webstore/detail/vimeo-repeat-speed/noonakfaafcdaagngpjehilgegefdima/related?hl=en) Chrome extension to speed up this and future videos. It makes a huge difference!

![https://s3.amazonaws.com/assets.quiver.is/cms/admin/firebase-introduction/node-client/console-video-thumbnail.jpg](https://vimeo.com/album/3948258/video/166421069)

## Manage your Firebase from Node.js
The Firebase Node.js client requires a Google Cloud API key and the ```firebase``` Node library. Follow the steps below for success!

### Install the client and dependencies
- Visit your [Google Cloud API Console](https://console.cloud.google.com/apis/credentials) and select the project that matches up with the Firebase project that you just created. Notice the project selection dropdown at the top-right edge of the console.
- Open the Credentials tab and click "Create credentials". You want the "API key" option. Create a server key. It will automatcially download as a *.json file. This file contains all of the credentials that your server will need to authenticate with Google Cloud and access the Firebase APIs... so protect it! Do not add this file to source control. You can always create new server keys if you lose this one. It's meant to be revoked and recreated as often as needed.
- Create a new folder in your development directory called node-client-app and copy your .json credentials into this folder. Rename the .json file to service-account.json.
- Run ```npm init``` to initialize a package.json file. Click through the default package.json selections quickly.
- Install the node.js firebase client with the ```npm install --save-dev firebase```.
- Create a file titled ```node-client.js```. This is where we'll write our script to learn the Firebase Node client.

Expected file tree up to this point 👇🏻
```
├── node-client.js
├── node_modules
│   ├── ...
├── package.json
└── service-account.json
```  

- Fill out ```node-client.js``` with the code below and run it with ```node node-client.js```. It should read out whatever test data you've added manually with the Firebase Realtime Database console.
- Note that only the ```serviceAccount``` and ```databaseURL``` keys are required to initialize the app.

```
var firebase = require('firebase');
firebase.initializeApp({
  "appName": "Quiver Two Node Client Demo",
  "serviceAccount": "./service-account.json",
  "authDomain": "quiver-two.firebaseapp.com",
  "databaseURL": "https://quiver-two.firebaseio.com/",
  "storageBucket": "quiver-two.appspot.com"
});
var ref = firebase.app().database().ref();

ref.once('value')
  .then(function (snap) {
    console.log('snap.val()', snap.val());
  });
```

## Add data to your Firebase
There are three ```firebase``` functions that will add or modify your data, ```ref.push()```, ```ref.set()``` and ```ref.update()```.

### ref.push
There are two ways to use ```.push()```. You can use it to create a new ref with an automatically generated ***push key***, or you can save data to a new push key in a single step.

```
var usersRef = ref.child('users');

// Create a new ref and log it's push key
var userRef = usersRef.push();
console.log('user key', userRef.getKey());

// Create a new ref and save data to it in one step
var userRef = usersRef.push({
  name: 'Christopher',
  description: 'I eat too much ice cream'
});
```

Both of these methods create new refs with their own ***push keys***. Push keys are a critical concept in Firebase, because they enable us to save collections of data and sort them by creation date without key collisions. This would be impossible using zero-indexed arrays like you commonly find in Javascript.

Let's unpack that last paragraph. First, imagine a realtime game with millions of users pushing data to your app at the same time. If there are 500 records in a collection and two users try to simultaneously push data to that collection within the same millisecond, could Firebase handle that with a zero-indexed array? No! That would be a mess. You'd have two users trying to push to ```/somePath/501``` at the same time—a colliding keys disaster—and one would be overwritten by the other.

Instead of letting keys collide, Firebase lets us create unique keys with ```.push()```. These keys are fantastic in that they don't collide while ***also being sortable by time***. In case you missed that... huge concept here... the push keys are sortable by time. They're generated using a timestamp plus some randomness to avoid collisons. If you sort a collection by their push keys, you're effectively sorting by timestamp. You can test that with the following node.js script.

Note: Change the values for ```initializeApp``` to match a Firebase that you own. And I've created a gist for the code below: [http://gist.github.com/5340fd2b35eb000504bd6df3d63b87b9](http://gist.github.com/5340fd2b35eb000504bd6df3d63b87b9)
```
var firebase = require('firebase');

firebase.initializeApp({
  "serviceAccount": "./service-account.json",
  "databaseURL": "https://quiver-two.firebaseio.com/"
});

var ref = firebase.app().database().ref();
var usersRef = ref.child('users');

var delayedPush = function (user) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      usersRef.push(user)
        .then(resolve, reject);
    }, 1);
  });
};

delayedPush({
  name: 'First User',
  time: (new Date()).getTime()
})
.then(function() {
  return delayedPush({
    name: 'Second User',
    time: (new Date()).getTime()
  });
})
.then(function() {
  return delayedPush({
    name: 'Third User',
    time: (new Date()).getTime()
  });
})
.then(function() {
  usersRef.orderByKey().on('child_added', function(snap) {
    console.log(snap.getKey(), snap.val());
  });
})
.catch(function(err) {
  console.log('error', err);
});

// Logs look something like this...
// -KHu0H2o5NYwnfYEXpdH { name: 'First User', time: 1463409778909 }
// -KHu0HFKR8Tz27KyI5rz { name: 'Second User', time: 1463409779648 }
// -KHu0HGBF3Kg-Jbg5fAL { name: 'Third User', time: 1463409779703 }

```

### ref.set
```ref.set``` is the most straightforward way to save data. It overwrites the ref with whatever object you pass it. So ```usersRef.set({message: 'I just overwrote your users'});``` would replace your entire ```usersRef``` object with a single JSON object. You'll typically do something like this:

```
var timestamp = (new Date()).getTime();
userRef.child('timestamp').set(timestamp); 
```

### ref.update
```ref.update``` let's you overwrite just the keys that you specify. You could do something like ```userRef.update({timestamp: 123456789});``` and overwrite ***only the timestamp attribute*** of ```userRef```.

```ref.update``` also supports [***atomic writes***](https://www.firebase.com/blog/2015-09-24-atomic-writes-and-more.html) by path. You can do something like the following:

```
var timestamp = (new Date()).getTime();
usersRef.update({
  '/someUserKey/lastLogin': timestamp,
  '/adminLogs/logins/anotherUserKey/lastLogin': timestamp
})
.catch(function (err) {
  console.log('one of these updates failed', err);
});
```

Firebase calls these kinds of updates ***multi-location updates***. A use case might be a to update a user's username in three different locations at the same time, or maybe to process a financial transaction and log it simultaneously. 

Multi-location updates either succeed or fail as a batch operation. ```ref.update``` returns a promise, so any errors on the write operation can be handled with a single ```.catch```.
