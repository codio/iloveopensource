/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 7/29/13
 * Time: 9:14 PM
 */
var http = require('http'),
	path = require('path'),
	express = require('express'),
	cfg = require('./config'),
	MongoStore = require('connect-mongo')(express),
	mongoose = require('mongoose'),
	app = express();

mongoose.connect('mongodb://' + cfg.mongodb.host + '/' + cfg.mongodb.name)

// Bootstrap models
require('./app/models')

var passport = require('./app/middleware/passport')

app.locals._ = require('lodash');
app.locals.titleBuilder = require('./app/utils/title-builder');
app.locals.jsPath = cfg.jsPath;

// all environments
app.set('port', cfg.port);
app.set('views', __dirname + '/app/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser(cfg.sessionSecret));
app.use(express.session({
	secret: cfg.sessionSecret,
	store: new MongoStore({
		db: cfg.mongodb.name
	})
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

require('./app/routes')(app)

// development only
if ('development' == cfg.env) {
	app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});
