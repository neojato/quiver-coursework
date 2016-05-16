## Query Data from Node.js and the browser
The Firebase SDKs for Node.js and the browser are very, very similar. We'll be able to copy/paste Node.js code directly into an HTML script tag and it will function the same. The difference between the two SDKs is how they handle authentication. Node.js auth is simple with a Google Cloud service account API key. You can't put a Google Cloud service account in the browser without giving full read/write access to your Firebase to the world, so you'll need to authenticate using Google's generic browser API before accessing your Firebase from the client.

Once authenticated, both Javascript SDKs expose the same API for interacting with Firebase, so we'll cover the API first in Node.js for simplicity.

### Firebase events
Firebase delivers data to us with five different events accessed with ```ref.on```:

1. value
2. child_added
3. child_changed
4. child_removed
5. child_moved

These events are mostly self-explanatory, and they're [covered in the docs](https://developers.google.com/firebase/docs/database/web/retrieving-data#section-event-types), but let's get into the details.

### ref.on('value', callback);
The ```value``` event fires once for an initial data load and again whenever any data changes. ```value``` is the event that we'll use most, typically with ```ref.once('value', callback)```, because it returns a ref's children in a single operation. You can also use ```ref.on('value', callback)``` to keep an object in memory synced up with Firebase.

```
var user;

userRef.on('value', function (snap) {
  user = snap.val(); // Keep the local user object synced with the Firebase userRef 
});
```  

### ref.on('child_added', callback);
The ```child_added``` event fires once for every existing child and then continues to fire every time a node is added. It's a lot like ```value```, but you can't use it with ```ref.once```, because it's not meant to ever fire just once. ```child_added``` is often used as follows...

```
var users = [];

usersRef.on('child_added', function (snap) {
  users.push(snap.val()); // Push children to a local users array
});
```

### child_changed, child_removed, child_moved
These events are less commonly used. Review ```child_changed```, ```child_removed``` and ```child_moved``` in [the docs](https://developers.google.com/firebase/docs/database/web/retrieving-data#section-event-types). They do about what you'd think they do, but they're mostly useful for advanced querying, so we'll cover them later as needed.

### ref.off('some_event', callback)
Use ```ref.off``` to stop listening to a ref's events. Just make sure to pass in the exact same callback function... not a copy of the function.

### ref.once('value', callback)
The most common use of Firebase ref events is to listen to the ```value``` event for initial data load and then call ```.off``` on the listener as soon as the data has loaded. This is annoying to do over and over, so Firebase gives us ```ref.once('value', <callback>)``` to listen to the inital load and then turn off the listener automatically. ```ref.once``` takes an optional callback and returns a promise. You'll notice that ```ref.on``` requires a callback. DO NOT TRY ```ref.on('child_added').then...```. It doesn't make any sense to use ```ref.on``` with a promise, because it is meant to fire over and over again like a normal event listener that you might use in the browser. ```ref.once``` is a special case that returns a promise to make our lives easier. 

```
var users = []
var callback = function (snap) {
  users.push(snap.val())
  if (users.length > 10) {
    usersRef.off('child_added', callback);
  }
}

usersRef.on('child_added', callback);
```

## Data snapshots
Firebase ref events return data snapshots. So far we've just used ```snap.val()``` to get the snapshot's JSON, but there are more snapshot functions...

- snap.val() - Gets the value
- snap.exportVal() - Also gets the value (kind of duplicative)
- snap.child() - Navigate to a child ref
- snap.hasChild() - Test whether there is at least one child
- snap.getPriority() - Priorities are mostly deprecated... don't worry about this if you're new to Firebase
- snap.forEach(callback) - Loop through children with a callback
- snap.hasChildren() - Test whether there are multiple children
- snap.getKey() - Get the ref's key
- snap.numChildren() - How many children does the reference have?

You won't need most of these. ```snap.val()``` and snap.forEach(callback)``` are the most common use cases. ```snap.forEach``` is great when you want to loop through a bunch of children like this:

```
usersRef.once('value', function (snap) {
  snap.forEach(function (childSnap) {
    console.log('user', childSnap.val());
  });
});
```

## Firebase queries
Firebase queries are modifications of a ref. So you'll create a ref as usual, but then you'll add some queries parameters to it. Yo



## Querying Data
- on value, child_added, child_removed
- orderBy*
- limitTo*
- startAt, endAt
- pagination
