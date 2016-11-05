# express-json-views
A JSON view engine for express to render objects, lists with views, sub-views and helpers.

## Motivation

## Setup
```bash
$ npm install --save express-json-views
```

```js
var app = require('express')();
var viewEngine = require('express-json-views');

app.engine('json', viewEngine({
       helpers: require('./views/helpers')
   }));
app.set('views', path.join(__dirname, '/views')); // specify the views directory
app.set('view engine', 'json'); // register the template engine
```

## Features & examples

## Test
```bash
$ npm test
```
