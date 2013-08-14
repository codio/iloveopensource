/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/5/13
 * Time: 11:37 AM
 */
var _ = require('lodash'),
	fs = require('fs'),
	path = require('path')

var config = {};
config.env = process.env.NODE_ENV || 'development';
config.isDev = config.env === 'development';

config.hostname = 'localhost';
config.port = '8080';

config.sessionSecret = 's,dfjsklfj3k45j34k5kjLKj87093476ukvj jlk';
config.path = path.join(__dirname, 'config.' + config.env + '.js')
config.jsPath = '/js/'

if (fs.existsSync(config.path)) {
	config = _.extend({}, config, require(config.path))
}

module.exports = config