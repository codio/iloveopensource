/**
 * Author: krasu
 * Date: 7/29/13
 * Time: 9:14 PM
 */
var http = require('http'),
    path = require('path'),
    express = require('express'),
    cfg = require('./config'),
    logger = require('./app/utils/logger'),
    MongoStore = require('connect-mongo')(express),
    mongoose = require('mongoose'),
    app = express();

mongoose.connect(cfg.mongodbUri)
mongoose.connection.on('error', function (err) {
    logger.error('Mongo connection error', err.message);
});
mongoose.connection.once('open', function callback () {
    logger.info("Connected to MongoDB");
});

// Bootstrap models
require('./app/models')

var passport = require('./app/middleware/passport')
var sessionStore = new MongoStore({
	url: cfg.mongodbUri
})

app.locals._ = require('lodash');
app.locals.titleBuilder = require('./app/utils/title-builder');
app.locals.jsPath = cfg.jsPath;
app.locals.siteUrl = cfg.fullUrl();

// all environments
app.set('port', cfg.port);
app.set('views', __dirname + '/app/views');
app.set('view engine', 'ejs');


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.logger('dev'));
app.use(express.favicon(path.join(__dirname, 'public/favicon.ico')));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser(cfg.sessionSecret));
app.use(express.session({
    secret: cfg.sessionSecret,
    store: sessionStore
}));
app.use(passport.initialize());
app.use(passport.session());
require('./app/middleware/users')(app)
app.use(app.router);
require('./app/routes')(app)
if (cfg.isDev) {
    app.use(express.errorHandler());
} else {
    require('./app/middleware/errors')(app)
}

var server = http.createServer(app)

require('./app/utils/socket.io')(server, sessionStore)

require('./app/utils/mailer').fillTemplates(path.join(__dirname, 'app/views/emails/'), function (error) {
    if (error) throw error;

    server.listen(app.get('port'), function () {
        logger.info('Express server listening on port ' + app.get('port'));
    });
})

