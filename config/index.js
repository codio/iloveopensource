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
config.hostname = process.env.HOSTNAME || 'iloveopensource.io';
//config.isHttps used to create site links
config.isHttps = false;
//config.usePort used to create site links
config.usePort = false;
//config.mongodb connection Uri string
config.mongodbUri = process.env.MONGOHQ_URL || 'mongodb://localhost/ilos'
//config.github app settings
config.github = {
	clientId: process.env.GITHUB_CLIENT_ID || '',
	clientSecret: process.env.GITHUB_CLIENT_SECRET || ''
}
//config.emails.from - name of sender
//config.emails.to - email of support
//config.emails.transport - nodemailer email transport
config.emails = {
	from: 'robo@'+config.hostname,
	to: 'support@codio.com',
	transport: nodemailer.createTransport('sendmail', {
		path: '/usr/sbin/sendmail',
		args: ['-i', '-t']
	})
}
//config.sessionSecret to hash sessions
config.sessionSecret = process.env.SESSION_SECRET || 's,dfjsklfj3k45j34k5kjLKj87093476ukvj jlk';
//config.port on which app should run
config.port = process.env.PORT || '5000';
//config.port on which app should run
config.jsPath = '/js/build/'

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