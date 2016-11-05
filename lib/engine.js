var fs = require('graceful-fs');
var _ = require('lodash');

var Promise = require('bluebird');
var readFile = Promise.promisify(fs.readFile);
var Path = require('path');


module.exports = function (options) {
	var obj = new JsonViewEngine(options);
	return obj.engine.bind(obj);
};

function JsonViewEngine(options) {
	this.helpers = options.helpers || {};
	this.cache = {};
}

JsonViewEngine.prototype.engine = function (filePath, options, callback) {

	var data = options.data;
	var settings = options.settings;
	var useCache = options.cache;
	this.render(filePath, data, settings, useCache)
		.then(function (rendered) {
			callback(null, rendered);
		})
		.catch(function (err) {
			callback(err);
		});
};

JsonViewEngine.prototype.render = function (filePath, data, settings, useCache) {
	var self = this;
	return this.loadView(filePath, data, settings, useCache)
		.then(function (viewObj) {
			return self.renderData(viewObj, data, settings, useCache)
		});
};

JsonViewEngine.prototype.loadView = function (filePath, data, settings, useCache) {
	if (useCache && this.cache[filePath]) {
		return Promise.resolve(this.cache[filePath]);
	}
	var self = this;
	return readFile(filePath)
		.then(function (content) {
			var view = JSON.parse(content);
			if (useCache) {
				self.cache[filePath] = view;
			}
			return view;
		});
};

JsonViewEngine.prototype.renderData = function (viewObj, data, settings, useCache) {
	if (_.isArray(data)) {
		var rendered = [];
		for (var i = 0; i < data.length; i++) {
			rendered.push(this.renderObject(viewObj, data[i], settings, useCache));
		}
		return Promise.all(rendered);
	} else {
		return this.renderObject(viewObj, data, settings);
	}
};

JsonViewEngine.prototype.renderObject = function (viewObj, data, settings, useCache) {
	var self = this;
	var rendered = _.mapValues(viewObj, function (options, attr) {
		var source = options.from || attr;
		var value = extract(data, source);

		if (options.view && _.isObject(value)) {
			var path = Path.resolve(Path.join(settings.views, options.view + '.json'));
			value = self.render(path, value, settings, useCache);

		} else if (options.format) {
			var formatFunction = self.helpers[options.format];
			if (formatFunction && _.isFunction(formatFunction)) {
				value = formatFunction.call(null, value, data);
			}
		}

		return value;
	});
	return Promise.props(rendered);
};

function extract(object, property) {
	var obj = object,
		parts = property.split('.'),
		part = parts.shift();

	while (part && obj) {
		obj = obj[part];
		part = parts.shift();
	}

	return obj;
}
