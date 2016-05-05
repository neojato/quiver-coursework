# Introduction

## What is Firebase
Firebase powers the back end of internet-connected applications, freeing developers to focus on crafting fantastic user experienced.

Every app needs some sort of back end to store and process data. Firebase is a generic back end that gives your app super powers including the following:

- Authentication
- Real-time data
- Data security
- File storage
- Hosting

If you've build web or native applications without Firebase, you've implemented these things on your own, and you've spent days, weeks and months building and maintaining these systems. Firebase takes care of these tasks for you. Write your front-end and your business logic and be done with it.

## Advantages of Firebase
- Email & password, Google, Facebook, and Github authentication
- Real-time data
- Ready-made api
- Built in security at the data node level
- File storage backed by Google Cloud Storage
- Static file hosting
- Treat data as streams to build highly scalable applications

## Disadvantages of Firebase
- Limited query abilities due to Firebase's data stream model
- Traditional relational data models are not applicable to NoSQL; therefore, your SQL chops will not transfer

## Create your first Firebase
Let's get start by creating a Firebase project on Google Cloud.

Navigate to [https://console.firebase.google.com/](https://console.firebase.google.com/). Log in if necessary, and create a new project. We'll use this project throughout the entire course, so name it something general like "Firebase Demos", "Boba Fett Forever", "Data Explosions In The Sky"... I like to keep my project names super literal—"Invoice App"—or Star Wars themed—"Moof Milker".

The Firebase console is changing all of the time, so you'll need to give yourself a little tour. Take five minutes to just click on all of the buttons, then come back here and we'll review.

## Auth
Firebase auth has a built in email/password authentication system. It also support OAuth2 for Google, Facebook, Twitter and GitHub. We'll focus on email/password authentication for the most part. Firebase's OAuth2 system is well-documented and mostly copy/paste.

If you've ever written an authentication system, let's commiserate for a moment. Custom authentication is miserable. I will never write an auth system again for as long as I live. I fell in love with Firebase Auth at first sight, and the flame has never waivered. Sometimes I get frustrated. Sometimes we fight. But I never forget the cold, dark abyss of a custom auth system. I count my blessings.

Oh, and Firebase Auth integrates directly into Firebase Database, so you can use it to control access to your data. I'm writing this as if it's an afterthought. It's not. It's the second reason that you will love Firebase Auth.  

## Database
Real-time data is the way of the future. Nothing compares to it.

Every other database out there requires you to make HTTP calls to get and sync your data. Every other database gives you data only when you ask for it.

When you connect your app to Firebase, you're not connecting through normal HTTP. You're connecting through a WebSocket. WebSockets are [much, much faster than HTTP](http://www.websocket.org/quantum.html). You don't have to make individual WebSocket calls, because one socket connection is plenty. All of your data syncs automagically through that single WebSocket as fast as your client's network can carry it.

Firebase send you new data as soon as it's updated. When your client saves a change to the data, all connected clients receive the updated data almost instantly. 

## Storage

## Hosting

## The Rest

