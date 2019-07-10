# express-json-views
A JSON view engine for the express framework to render
objects and arrays with views written in JSON and helper functions.

[![npm version](https://badge.fury.io/js/express-json-views.svg)](https://badge.fury.io/js/express-json-views)
[![Build Status](https://travis-ci.org/freshfox/express-json-views.svg?branch=master)](https://travis-ci.org/freshfox/express-json-views)

## Motivation
Even though ```express``` can send JSON responses out of the box by just retuning, in a lot
of cases the response object or database models needs to be formatted. Think like DTOs in Java.
Unnecessary or sensitive information like passwords need to be omitted,
values need to be formatted and sub-objects/lists need to be
altered as well.

### Features
- Recursively render objects and arrays
- Omit values
- Rename object keys
- Format values using helpers
- Sub views and lists
- View caching

## Setup
```bash
$ npm install express-json-views
$ yarn add express-json-views
```

```js
var app = require('express')();
var viewEngine = require('express-json-views');

app.engine('json', viewEngine({
       helpers: require('./views/helpers')
   }));
app.set('views', __dirname + '/views');
app.set('view engine', 'json');
```

## Features & examples

### Defining views
Views are defined using JSON files and located in a single directory in your project.
```json
{
	"id": {},
	"slug": {
		"format": "getPostSlug"
	},
	"title": {},
	"content": {
		"from": "content_text"
	},
	"author": {
		"view": "user"
	},
	"comments": {
		"view": "comment"
	},
	"published_date": {}
}
```
The keys of the view are the keys which will be rendered into to resulting object.
The default configuration ```{}``` just copies the value from the passed data.
Possible configurations are:

- **from**: Uses this value to lookup the value in the data object instead of the view key.
- **format**: Calls a helper function with this name. Passes the value and the full object as arguments.
- **view**: Defines the view if this value should be rendered with a different view. Value must be an ```Array``` or objects or an ```Object```.

### Rendering objects and lists
You don't have to worry about whether you want to render a single object or a list of objects.
The view engine detects if you pass an array and will iterate over it. call ```res.render(...)```
and pass the view name and an object with a property called **data** which contains your data.
```js

app.get('/posts', function (req, res) {

	var posts; // Query from database

	res.render('post', {
		data: posts
	});

});
```

### Helpers
To define helpers you pass an object of functions when creating the view engine.
```js
var helpers = {
	date: function (value, object) {
		if (!value) {
        	return null;
        }
        return dateFormat(value, 'yyyy-mm-dd');
	}
};

app.engine('json', viewEngine({ helpers: helpers }));
```

Helper functions get 2 arguments, value and the full object. To calculate a value based on other values
in the object you can use the second argument.
```js
var helpers = {
	comment_count: function (value, object) {
		// Value will be null since this is a dynamic property and not present in the data object
		return object.comments ? object.comments.length : 0;
	}
};
```
If you return a ```Promise``` the view engine will resolve use it. Though I would strongly advise you, not to do async calls here.

## Test
```bash
$ npm test
```
