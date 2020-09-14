var should = require('should');
var path = require('path');
var JsonViewEngine = require('../lib/engine');
var settings = {
	views: path.join(__dirname, 'views')
};
var Promise = require('bluebird');

function getViewPath(view) {
	return path.join(settings.views, view + '.json');
}

describe('JsonViewEngine', function () {

	it('should load a view', function () {

		var engine = new JsonViewEngine();
		return engine.loadView(getViewPath('post'))
			.then(function (view) {
				should(view).eql(require('./views/post'));
			});

	});

	it('should render empty data', function () {

		var engine = new JsonViewEngine();
		return engine.renderData({test: {}}, {}, settings)
			.then(function (rendered) {
				should(rendered).eql({
					test: undefined
				});
			});

	});

	it('should render data', function () {

		var engine = new JsonViewEngine();
		var data = {hello: 'world', date: new Date('2020-09-14')};

		return engine.renderData({hello: {}, date: {}}, data, settings)
			.then(function (rendered) {
				should(rendered).eql(data);
			});

	});

	it('should render with nested object', function () {
		var engine = new JsonViewEngine();
		var data = {
			address: {
				city: {
					name: 'HCM',
					code: '700000'
				},
				street: 'TCH10'
			}
		};
		var view = {
			address: {
				city: {
					name: {},
					code: {}
				},
				street: {}
			}
		};

		return engine.renderData(view, data, settings)
			.then(function (rendered) {
				should(rendered).eql(data);
			});
	});

	it('should render an array of objects', async () => {
		var engine = new JsonViewEngine();
		var data = [{
			firstname: 'John',
			lastname: 'Doe',
			age: 27
		}, {
			firstname: 'Jane',
			lastname: 'Doe',
			age: 26
		}];

		return engine.renderData({
			firstname: {},
			lastname: {}
		}, data, settings)
			.then(function (rendered) {
				should(rendered).eql([{
					firstname: 'John',
					lastname: 'Doe',
				}, {
					firstname: 'Jane',
					lastname: 'Doe',
				}]);

			});
	});

	describe('ViewHelpers', function () {

		it('should format a value with a helper function', function () {

			var helpers = {
				prefix: function (value) {
					return 'hello_' + value;
				}
			};
			var engine = new JsonViewEngine({helpers: helpers});
			var data = {hello: 'world'};
			var view = {
				hello: {
					format: 'prefix'
				}
			};

			return engine.renderData(view, data, settings)
				.then(function (rendered) {
					should(rendered).eql({
						hello: 'hello_world'
					});
				});
		});

		it('should format a value (nested object) with a helper function', function () {
			var helpers = {
				getCityName: function (name) {
					return 'hello_' + name;
				}
			};
			var engine = new JsonViewEngine({helpers: helpers});
			var data = {
				address: {
					city: {
						name: 'HCM',
					}
				}
			};
			var view = {
				address: {
					city: {
						name: {
							format: 'getCityName'
						},
					}
				}
			};

			return engine.renderData(view, data, settings)
				.then(function (rendered) {
					should(rendered.address.city.name).eql('hello_HCM');
				});
		});

		it('should pass full object to helper function', function () {

			var helpers = {
				prefix: function (value, obj) {
					return 'hello_' + obj.hello;
				}
			};
			var engine = new JsonViewEngine({helpers: helpers});
			var data = {hello: 'world'};
			var view = {
				dynamic: {
					format: 'prefix'
				}
			};

			return engine.renderData(view, data, settings)
				.then(function (rendered) {
					should(rendered).eql({
						dynamic: 'hello_world'
					});
				});
		});

		it('should use a promise in a view helper', function () {

			var helpers = {
				calculate: function (value) {
					return Promise.resolve(value + '_42');
				}
			};
			var engine = new JsonViewEngine({helpers: helpers});
			var data = {value: 'answer'};
			var view = {
				value: {
					format: 'calculate'
				}
			};

			return engine.renderData(view, data, settings)
				.then(function (rendered) {
					should(rendered).eql({
						value: 'answer_42'
					});
				});
		});

	});


});
