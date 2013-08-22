/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/5/13
 * Time: 11:37 AM
 This is example config file,
 for saving actual settings place config.<ENVIRONMENT>.js
 in this folder on your server
 */
var _ = require('lodash'),
	fs = require('fs'),
	path = require('path'),
	nodemailer = require("nodemailer")

var config = {};
config.env = process.env.NODE_ENV || 'development';
config.isDev = config.env === 'development';

config.hostname = 'localhost';
config.port = '8080';

config.mongodb = {
	name: 'oss',
	host: 'localhost'
}

config.github = {
	clientId: 'clientId',
	clientSecret: 'clientSecret',
	usePort: false
}

config.sessionSecret = 's,dfjsklfj3k45j34k5kjLKj87093476ukvj jlk';
config.path = path.join(__dirname, 'config.' + config.env + '.js')
config.jsPath = '/js/'

config.emails = {
	from: 'robo@ilos.com',
	to: 'support@codio.com',
	transport: nodemailer.createTransport('sendmail', {
		path: '/usr/sbin/sendmail',
		args: ['-i', '-t']
	})
}

if (fs.existsSync(config.path)) {
	config = _.extend({}, config, require(config.path))
}

module.exports = config