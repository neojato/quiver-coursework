## Model data for performant Firebase apps
Firebase provides very little guidance on how to structure your unstructured JSON data. Firebase provides push keys and disincetivizes us from using numbered list keys... but that's it. The rest of your data model is up to you.

Let's review a few best practices that will make your Firebase experience fun and fresh.

### Normalization / Shallow data structures
Most JSON data structures are completely denormalized, meaning that we don't tend to use references with JSON. That tendency is easy to carry over to Firebase, but that's a mistake!

Firebase is happiest when you keep your data structures shallow, and you'll need to normalize your data to achieve that. Let's review two example data structure. First, the slow and inefficient... deeply-nested data.

***Deep Data <anti-pattern alert!!!>***
```
{
    "users": {
        "user1": {
            "email": "user1@gmail.com",
            "transactions": {
                "transaction1": {
                    "total": "500",
                    "products": {
                        "product1": "paper airplanes",
                        "product2": "tooth picks"
                    }
                },
                "transaction2": {
                    "total": "250",
                    "products": {
                        "product1": "rocks and dirt",
                        "product2": "spatulas"
                    }
                }
            }
        }
    }
}
```

Notice in the previous data structure how every user attribute contains all of it's children. It has an email address and a collection of transactions. This model is inefficient, because I can't loop through all of my users and just pull the email addresses. I can pull an individual users' email address efficiently with Firebase, but I can't pull _just_ email addresses for a group of users. If I needed to loop through 1000 users I would have to request all of those users' transactions along with their email addresses.

Now let's look at the happier, shallow data structure:

***Shallow  Data***
```
{
    "users": {
        "user1": {
            "email": "user1@gmail.com"
        }
    },
    "transactions": {
        "user1": {
            "transaction1": {
                "total": "500",
                "products": {
                    "product1": "paper airplanes",
                    "product2": "tooth picks"
                }
            },
            "transaction2": {
                "total": "250",
                "products": {
                    "product1": "rocks and dirt",
                    "product2": "spatulas"
                }
            }
        }
    }
}
``` 

Notice how the ```/users/user1``` attribute has only one child node, the user's email address. The user's transactions are still accessible via ```transactions/user1```, but I can efficiently loop through my users' email addresses without pulling down excess data.

The downside to shallow data structures is that I occassionally need to create a second ref to pull in transactions... they're not available on my ```users/{userId}``` ref. We have to constantly balance normalization (shallow structures) vs denormalization (deep structure) based on how we want to use our data.

If we find that we're always pulling email addresses along with transactions, maybe we need to duplicate the users' email addresses in the transactions like this:

```
...
"transaction1": {
    "email": "user1@gmail.com",
    "total": "500",
    "products": {
        "product1": "paper airplanes",
        "product2": "tooth picks"
    }
}
...
``` 

Don't be afraid of duplicating data to speed up your reads. Yes, duplicating data can slow your write a little bit and can be obnoxious to manage, but duplicate data will enable your apps to scale effortlessly to millions of reads.

## Stream your data
Modeling your data as streams provides great scalability and prevents large queries that slow down your Firebase.

Consider a data structure for a chat application:

***Structured Chat Data***
```
{
    "userChats": {
        "user1": {
            "chat1": {
                "message": "First!"
            },
            "chat2": {
                "message": "I'm still here..."
            }
        },
        "user2": {
            "chat1": {
                "message": "Hey user one."
            },
            "chat2": {
                "message": "Where did you go?"
            }
        }
    }
}
```

The structured chat data above is too deeply nested. You'll have difficulty querying this data, because Firebase can only query on one child node at a time, and it can't be a "grandchild" node... it must be a direct child of the list's top level. In this case, you can't query the ```userChats``` node because none of it's direct children are values, they're all nested nodes.

Now let's consider a flatter structure:

***Stream Chat Data***
```
{
    "chats": {
        "chat1": {
            "user": "user1",
            "username": "Chris",
            "message": "First!"
        },
        "chat2": {
            "user": "user2",
            "username": "Melissa",
            "message": "Hey user one."
        },
        "chat3": {
            "user": "user2",
            "username": "Melissa",
            "message": "Where did you go?"
        },
        "chat4": {
            "user": "user1",
            "username": "Chris",
            "message": "I'm still here..."
        }
    }
}
```

In this case we've named the top node "chats", and we've duplicated the user ids for each chat. We can now query the ```chats/``` node on the ```user``` like so:

```
chatsRef.orderByValue('user').equalTo('user1').once('value', function (snap) {
    var user1Chats = snap.val();
    console.log('user1 chats!', user1Chats);
});
```

We can also listen to the ```child_added``` event to add chats to our UI:

```
chatsRef.on('child_added', function (snap) {
    console.log("let's add this chat to our UI!", snap.val());
});
```

Make sure to treat your data structures like streams, meaning long, shallow lists of data. Don't nest any more than is necessary for your needs. Also, do not be afraid to duplicate data such as username, user ids, object titles, etc. Try to match your data structure to your UI. In the previous example, each "chat" object should have the username attached to it, because attempting to join usernames to chats would be incredibly expensive.

### Prefer child_added events to value events
Firebase provides two primary event types for retrieving your data, ```value``` and ```child_added```. The ```value``` event returns all child nodes in an unsorted JSON object and then returns all nodes every time there's any change to any of the child nodes. The ```child_added``` event fires once for each existing child and then fires again every time a child is added. Since ```child_added``` fires once for every child, it can respect query ```orderBy*``` parameters.

Most beginning Firebase users initially prefer the ```value``` event because it's so easy to reason about; however, more sophisticated users tend to use ```child_added``` whereever possible, because ```child_added``` places less load on the server running your Firebase, so it scales better. Also, since ```child_added``` respects sort order, you don't have to manually sort the data on your client.

## Queues FTW
We tend to think about Firebase as a front-end, client-side technology, but it provides a great architecture for highly-scalable server processes: Queues!

Firebase integrates with Google Cloud Functions to create lightweight Node.js tasks that are fired off by adding items to a Firebase list. Users can add jobs to a queue and your Cloud Functions can listen to that queue, process the job, remove the job from the queue and even add another job to a different queue for further processing.

The following example illustrates a simple queue data structure that takes proposed username changes and proposed shopping cart checkouts from users. In this example user1 has requested a username change and user2 has requested a shopping cart checkout. The server has already approved a username change for user3 and has added it to the ```serverQueues/updateUsername/``` node for further processing. The server has also approved a ```userQueues/cartCheckout``` job for user4 and has added user4's credit card to the ```serverQueues/chargeCard``` node for payment processing.

***Queues Example***
```
{
    "userQueues": {
        "changeUsername": {
            "user1": {
                "proposedUsername": "T-Rex"
            }
        },
        "cartCheckout": {
            "user2": {
                "total": 750,
                "products": {
                    "somePushKey": "tongue depressors",
                    "anotherPushKey": "deoderant"
                }
            }
        }
    },
    "serverQueues": {
        "updateUsername": {
            "somePushKey": {
                "user": "user3",
                "username": "Charlie"
            }
        },
        "chargeCard": {
            "somePushKey": {
                "user": "user4",
                "total": 250,
                "cartToken": "1234asdf"
            }
        }
    }
}
```

Notice how the ```userQueues/changeUsername/$user``` node and the ```userQueues/cartCheckout/$user``` node use each user's id as child keys? We would typically use push keys for a job queue like this, but these nodes have to be user-writeable so that our clients can add jobs to the queues. By using the user id as the child key, we can write a security rule to enforce that users must be authenticated and can only queue one job at a time:

```
{
    "rules": {
        "userQueues": {
            "$queueName": {
                "$userId": {
                    ".write": "auth.uid == $userId"
                }
            }
        }
    }
}
``` 

The security rules statement above grants write privileges to any user whose auth uid matches the user id for ```usersQueues/$queueName/$userId```. Security rules default both read and write privileges to false. Security rules match by node name, but also allow wildcard node names that begin with ```$```. So in this case, we're adding a rule to ```userQueues``` followed by a wildcard ```$queueName``` and a wildcard ```$userId```. The rule grants write access to the ```userQueues/$queueName/$userId``` node if the user is authenticated and the user's authentication uid matches the node name. So if your auth uid is ```user6```, you _can_ write to ```usersQueues/changeUsername/user6``` or ```usersQueues/cartCheckout/user6``` or ```usersQueues/anyOtherQueueName/user6```. However, ```user6``` cannot write to ```userQueues/changeUsername/user7```, because the ```user7``` part of the path does not match user6's uid, ```user6```.

In practice, these uids are much longer than ```user1``` or ```user2``` and they're determined programatically by Firebase Authentication. 

All nodes in this data structure are available to the server with full read/write privileges, which has admin privileges through it's ```/service-account.json``` api key. So users can add one job at a time to their ```userQueues/$queueName/$userId``` nodes, but only the server can add jobs to the ```serverQueues/``` data tree. 