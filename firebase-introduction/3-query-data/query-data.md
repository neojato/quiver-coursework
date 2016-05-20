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
An orderBy* parameter is required for any query. You can't apply a query range, i.e., ```startAt(...)```, or a query limit, i.e., ```limitToLast(...)```, without first specifying how you want to order your query. So apply orderBy* ***first***!

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

```ref.startAt('someKey')``` is used with a ```limitToFirst``` statement to read from the top of a list (ascending order) and to start somewhere in the middle of the list. Omitting the ```startAt``` while using a ```limitToFirst``` would cause the query to read from the very top of the list.

```ref.endAt('someKey')``` is used with a ```limitToLast``` statement to read from the bottom of a list (descending order) and to start somewhere in the middle of the list. Omitting the ```endAt``` while using a ```limitToLast``` would cause the query to read from the very bottom of the list.
 
```ref.equalTo('someKey')``` is a ```startAt``` and an ```endAt``` query combined. You're not allowed to use more than one of these query range statements on a single ref, so Firebase provides the ```equalTo``` range to let you specify both.

Note that using ```startAt``` with ```limitToLast``` or ```endAt``` with ```limitToFirst``` produces unexpected behavior. You'll see why in a few paragraphs... it's harder to explain with words than with an example.

So let's assume that we have an object with zero-indexed keys, much like a Javascript array. Numeric keys are a Firebase anti-pattern. Notice that we don't have a key "10", because keys are always alpha-sorted and "10" would sort like this: "0", "1", "10", "2", "3"...

Again, numeric keys are a Firebase anti-pattern. We should be using push keys... but push keys make for horrible demos, because humans don't sort long alphanumeric keys in our heads. 

```
"fruit": {
 "1": "banana",
 "2": "pear",
 "3": "orange",
 "4": "tomato",
 "5": "mango",
 "6": "pineapple",
 "7": "strawberry",
 "8": "grapefruit",
 "9": "cranberry"
 "10": "tangerine"
}
``` 

Let's assume a ```fruitRef``` that points to the "fruit" node. "If we call ```fruitRef.orderByKey().endAt("5")```, we'll receive keys 1...5. If we call ```fruitRef.orderByKey().startAt("5")```, we'll receive keys 5...10. It's pretty straightforward. If we run ```fruitRef.orderByKey().equalTo("5")```... well, you get the pattern... it returns key ```"5": "tomato"```. 

### Limit results
Query orders and ranges are useful on their own, but they hit their stride when combined with limit statements. You'll want to use limits for most of your queries to avoid pulling down any more data than necessary.

You've got two options for limits:
- limitToLast
- limitToFirst

Let's refer back to the fruit "array" we used earlier and run through a few scenarios.

1. ```fruitRef.orderByKey().limitToLast(3)```: returns keys 8, 9, 10
2. ```fruitRef.orderByKey().limitToFirst(3)```: returns keys 1, 2, 3
3. ```fruitRef.orderByKey().limitToLast(3).startAt("5")```: returns keys 5, 6, 7 ***parameter order matters***
4. ```fruitRef.orderByKey().startAt("5").limitToLast(3)```: returns keys 8, 9, 10 ***parameter order matters***
5. ```fruitRef.orderByKey().startAt("5").limitToLast(10)```: returns keys 5, 6, 7, 8, 9, 10 ***bookend***
6. ```fruitRef.orderByKey().limitToFirst(3).startAt("5")```: returns keys 5, 6, 7
7. ```fruitRef.orderByKey().startAt("5").limitToFirst(3)```: returns keys 5, 6, 7
8. ```fruitRef.orderByKey().limitToLast(3).endAt("5")```: returns keys 3, 4, 5
9. ```fruitRef.orderByKey().endAt("5").limitToLast(3)```: returns keys 3, 4, 5
10. ```fruitRef.orderByKey().limitToFirst(3).endAt("5")```: returns keys 3, 4, 5 ***parameter order matters***
11. ```fruitRef.orderByKey().endAt("5").limitToFirst(3)```: returns keys 1, 2, 3 ***parameter order matters***
12. ```fruitRef.orderByKey().endAt("5").limitToFirst(10)```: returns keys 1, 2, 3, 4, 5 ***bookend***

Read through these scenarios a couple of times and let's reflect on how insane this is. 

Scenarios 1 and 2 are expected. Firebase is reading from the bottom or the top of the list, and limiting the results.

Scenarios 3, 4, and 5 are crazy town! 
- Scenario 3 calls ```limitToLast``` _first_ and the ```startAt``` statement _second_, so it starts at "5" and reads 3 records toward the bottom
- Scenario 4 calls ```startAt``` _first_ and ```limitToLast``` _second_, so it reads from the bottom and stops after 3 records
- Scenario 5 is the same as scenario 4, but because the limit is 10 instead of 3, you'll see that the it reads from the bottom of the list and ***ends at!*** record "5". Get that!?! We used the parameter ```startAt("5")``` to create a query that _ends at_ "5"!
- ***Take Away***: Don't mix ```startAt``` and ```limitToLast``` unless you're willing to pay close attention to the order in which you call the parameters. Calling ```limitToLast``` before ```startAt``` is identical to using ```limitToFirst``` and ```startAt```, whereas using ```startAt``` _and then_ ```limitToLast``` reads from the bottom to the top and _ends at_ the ```startAt``` value! 😖

Scenarios 6, 7, 8, and 9 operate as expected... parameter order does not matter

Scenarios 10, 11, and 12 are the inverse of 3, 4, and 5. The order in which you call the parameters matters.

If you're having trouble conceptualizing this, here's a quick way to simplify the situation: Always call the query range (```startAt``` or ```endAt```) first. Call the ```limitTo*``` second.

***A note on orderBy* methods***
We're ordering by key in this example, but ordering by child, value or priority works the same. Firebase will first try to sort the keys/children/priorities/values numerically, and then it will sort them as strings... so if you have a mix of numbers and strings, the numbers will sort to the top and the strings to the bottom.

You'll typically avoid this confusion by remembering that mixing numbers and strings on a sort is ridiculous.

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
```

Now check your Firebase Realtime Database viewer at ```/swapi/people``` to make sure that you have 10 Star Wars characters stored in the collection. They're currently indexed by their SWAPI person number. I would typically recommend using push keys with ```peopleRef.push(res.person);```, but SWAPI has person ID numbers already, so matching those won't hurt. Just don't try to create your own ID system... when in doubt, use push keys.

We're going to demonstrate two ways to paginate through this list, each with its own costs and benefits.

### Cursor pagination
Cursor pagination scales forever, but you have to step forwards or backwards through the pages one at a time. You don't know how many total pages you have, and you can't skip pages.

In this example we have 10 records indexed 1...10 and a page length of 2 records per page. You simply request 3 records, pop the third record off to use as a cursor, and add the first 2 records to the page.

The following example recursively gets all of the pages and spits out an array of pages. Try running this code on your own machine to see it in action. Make sure to edit the path to your ```service-account.json``` if it's different, and definitly change your ```databaseURL``` to match your Firebase. Also make sure that you've run ```load-swapi-data.js``` to populate your ```swapi/people``` node.  

***Cursor Pagination***
```
var firebase = require('firebase');
var axios = require('axios');

firebase.initializeApp({
  "serviceAccount": "./service-account.json",
  "databaseURL": "https://quiver-two.firebaseio.com/"
});

var ref = firebase.app().database().ref();
var peopleRef = ref.child('swapi/people');
// Calling ref.toString() outputs the ref's entire path: https://...firebaseio.com/some/ref/path
var peopleUrl = peopleRef.toString() + '.json?shallow=true'; 
var pageLength = 2;

var getPages = function (accumulator, cursor) {
  var pages = accumulator || [];
  var query = peopleRef.orderByKey().limitToFirst(pageLength + 1); // limitToFirst starts from the top of the sorted list
  if (cursor) { // If no cursor, start at beginning of collection... otherwise, start at the cursor
    query = query.startAt(cursor);  // Don't forget to overwrite the query variable!
  }

  return query.once('value')
    .then(function (snaps) {
      var page = [];
      var extraRecord;
      snaps.forEach(function (childSnap) {
        page.push({
          id: childSnap.getKey(),
          name: childSnap.val().name
        });
      });
      
      if (page.length > pageLength) {
        extraRecord = page.pop();
        pages.push(page);
        console.log(pages, extraRecord.id);
        return getPages(pages, extraRecord.id);
      } else {
        pages.push(page);
        return Promise.resolve(pages);
      }
    });
};
getPages()
  .then(function (pages) {
    console.log('pages', JSON.stringify(pages));
  });
```

### Keys-based pagination
Keys-based pagination differs from cursor pagination in that you first request all of the child keys using a REST call and then create page breaks from the list of keys. It's great when you have a limited number of child records, because you know exactly how many pages you have and you can jump backwards and forwards through the pagination.

The following example uses keys-based pagination to return an array of all of the pages. Note, this is just an example. You'd never request all of the data right off the bat like this. In regular, non-demo practice you'll create a list of page keys and only request the data as needed when your user jumps to a specific page.

Try running this locally like you did for the cursor pagination code to see it in action.

***Keys-based Pagination***
```
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

axios.get(peopleUrl)
  .then(function (res) {
    var keys = Object.keys(res.data).sort(function (a) {
      // We're sorting with parseInt because we're using SWAPI keys.
      // Firebase push keys work fine with the default sort, i.e., Object.keys(res.data).sort();
      return parseInt(a);
    }).reverse(); // Always sort keys to guarantee order!!!
    var keysLength = keys.length;
    var promises = [];

    for (var i = pageLength; i <= keysLength; i += pageLength) {
      // i =  2, 4, 6, 8, 10... so subtract 1 to get the zero-indexed array key
      var key = keys[i - 1]; 
      // limitToLast starts at the bottom and reads up the list. endAt tells us from
      // where to start reading up... so if we have keys 1...10, a pageLength of 2
      // and endAt(4), the query will return records 4 and 3. It starts at the end
      // and reads backwards, returning only 2 records. 
      var query = peopleRef.orderByKey().limitToLast(pageLength).endAt(key);
      promises.push(query.once('value'));
    }

    Promise.all(promises)
      .then(function (snaps) {
        var pages = [];
        snaps.forEach(function (snap) {
          var page = [];
          snap.forEach(function (childSnap) {
            page.push({
              id: childSnap.getKey(),
              name: childSnap.val().name
            });
          });
          pages.push(page);
        });
        pages.forEach(function (page, key) {
          console.log('page %s: %s', key, JSON.stringify(page));
        });
        process.exit();
      })
      .catch(function (err) {
        console.log('error', err);
      });
  });
```
### A quick summary, because this can be confusing
Let's be clear. These queries can be tricky to compose. I played around for about an hour to get both of these pagination examples working, and it wasn't the first time that I've written these kinds of pagination.

Here's what you need to remember:
- Always specify your ```orderBy*``` parameter first
- Use ```limitToFirst``` to read from the top of the list (ascending sort order)
- Use ```limitToLast``` to read from the bottom of the list (descending sort order)
- If you're using ```limitToFirst```, use ```startAt``` to start reading from the middle of the list. Otherwise, ```limitToFirst``` will default to reading from the very top of the list.
- If you're using ```limitToLast```, use ```endAt``` to start reading from the middle of the list. Otherwise, ```limitToLast``` will default to reading from the very bottom of the list.
- Don't pair up ```limitToFirst``` with ```endAt```.
- Don't pair up ```limitToLast``` with ```startAt```.

That's Firebase queries. Play around with these pagination examples and you'll get the hang of it.