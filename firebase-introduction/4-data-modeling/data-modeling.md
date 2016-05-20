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

## Stream! Think of these things as streams!


## Data Modeling
- Normalization
- Shallow data
- Streams
- Queues