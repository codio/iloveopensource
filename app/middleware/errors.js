/**
 * Author: krasu
 * Date: 8/18/13
 * Time: 7:35 PM
 */
var logger = require('winston')

module.exports = function (app) {
    //handling request errors
    app.use(function (req, res, next) {
        res.status(404);
        logger.warn('404 not found: %s', req.originalUrl)

        if (req.accepts('html')) {
            res.render('404');
            return;
        }

        if (req.accepts('json')) {
            res.send({ error: 'Not found' });
            return;
        }

        res.type('txt').send('Not found');
    });

    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        logger.error('Route Error', {
            error: err,
            req: req
        })

        if (req.accepts('html')) {
            return res.render('500', { error: err });
        }

        if (req.accepts('json')) {
            return res.send({ error: err });
        }
    });
}
