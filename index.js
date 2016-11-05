var JsonViewEngine = require('./lib/engine');

module.exports = function (options) {
	var obj = new JsonViewEngine(options);
	return obj.engine.bind(obj);
};

new JsonViewEngine()
