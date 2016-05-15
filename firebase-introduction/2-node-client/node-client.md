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

```
var firebase = require('firebase');
firebase.initializeApp({
  "appName": "Quiver Two Node Client Demo",
  "serviceAccount": "service-account.json",
  "authDomain": "quiver-two.firebaseapp.com",
  "databaseURL": "https://quiver-two.firebaseio.com/",
  "storageBucket": "quiver-two.appspot.com"
});
var ref = firebase.app().database().ref();

ref.once('value')
  .then(function(snap) {
    console.log('snap.val()', snap.val());
  });
```