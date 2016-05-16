# Proposal

Create a series of modules to teach Firebase and Polymer.

These modules will release in three phases:

1. Firebase - requires Javascript
2. Polymer - requires HTML/CSS/Javascript
3. Polymer + Firebase: Build a fully-featured application - requires HTML/CSS/Javascript/Firebase/Polymer

The first two modules will be available a la carte. The third module will include the first two as prerequisites.

I'm thinking $40 for the individual modules and $100 for the full application bundle

# Firebase Only Modules

This class will be a series of node.js scripts to demonstrate the API and simple, unstyled index.html files to show browser implementations.

## Introduction
- What is Firebase
- Advantages of Firebase
- Disadvantages of Firebase
- Create your first Firebase
- Auth
- Database
- Storage
- Hosting

## Node Client
- Add data by hand
- Add data from a node.js file

## Querying Data
- on value, child_added, child_removed
- orderBy*
- limitTo*
- startAt, endAt
- pagination

## Data Modeling
- Normalization
- Shallow data
- Streams
- Queues

## Authentication
- Enable email/password, Google and Facebook
- Obtain Google and Facebook tokens
- Log in with individual service
- Link services

## Security Rules
- .read, .write, .validate, .indexOn
- Securing individual and wildcard nodes
- Walking the data structure
- Bolt
- Deploying rules

## Cloud Functions
- Treating data as streams
- Configuring a local job runner
- Processing a login stream
- Deploying to gCloud

## Storage
- Store images

## Sample App
- Implement authentication
- Implement auth cloud functions
- Secure data routes
- Upload and display images
- Deploy finished app

# Polymer Only Modules

## Introduction
- The promise of web components - Everything is an element
- Polymer polyfills as necessary
- Does not require transpilation, es6, TypeScript, etc.
- The Polymer API imitates the native DOM with properties, attributes and events
- The Polymer Elements Catalog includes everything you need to get started

## Create your first custom element
- Print "Hello World"
- Print the current time
- Concept: local vs light DOM

## Extend a native element
- Create a styled input element
- Create a styled button element

## Lifecycle Callbacks
- Created
- Ready
- Attached
- Detached
- attributeChanged
- Exercise: Create a sign-in form with email and password fields and three submit buttons. Attach some basic validation within the ```attached``` callback.

## Declared Properties
- Single-line declaration
- Detailed declaration: type, value, reflectToAttribute, readOnly, notify, computed, observer
- camelCase vs dashes
- Observers array
- Observing object attributes, array mutations and deep object sub-properties
- Binding sub-properties: ```<input value="{{user.name::input}}">```
- Array mutation methods and using notifySplices to register out-of-band array mutations
- Built in *-changed property notification events
- readOnly properties and built-in setter functions
- Computed properties
- Exercise: Create a to-do application using ```<iron-localstorage>```

## Local DOM
- Defining a  ```<template>```
- Automatic node finding - Does not work for ```<template is="dom-if" if="{{someAttribute}}"></template>```
- The ```<content></content>``` tag provides for injection of the element's light DOM into its local DOM
- Exercise: Create a custom element that extends ```<ul>```, embeds it into a ```<paper-material>``` element and styles it as a bunch of pill buttons

## Events
- Annotated event listeners
- Attached callback registration
- Firing custom events
- on-* event listeners
- Exercise: Create a custom ```<toolbar-controller>``` element and a custom ```<query-data>``` element. The ```<query-data>``` element queries arbitrary URLS and fires events based on the succes or failure of each call. The ```<toolbar-controller``` pops toast alerts and changes colors to represent its current state.

## Data Binding
- Square brackets vs curly brackets
- Injecting attributes into templates
- Two-way binding
- One-way downward binding (with square brackets or without notify)
- One-way upward binding (readOnly)
- *-changed events are fired if ```notify: true```
- Binding to object sub-properties
- Using ```set(path, value)``` or ```notifyPath(path, value)``` to fire attribute events
- Only ```{{!someAttribute}}``` is supported as a binding expression
- Computed bindings ```computeFullName(first, last)```
- Annotated attribute binding vs property binding ```<some-element class$="{{myCustomClass}}"></some-element>```
- Iterating through arrays
- Exercise: Create an address form using ```<iron-localstorage>``` and validating using [lob.com](https://lob.com/verification/address). Display the address once it's validated using computed bindings to display data directly out of localStorage

## Behaviors
- Define behaviors to share properties and functions across multiple custom elements
- Exercise: Create two custom elements and one behavior. The behavior accepts a color property and styles all text accordingly. The two custom elements display random text and inherit from the color-changing behavior

## Utility Functions
- fire
- async/cancelAsync
- debounce/cancelDebounce
- Exercise: Create a simple form and debounce input changes to only save them once every 500 millis

## Sample App
- Create a three-page invoice app
- Page One: List invoices
- Page Two: Create invoice
- Page Three: Invoice details

# Polymer + Firebase Production-Worthy Application

## Requirements
- Authenticate with Google, Facebook or email/password
- Save user account details
- Process new user accounts with Cloud Functions
- Upload images with titles and descriptions
- Downsample images to lower resolutions for web display
- Log image uploads to a private data endpoint
- Browse uploaded images with urls and CommonMark
- Paginate images and enable inifite scroll
- Hover or click to auto-highlight urls/CommonMark for quick copying
- Edit image titles/descriptions and delete images
- Create an "admin" flag on a user and create a page just for admins that lists out the upload logs
- Secure data structure using Bolt
- Vulcanize the app to a single file
- Deploy website
- Deploy Cloud Functions
- Extra Credit: Create an image tagging system for quick image filtering
- Extra Credit: Export logs to Google Datastore as they age

## Scaffold App
- Sketch out the app with pen and paper
- Create an env.json file and a node task to load it to Firebase
- Create an app dom-module
- Create routes using carbon-route
- Create a toolbar-controller

## Authentication
- Create an auth-controller element that leverages firbase-ui
- Auth-controller element manages the user state

## Process User Accounts
- All logins add an item to a queue
- Create a Cloud Function to observe that queue and configure/update users accounts as needed
- Run Cloud Function using local process

## User Account Details
- Quickie form fields that allow direct editing of a user's preferences

## Upload images
- Use an input of type "file" to upload files to browser
- Resize images using CamanJS or image-manipulation
- Upload images to Firebase
- Use a Cloud Function to log image uploads

## Browse Images
- Create an iron-list to display all images
- Do a shallow Firebase REST query to paginate images
- Implement infinite scroll
- Implement page jumping
- Implement title searching
- Implement auto-selecting text on hover or click

## Edit/Delete
- Use confirmation dialog to delete images
- Live edit titles/descriptions

## Admin
- Create admin flag
- Create a new route and an iron-list to display upload logs

## Security Rules
- Use Bolt
- Create role-based permissions

## Deploy
- Vulcanize
- firebase.js
- Deploy

## Extra Credit
- Image tagging system uses a ```<datalist>``` element [see link](http://blog.teamtreehouse.com/creating-autocomplete-dropdowns-datalist-element) to prompt for existing tags
- A Cloud Function runs every time an admin logs in and archives any logs over a day old.
