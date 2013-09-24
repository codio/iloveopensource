/**
 * Author: krasu
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
//config.env used to quickly get environment app wide
config.env = process.env.NODE_ENV || 'development';
config.isDev = config.env === 'development';

//config.hostname used to create site links
config.hostname = 'www.iloveopensource.io';
//config.isHttps used to create site links
config.isHttps = false;
//config.usePort used to create site links
config.usePort = false;
//config.mongodb connection Uri string
config.mongodbUri = 'mongodb://localhost/ilos'
//config.github app settings
config.github = {
	clientId: '',
	clientSecret: ''
}
//config.emails.from - name of sender
//config.emails.to - email of support
//config.emails.transport - nodemailer email transport
config.emails = {
	from: 'robo@' + config.hostname,
	to: 'support@codio.com',
	transport: nodemailer.createTransport('sendmail', {
		path: '/usr/sbin/sendmail',
		args: ['-i', '-t']
	})
}
//config.sessionSecret to hash sessions
config.sessionSecret = 's,dfjsklfj3k45j34k5kjLKj87093476ukvj jlk';
//config.port on which app should run
config.port = '5000';
//config.port on which app should run
config.jsPath = '/js/'

config.fullUrl = function () {
	return 'http'
		+ (this.isHttps ? 's' : '')
		+ '://'
		+ this.hostname
		+ (this.usePort ? ':' + this.port : '')
}

config.path = path.join(__dirname, 'config.' + config.env + '.js')

if (fs.existsSync(config.path)) {
	config = _.extend({}, config, require(config.path))
}

module.exports = config