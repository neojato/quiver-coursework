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
Firebase queries are modifications of a ref. So you'll create a ref as usual, but then you'll add some query parameters to it. Once you add query parameters to a ref, you can't take them off or change them... you'd need to create a new ref for that. This is important, because some query parameters are incompatible with one another, and a ref won't let you add incompatible query parameters. So don't shy away from creating and recreating refs over and over again to change queries.

***Pro Tip***
Query orders are ***NOT*** respected by the ```ref.on('value', callback)``` event. ```value``` events return objects as JSON, and JSON does not have ordered children. I know... obnoxious. But that's JSON for you. If you care to receive your data from Firebase in the specified order, make sure to use ```ref.on('child_added', callback)```, because it will be called once for each existing child, and it will be called in order. So aggregated your children into an array manually, and you'll have ordered children!

### Specify how you want to order your query
An orderBy* parameter is required for any query. You can't apply a query range, i.e., ```startAt(...)```, or a query limit, i.e., ```limitToLast(...)```, without first specifying how you want to order your query.

You have four options for ordering queries:
- orderByKey
- orderByChild
- orderByPriority
- orderByValue

```ref.orderByKey()``` is the most common ordering method. It orders the ref's children by their keys, usually push keys—which order by time.

```ref.orderByChild('someChildName')``` is the second most common ordering method. You'll need to add an ```".indexOn": ["someChildName"]``` security rule for the child node for performance reasonse if you want to order by a child attribute. 

```ref.orderByPriority()``` and ```ref.orderByValue()``` are less common. Priorities aren't quite deprecated yet, but they should be, because ```ref.orderByChild``` makes priority ordering unnecessary. Ordering by value is only relevant if your children are just values and not objects. So if your data structure were something like...

```
"animals": {
  "lkjdfa": "chinchilla",
  "asdfkl": "aardvark",
  "iouqer": "gorilla" 
}
``` 

The most common use cases would be as follows:

```
// Order users by key, which also orders them by creation timestamp
usersRef.orderByKey().on('child_added', callback);

// Order users by email. Make sure to include the security rule ... users: {".indexOn": ["email"]} ...
usersRef.orderByChild('email').equalTo('user-i-need-to-find@gmail.com').once('value').then(...)
```

### Specify query ranges
Query ranges are optional and specify start and end points for your query. You've got three options:
- startAt
- endAt
- equalTo

```ref.startAt('someKey')``` and ```ref.endAt('someKey')``` are self explanatory. ```ref.equalTo('someKey')``` is a startAt and and endAt query combined. You're not allowed to use more than one of these query range statements on a single ref, so Firebase provides the ```equalTo``` range to let you specify both.

Let's assume that we have an object with zero-indexed keys, much like a Javascript array. Note, zero-indexed keys are a Firebase anti-pattern, but they make this demonstration much easier.

```
"fruit": {
 "0": "apple",
 "1": "banana",
 "2": "pear",
 "3": "orange",
 "4": "tomato",
 "5": "mango",
 "6": "pineapple",
 "7": "strawberry",
 "8": "grapefruit",
 "9": "cranberry",
 "10": "lettuce"
}
``` 

Let's assume a ```fruitRef``` that points to the "fruit" node. "If we call ```fruitRef.orderByKey().endAt("5")```, we'll receive keys 0...5. If we call ```fruitRef.orderByKey().startAt("5")```, we'll receive keys 5...10. It's pretty straightforward. If we run ```fruitRef.orderByKey().equalTo("5")```... well, you get the pattern... it returns key ```"5": "tomato"```. 

### Limit results
Query orders and ranges are useful on their own, but they hit their stride when combined with limit statements. You'll want to use limits for most of your queries to avoid pulling down any more data than necessary.

You've got two options for limits:
- limitToLast
- limitToFirst

Let's refer back to the fruit "array" we used earlier and run through a few scenarios.

- ```fruitRef.orderByKey().limitToLast(3)```: returns keys 8, 9, 10
- ```fruitRef.orderByKey().limitToFirst(3)```: returns keys 1, 2, 3
- ```fruitRef.orderByKey().startAt("5").limitToLast(3)```: returns keys 8, 9, 10 ***note*** kind of useless
- ```fruitRef.orderByKey().startAt("5").limitToFirst(3)```: returns keys 5, 6, 7
- ```fruitRef.orderByKey().endAt("5").limitToLast(3)```: returns keys 3, 4, 5
- ```fruitRef.orderByKey().endAt("5").limitToFirst(3)```: returns keys 1, 2, 3 ***note*** kind of useless

We're ordering by key here, but ordering by child, value or priority works exactly the same. It runs an alphanumeric sort on the child, priority or value.

Notice that using a ```startAt``` with a ```limitToLast``` or an ```endAt``` with a ```limitToFirst``` is kind of pointless unless you're looking to somehow "bookend" the result set.

### Pagination Exercise
Firebase does not have built in pagination. Firebase collections are meant to be consumed as streams of data, so imagine running a query like ```fruitRef.orderByKey().limitToLast(3).on('child_added', callback)```. Your callback will get called three times, once for each of the last three results. But imagine a scenario where users are adding more fruit in realtime... so pretty soon your callback will fire again for ```"11": "artichoke"``` or whatever else your users are adding. If you're listening to the ```child_removed``` event on the same query, you'll get a callback there as well because ```"8": "grapefruit"``` has just fallen off of the query.

The point is that you need to be thinking of streams and events instead of thinking of static pagination. Your apps are realtime. Firebase is realtime. We need to reason about pagination as moving up and down a flowing stream of data.

To test this out, let's run the following code to load a bunch of data from the Star Wars API (SWAPI). You'll need to run ```npm install axios firebase``` in a new folder to get the dependencies. You'll also need to change the ```firebase.initializeApp(payload)``` payload to match the location of your ```service-account.json``` file and the ```databaseURL``` of your Firebase.

```
//load-swapi-data.js
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
var i = 80;
while (i--) {
  promises.push(getSwapiPerson(i + 1) //  i will be 79...0, so add 1 to match the SWAPI api
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
```

Now check your Firebase Realtime Database viewer at ```/swapi/people``` to make sure that you have 80 Star Wars characters stored in the collection. They're currently indexed by their SWAPI person number. I would typically recommend using push keys with ```peopleRef.push(res.person);```, but SWAPI has person ID numbers already, so matching those won't hurt. Just don't try to create your own ID system... when in doubt, use push keys.

We're going to demonstrate two ways to paginate through this list, each with its own costs and benefits.

###
